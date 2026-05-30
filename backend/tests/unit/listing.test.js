import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { authenticateToken } from '../../src/middleware/auth.js'
import {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  getListingById,
  getPublicListings,
} from '../../src/controllers/listingController.js'
import { generateTestToken } from '../fixtures/index.js'
import User from '../../src/models/User.js'
import Store from '../../src/models/Store.js'
import Listing from '../../src/models/Listing.js'

const createAuthApp = () => {
  const app = express()
  app.use(express.json())
  app.post('/listings', authenticateToken, createListing)
  app.get('/listings/my', authenticateToken, getMyListings)
  app.put('/listings/:id', authenticateToken, updateListing)
  app.delete('/listings/:id', authenticateToken, deleteListing)
  app.get('/listings/public/:id', getListingById)
  app.get('/listings', getPublicListings)
  return app
}

const baseCardSnapshot = {
  name: 'Charizard',
  number: '4',
  rarity: 'Rare Holo',
  supertype: 'Pokémon',
  setId: 'base1',
  setName: 'Base Set',
  setSeries: 'Base',
}

const baseListingData = {
  price: 199.90,
  condition: 'NM',
  language: 'PT-BR',
  quantity: 1,
}

describe('createListing (QAT-005)', () => {
  it('L01: Happy path — dados completos', async () => {
    const user = await User.create({ clerkId: 'listing_user', email: 'listing@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-listing' })
    const token = generateTestToken({ clerkId: 'listing_user', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('active')
    expect(res.body.listingData.price).toBe(199.90)
    expect(res.body.listingData.condition).toBe('NM')
  })

  it('L02: Erro — sem token', async () => {
    const app = createAuthApp()
    const res = await request(app)
      .post('/listings')
      .send({ cardSnapshot: baseCardSnapshot, listingData: baseListingData })
    expect(res.status).toBe(401)
  })

  it('L03: Erro — sem cardSnapshot', async () => {
    const user = await User.create({ clerkId: 'no_card', email: 'nocard@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-nocard' })
    const token = generateTestToken({ clerkId: 'no_card', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingData: baseListingData })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('cardSnapshot and listingData are required')
  })

  it('L04: Erro — sem listingData', async () => {
    const user = await User.create({ clerkId: 'no_data', email: 'nodata@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-nodata' })
    const token = generateTestToken({ clerkId: 'no_data', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('cardSnapshot and listingData are required')
  })

  it('L05: Erro — sem loja', async () => {
    const user = await User.create({ clerkId: 'no_store_listing', email: 'nostorelisting@test.com' })
    const token = generateTestToken({ clerkId: 'no_store_listing', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Store not found')
  })

  it('L06: RN012 — activeListings incrementado', async () => {
    const user = await User.create({ clerkId: 'inc_listing', email: 'inc@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-inc' })
    const token = generateTestToken({ clerkId: 'inc_listing', userId: user._id })
    const app = createAuthApp()

    await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    const updated = await Store.findById(store._id)
    expect(updated.stats.activeListings).toBe(1)
  })

  it('L07: Normalizacao — portugues → PT-BR', async () => {
    const user = await User.create({ clerkId: 'lang_pt', email: 'langpt@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-langpt' })
    const token = generateTestToken({ clerkId: 'lang_pt', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, language: 'portugues' } })

    expect(res.status).toBe(201)
    expect(res.body.listingData.language).toBe('PT-BR')
  })

  it('L08: Normalizacao — english → EN', async () => {
    const user = await User.create({ clerkId: 'lang_en', email: 'langen@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-langen' })
    const token = generateTestToken({ clerkId: 'lang_en', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, language: 'english', price: '99.50' } })

    expect(res.status).toBe(201)
    expect(res.body.listingData.language).toBe('EN')
    expect(res.body.listingData.price).toBe(99.50)
  })

  it('L10: Normalizacao — price vira 0 se vazio', async () => {
    const user = await User.create({ clerkId: 'price_zero', email: 'pricezero@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-pricezero' })
    const token = generateTestToken({ clerkId: 'price_zero', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, price: '' } })

    expect(res.status).toBe(201)
    expect(res.body.listingData.price).toBe(0)
  })

  it('L11: Normalizacao — quantity minimo 1', async () => {
    const user = await User.create({ clerkId: 'qty_min', email: 'qtymin@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-qtymin' })
    const token = generateTestToken({ clerkId: 'qty_min', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, quantity: 0 } })

    expect(res.status).toBe(201)
    expect(res.body.listingData.quantity).toBe(1)
  })

  it('L12: Normalizacao — gradingCompany vazio vira null', async () => {
    const user = await User.create({ clerkId: 'grad_null', email: 'gradnull@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-gradnull' })
    const token = generateTestToken({ clerkId: 'grad_null', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, gradingCompany: '', grade: '' } })

    expect(res.status).toBe(201)
    expect(res.body.listingData.gradingCompany).toBeNull()
    expect(res.body.listingData.grade).toBeNull()
  })

  it('L13: ✅ CORRIGIDO — DM agora funciona (frontend envia DM)', async () => {
    const user = await User.create({ clerkId: 'dmg_fixed', email: 'dmgfixed@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-dmg-fixed' })
    const token = generateTestToken({ clerkId: 'dmg_fixed', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, condition: 'DM' } })

    expect(res.status).toBe(201)
    expect(res.body.listingData.condition).toBe('DM')
  })

  it('L14: Regra RN020 — 4 fotos aceitas', async () => {
    const user = await User.create({ clerkId: 'photos_4', email: 'photos4@test.com' })
    await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-photos' })
    const token = generateTestToken({ clerkId: 'photos_4', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .post('/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cardSnapshot: baseCardSnapshot,
        listingData: baseListingData,
        photos: {
          main: 'https://example.com/1.jpg',
          '2': 'https://example.com/2.jpg',
          '3': 'https://example.com/3.jpg',
          '4': 'https://example.com/4.jpg',
        },
      })

    expect(res.status).toBe(201)
  })
})

describe('getMyListings (QAT-006)', () => {
  it('deve retornar listings do usuario logado', async () => {
    const user = await User.create({ clerkId: 'my_list', email: 'mylist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-mylist' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const token = generateTestToken({ clerkId: 'my_list', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .get('/listings/my')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].cardSnapshot.name).toBe('Charizard')
  })
})

describe('updateListing (QAT-006)', () => {
  it('L27: Happy path — updateListing com dados parciais', async () => {
    const user = await User.create({ clerkId: 'upd_list', email: 'updlist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-upd' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })
    const token = generateTestToken({ clerkId: 'upd_list', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .put(`/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ listingData: { price: 150 } })

    expect(res.status).toBe(200)
    expect(res.body.listingData.price).toBe(150)
    expect(res.body.listingData.condition).toBe('NM') // manteve o original
  })

  it('L28: Erro — update de outro usuario', async () => {
    const user1 = await User.create({ clerkId: 'upd_owner', email: 'updowner@test.com' })
    const store1 = await Store.create({ userId: user1._id, name: 'Loja1', slug: 'loja-upd1' })
    const listing = await Listing.create({ storeId: store1._id, userId: user1._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    const user2 = await User.create({ clerkId: 'upd_hacker', email: 'updhacker@test.com' })
    await Store.create({ userId: user2._id, name: 'Loja2', slug: 'loja-upd2' })
    const token2 = generateTestToken({ clerkId: 'upd_hacker', userId: user2._id })
    const app = createAuthApp()

    const res = await request(app)
      .put(`/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ listingData: { price: 10 } })

    expect(res.status).toBe(404)
  })
})

describe('getListingById (QAT-006)', () => {
  it('L24: Happy path — buscar por ID valido', async () => {
    const user = await User.create({ clerkId: 'get_list', email: 'getlist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-get', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })
    const app = createAuthApp()

    const res = await request(app).get(`/listings/public/${listing._id}`)

    expect(res.status).toBe(200)
    expect(res.body.cardSnapshot.name).toBe('Charizard')
    expect(res.body.storeId).toBeDefined()
  })

  it('L25: Erro — ID inexistente', async () => {
    const app = createAuthApp()
    const res = await request(app).get('/listings/public/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
  })

  it('L26: RN views — incrementado ao buscar', async () => {
    const user = await User.create({ clerkId: 'views_list', email: 'viewslist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-views', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    const app = createAuthApp()
    await request(app).get(`/listings/public/${listing._id}`)
    const updated = await Listing.findById(listing._id)
    expect(updated.views).toBe(1)
  })
})

describe('getPublicListings (QAT-006)', () => {
  it('L15: Happy path — sem filtros retorna listings ativos', async () => {
    const user = await User.create({ clerkId: 'pub_list', email: 'publist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-pub', status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const app = createAuthApp()

    const res = await request(app).get('/listings')
    expect(res.status).toBe(200)
    expect(res.body.listings.length).toBe(1)
    expect(res.body.total).toBe(1)
  })

  it('L18: Filtro — minPrice e maxPrice', async () => {
    const user = await User.create({ clerkId: 'price_filt', email: 'pricefilt@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-pfilt', status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: { ...baseCardSnapshot, name: 'Carta Barata' }, listingData: { ...baseListingData, price: 50 }, status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: { ...baseCardSnapshot, name: 'Carta Cara' }, listingData: { ...baseListingData, price: 200 }, status: 'active' })
    const app = createAuthApp()

    const res = await request(app).get('/listings?minPrice=100&maxPrice=300')
    expect(res.status).toBe(200)
    expect(res.body.listings.every(l => l.listingData.price >= 100 && l.listingData.price <= 300)).toBe(true)
    expect(res.body.listings.length).toBe(1)
  })

  it('L19: Filtro — condition', async () => {
    const user = await User.create({ clerkId: 'cond_filt', email: 'condfilt@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-cfilt', status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, condition: 'NM' }, status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: { ...baseCardSnapshot, name: 'LP Card' }, listingData: { ...baseListingData, condition: 'LP' }, status: 'active' })
    const app = createAuthApp()

    const res = await request(app).get('/listings?condition=LP')
    expect(res.status).toBe(200)
    expect(res.body.listings.every(l => l.listingData.condition === 'LP')).toBe(true)
  })

  it('L22: Filtro — search (nome)', async () => {
    const user = await User.create({ clerkId: 'search_filt', email: 'searchfilt@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-sfilt', status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: { ...baseCardSnapshot, name: 'Charizard VMAX' }, listingData: baseListingData, status: 'active' })
    await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: { ...baseCardSnapshot, name: 'Pikachu' }, listingData: baseListingData, status: 'active' })
    const app = createAuthApp()

    const res = await request(app).get('/listings?search=Charizard')
    expect(res.status).toBe(200)
    expect(res.body.listings.every(l => l.cardSnapshot.name.includes('Charizard'))).toBe(true)
  })

  it('L23: Paginacao default', async () => {
    const user = await User.create({ clerkId: 'page_filt', email: 'pagefilt@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-pg', status: 'active' })
    for (let i = 0; i < 5; i++) {
      await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: { ...baseCardSnapshot, name: `Card ${i}` }, listingData: { ...baseListingData, price: i * 10 }, status: 'active' })
    }
    const app = createAuthApp()

    const res = await request(app).get('/listings?page=1&limit=2')
    expect(res.status).toBe(200)
    expect(res.body.listings.length).toBe(2)
    expect(res.body.page).toBe(1)
    expect(res.body.pages).toBe(3)
    expect(res.body.total).toBe(5)
  })
})

describe('deleteListing (QAT-006)', () => {
  it('L29: Happy path — deletar listing proprio', async () => {
    const user = await User.create({ clerkId: 'del_list', email: 'dellist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-del' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })
    const token = generateTestToken({ clerkId: 'del_list', userId: user._id })
    const app = createAuthApp()

    const res = await request(app)
      .delete(`/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    const deleted = await Listing.findById(listing._id)
    expect(deleted).toBeNull()
  })

  it('L30: Erro — deletar listing de outro usuario', async () => {
    const user1 = await User.create({ clerkId: 'del_owner', email: 'delowner@test.com' })
    const store1 = await Store.create({ userId: user1._id, name: 'Loja1', slug: 'loja-del1' })
    const listing = await Listing.create({ storeId: store1._id, userId: user1._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })

    const user2 = await User.create({ clerkId: 'del_hacker', email: 'delhacker@test.com' })
    await Store.create({ userId: user2._id, name: 'Loja2', slug: 'loja-del2' })
    const token2 = generateTestToken({ clerkId: 'del_hacker', userId: user2._id })
    const app = createAuthApp()

    const res = await request(app)
      .delete(`/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token2}`)

    expect(res.status).toBe(404)
  })

  it('L31: RN013 — decrementar activeListings ao deletar', async () => {
    const user = await User.create({ clerkId: 'dec_list', email: 'declist@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-dec' })
    store.stats.activeListings = 5
    await store.save()
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData })
    const token = generateTestToken({ clerkId: 'dec_list', userId: user._id })
    const app = createAuthApp()

    await request(app)
      .delete(`/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)

    const updated = await Store.findById(store._id)
    expect(updated.stats.activeListings).toBe(4)
  })
})
