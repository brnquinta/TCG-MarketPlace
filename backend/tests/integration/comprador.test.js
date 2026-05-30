import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { authenticateToken } from '../../src/middleware/auth.js'
import { getPublicListings, getListingById } from '../../src/controllers/listingController.js'
import { generateTestToken } from '../fixtures/index.js'
import User from '../../src/models/User.js'
import Store from '../../src/models/Store.js'
import Listing from '../../src/models/Listing.js'
import Cart from '../../src/models/Cart.js'
import cartRoutes from '../../src/routes/cartRoutes.js'

const createBuyerApp = () => {
  const app = express()
  app.use(express.json())
  app.get('/listings', getPublicListings)
  app.get('/listings/:id', getListingById)
  app.use('/cart', authenticateToken, cartRoutes)
  return app
}

const baseCardSnapshot = { name: 'Charizard', number: '4', setName: 'Base Set' }
const baseListingData = { price: 199.90, condition: 'NM', language: 'PT-BR', quantity: 1 }

describe('QAT-010: Fluxo Completo do Comprador', () => {
  it('I05: Fluxo completo — Listar anuncios → Ver detalhes → Add carrinho → Ver carrinho', async () => {
    const seller = await User.create({ clerkId: 'seller_i05', email: 'seller@test.com' })
    const store = await Store.create({ userId: seller._id, name: 'Loja', slug: 'loja-i05', status: 'active' })
    const listing = await Listing.create({
      storeId: store._id, userId: seller._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active',
    })

    const buyer = await User.create({ clerkId: 'buyer_i05', email: 'buyer@test.com' })
    const token = generateTestToken({ clerkId: 'buyer_i05', userId: buyer._id })
    const app = createBuyerApp()

    // 1. Listar anuncios publicos
    const listRes = await request(app).get('/listings')
    expect(listRes.status).toBe(200)
    expect(listRes.body.listings.length).toBeGreaterThanOrEqual(1)
    expect(listRes.body.listings[0].cardSnapshot.name).toBe('Charizard')

    // 2. Ver detalhes
    const detailRes = await request(app).get(`/listings/${listing._id}`)
    expect(detailRes.status).toBe(200)
    expect(detailRes.body.cardSnapshot.name).toBe('Charizard')

    // 3. Add ao carrinho
    const addRes = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })
    expect(addRes.status).toBe(200)
    expect(addRes.body.items.length).toBe(1)

    // 4. Ver carrinho
    const cartRes = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)
    expect(cartRes.status).toBe(200)
    expect(cartRes.body.items.length).toBe(1)
    expect(cartRes.body.total).toBe(199.90)
  })

  it('I07: Carrinho + limpeza — Add → Remove → Carrinho vazio', async () => {
    const seller = await User.create({ clerkId: 'seller_i07', email: 'seller07@test.com' })
    const store = await Store.create({ userId: seller._id, name: 'Loja', slug: 'loja-i07', status: 'active' })
    const listing = await Listing.create({
      storeId: store._id, userId: seller._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active',
    })

    const buyer = await User.create({ clerkId: 'buyer_i07', email: 'buyer07@test.com' })
    const token = generateTestToken({ clerkId: 'buyer_i07', userId: buyer._id })
    const app = createBuyerApp()

    // Add
    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    // Remove
    const remRes = await request(app)
      .delete(`/cart/items/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(remRes.status).toBe(200)
    expect(remRes.body.items.length).toBe(0)
  })

  it('I08: Anuncio + views — Ver detalhes incrementa views', async () => {
    const seller = await User.create({ clerkId: 'seller_i08', email: 'seller08@test.com' })
    const store = await Store.create({ userId: seller._id, name: 'Loja', slug: 'loja-i08', status: 'active' })
    const listing = await Listing.create({
      storeId: store._id, userId: seller._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active',
    })
    const app = createBuyerApp()

    const before = listing.views
    await request(app).get(`/listings/${listing._id}`)
    const after = (await Listing.findById(listing._id)).views
    expect(after).toBe(before + 1)
  })
})
