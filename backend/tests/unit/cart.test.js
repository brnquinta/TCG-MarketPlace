import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { authenticateToken } from '../../src/middleware/auth.js'
import cartRoutes from '../../src/routes/cartRoutes.js'
import { generateTestToken } from '../fixtures/index.js'
import User from '../../src/models/User.js'
import Store from '../../src/models/Store.js'
import Listing from '../../src/models/Listing.js'

const createCartApp = () => {
  const app = express()
  app.use(express.json())
  app.use('/cart', authenticateToken, cartRoutes)
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

describe('getCart (QAT-007)', () => {
  it('C01: carrinho vazio retorna items vazio e total 0', async () => {
    const user = await User.create({ clerkId: 'cart_empty', email: 'cartempty@test.com' })
    const token = generateTestToken({ clerkId: 'cart_empty', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.items).toEqual([])
    expect(res.body.total).toBe(0)
  })
})

describe('addItem (QAT-007)', () => {
  it('C02: Happy path — adicionar item ao carrinho', async () => {
    const user = await User.create({ clerkId: 'cart_add', email: 'cartadd@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-cartadd', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const token = generateTestToken({ clerkId: 'cart_add', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    expect(res.status).toBe(200)
    expect(res.body.items.length).toBe(1)
    expect(res.body.total).toBe(199.90)
  })

  it('C03: Erro — sem token', async () => {
    const app = createCartApp()
    const res = await request(app)
      .post('/cart/items')
      .send({ listingId: '507f1f77bcf86cd799439011' })
    expect(res.status).toBe(401)
  })

  it('C04: Erro — sem listingId', async () => {
    const user = await User.create({ clerkId: 'cart_noid', email: 'cartnoid@test.com' })
    const token = generateTestToken({ clerkId: 'cart_noid', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('listingId e obrigatorio')
  })

  it('C05: Erro — listing inexistente', async () => {
    const user = await User.create({ clerkId: 'cart_nolist', email: 'cartnolist@test.com' })
    const token = generateTestToken({ clerkId: 'cart_nolist', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: '507f1f77bcf86cd799439011' })

    expect(res.status).toBe(404)
  })

  it('C06: RN032 — listing inativa nao pode ser adicionada', async () => {
    const user = await User.create({ clerkId: 'cart_inact', email: 'cartinact@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-cartinact', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'sold' })
    const token = generateTestToken({ clerkId: 'cart_inact', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Anuncio nao esta ativo')
  })

  it('C07: RN033 — listing sem estoque nao pode ser adicionada', async () => {
    const user = await User.create({ clerkId: 'cart_noqty', email: 'cartnoqty@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-cartnoqty', status: 'active' })
    // Criar com qty 1, depois alterar direto no BD para 0 (burlar validacao do schema)
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: { ...baseListingData, quantity: 1 }, status: 'active' })
    await Listing.updateOne({ _id: listing._id }, { $set: { 'listingData.quantity': 0 } })
    const token = generateTestToken({ clerkId: 'cart_noqty', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Anuncio sem estoque')
  })

  it('C08: RN034 — item duplicado rejeitado', async () => {
    const user = await User.create({ clerkId: 'cart_dup', email: 'cartdup@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-cartdup', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const token = generateTestToken({ clerkId: 'cart_dup', userId: user._id })
    const app = createCartApp()

    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    const res2 = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    expect(res2.status).toBe(400)
    expect(res2.body.error).toBe('Item ja esta no carrinho')
  })

  it('C12: RN035 — items populados com storeId.name', async () => {
    const user = await User.create({ clerkId: 'cart_pop', email: 'cartpop@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja Populada', slug: 'loja-pop', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const token = generateTestToken({ clerkId: 'cart_pop', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    expect(res.status).toBe(200)
    expect(res.body.items[0].listingId).toBeDefined()
    expect(res.body.items[0].listingId.storeId).toBeDefined()
    expect(res.body.items[0].listingId.storeId.name).toBe('Loja Populada')
  })
})

describe('removeItem (QAT-007)', () => {
  it('C09: remove item do carrinho', async () => {
    const user = await User.create({ clerkId: 'cart_rem', email: 'cartrem@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-rem', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const token = generateTestToken({ clerkId: 'cart_rem', userId: user._id })
    const app = createCartApp()

    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    const res = await request(app)
      .delete(`/cart/items/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.items.length).toBe(0)
    expect(res.body.total).toBe(0)
  })

  it('C10: Erro — item inexistente no carrinho', async () => {
    const user = await User.create({ clerkId: 'cart_rem404', email: 'cartrem404@test.com' })
    const token = generateTestToken({ clerkId: 'cart_rem404', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .delete('/cart/items/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Carrinho nao encontrado')
  })

  it('C13: ⚠️ BUG — auth duplicado (middleware no app + nas rotas)', async () => {
    // O middleware authenticateToken esta registrado em app.js E nas rotas cartRoutes
    // Teste documenta que auth executa 2x, mas nao quebra funcionalmente
    const user = await User.create({ clerkId: 'cart_authdup', email: 'cartauthdup@test.com' })
    const token = generateTestToken({ clerkId: 'cart_authdup', userId: user._id })
    const app = createCartApp()

    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })
})

describe('clearCart (QAT-007)', () => {
  it('C11: limpar carrinho', async () => {
    const user = await User.create({ clerkId: 'cart_clr', email: 'cartclr@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Loja', slug: 'loja-clr', status: 'active' })
    const listing = await Listing.create({ storeId: store._id, userId: user._id, cardSnapshot: baseCardSnapshot, listingData: baseListingData, status: 'active' })
    const token = generateTestToken({ clerkId: 'cart_clr', userId: user._id })
    const app = createCartApp()

    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ listingId: listing._id.toString() })

    const res = await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.items).toEqual([])
    expect(res.body.total).toBe(0)

    const getRes = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.body.items).toEqual([])
  })
})
