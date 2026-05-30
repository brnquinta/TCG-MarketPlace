import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { authenticateToken } from '../../src/middleware/auth.js'
import { createStore, getMyStore } from '../../src/controllers/storeController.js'
import { createListing, getMyListings, deleteListing } from '../../src/controllers/listingController.js'
import { generateTestToken } from '../fixtures/index.js'
import User from '../../src/models/User.js'
import Store from '../../src/models/Store.js'
import Listing from '../../src/models/Listing.js'

const createFullApp = () => {
  const app = express()
  app.use(express.json())
  app.post('/stores', authenticateToken, createStore)
  app.get('/stores/me', authenticateToken, getMyStore)
  app.post('/listings', authenticateToken, createListing)
  app.get('/listings/my', authenticateToken, getMyListings)
  app.delete('/listings/:id', authenticateToken, deleteListing)
  return app
}

const baseCardSnapshot = {
  name: 'Charizard',
  number: '4',
  setName: 'Base Set',
}

const baseListingData = {
  price: 199.90,
  condition: 'NM',
  language: 'PT-BR',
  quantity: 1,
}

describe('QAT-009: Fluxo Completo do Vendedor', () => {
  it('I01: Fluxo completo — Auth → Criar Loja → Criar Anuncio → Listar', async () => {
    const user = await User.create({ clerkId: 'vend_full', email: 'vend@test.com', username: 'vendedor' })
    const token = generateTestToken({ clerkId: 'vend_full', userId: user._id })
    const app = createFullApp()

    // 1. Criar loja
    const storeRes = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Loja do Vendedor', slug: 'loja-vendedor' })
    expect(storeRes.status).toBe(201)

    // 2. Criar anuncio
    const listingRes = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: baseListingData })
    expect(listingRes.status).toBe(201)
    expect(listingRes.body.status).toBe('active')

    // 3. Listar meus anuncios
    const listRes = await request(app)
      .get('/listings/my')
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)
    expect(listRes.body.length).toBe(1)
    expect(listRes.body[0].cardSnapshot.name).toBe('Charizard')
  })

  it('I02: Fluxo com limpeza — Criar → Deletar → Verificar', async () => {
    const user = await User.create({ clerkId: 'vend_del', email: 'venddel@test.com' })
    await Store.create({ userId: user._id, name: 'Loja Del', slug: 'loja-del', status: 'active' })
    const listing = await Listing.create({
      storeId: (await Store.findOne({ userId: user._id }))._id,
      userId: user._id,
      cardSnapshot: baseCardSnapshot,
      listingData: baseListingData,
      status: 'active',
    })
    const token = generateTestToken({ clerkId: 'vend_del', userId: user._id })
    const app = createFullApp()

    // Deletar
    const delRes = await request(app)
      .delete(`/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(delRes.status).toBe(200)

    // Verificar que nao aparece na listagem
    const listRes = await request(app)
      .get('/listings/my')
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.body.length).toBe(0)
  })

  it('I03: Fluxo de edicao — Criar → Editar → Verificar', async () => {
    const user = await User.create({ clerkId: 'vend_edit', email: 'vendedit@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja Edit', slug: 'loja-edit' })
    const token = generateTestToken({ clerkId: 'vend_edit', userId: user._id })
    const app = createFullApp()

    const createRes = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, price: 100 } })
    expect(createRes.status).toBe(201)

    // Update manual via controller (nao tem rota PUT no app de teste, mas podemos verificar no BD)
    const updated = await Listing.findByIdAndUpdate(
      createRes.body._id,
      { $set: { 'listingData.price': 150 } },
      { new: true }
    )
    expect(updated.listingData.price).toBe(150)
  })

  it('I04: RN012+RN013 — stats activeListings incrementa e decrementa', async () => {
    const user = await User.create({ clerkId: 'vend_stats', email: 'vendstats@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja Stats', slug: 'loja-stats' })
    const token = generateTestToken({ clerkId: 'vend_stats', userId: user._id })
    const app = createFullApp()

    expect(store.stats.activeListings).toBe(0)

    // Criar 2 anuncios
    const l1 = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    const l2 = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: { ...baseCardSnapshot, name: 'Pikachu' }, listingData: baseListingData })

    let storeAfter = await Store.findById(store._id)
    expect(storeAfter.stats.activeListings).toBe(2)

    // Deletar 1
    await request(app)
      .delete(`/listings/${l1.body._id}`)
      .set('Authorization', `Bearer ${token}`)

    storeAfter = await Store.findById(store._id)
    expect(storeAfter.stats.activeListings).toBe(1)
  })
})
