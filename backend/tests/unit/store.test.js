import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { authenticateToken } from '../../src/middleware/auth.js'
import { createStore, getMyStore, updateStore, getStoreBySlug, getAllStores } from '../../src/controllers/storeController.js'
import { generateTestToken } from '../fixtures/index.js'
import User from '../../src/models/User.js'
import Store from '../../src/models/Store.js'

const createAuthenticatedApp = () => {
  const app = express()
  app.use(express.json())
  app.post('/stores', authenticateToken, createStore)
  app.get('/stores/me', authenticateToken, getMyStore)
  app.put('/stores/me', authenticateToken, updateStore)
  app.get('/stores/slug/:slug', getStoreBySlug)
  app.get('/stores', getAllStores)
  return app
}

describe('createStore (QAT-003)', () => {
  it('S01: Happy path — criar loja com dados validos', async () => {
    const user = await User.create({ clerkId: 'store_clerk', email: 'store@test.com' })
    const token = generateTestToken({ clerkId: 'store_clerk', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Minha Loja', slug: 'minha-loja', location: { city: 'SP', state: 'SP' } })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Minha Loja')
    expect(res.body.slug).toBe('minha-loja')
    expect(res.body.status).toBe('draft')
    expect(res.body.onboardingStatus).toBe('pending')
    expect(res.body.stats.activeListings).toBe(0)
  })

  it('S02: Erro — sem token', async () => {
    const app = createAuthenticatedApp()
    const res = await request(app)
      .post('/stores')
      .send({ name: 'Loja', slug: 'loja' })
    expect(res.status).toBe(401)
  })

  it('S03: Erro — sem nome', async () => {
    const user = await User.create({ clerkId: 'no_name', email: 'noname@test.com' })
    const token = generateTestToken({ clerkId: 'no_name', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'sem-nome' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Name and slug are required')
  })

  it('S04: Erro — sem slug', async () => {
    const user = await User.create({ clerkId: 'no_slug', email: 'noslug@test.com' })
    const token = generateTestToken({ clerkId: 'no_slug', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sem Slug' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Name and slug are required')
  })

  it('S05: Erro — slug duplicado', async () => {
    const user = await User.create({ clerkId: 'dup_slug', email: 'dupslug@test.com' })
    await Store.create({ userId: user._id, name: 'Existente', slug: 'slug-dup' })
    const token = generateTestToken({ clerkId: 'dup_slug', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nova', slug: 'slug-dup' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Slug already in use')
  })

  it('S06: Erro — usuario ja possui loja', async () => {
    const user = await User.create({ clerkId: 'two_stores', email: 'twostores@test.com' })
    await Store.create({ userId: user._id, name: 'Primeira', slug: 'primeira' })
    const token = generateTestToken({ clerkId: 'two_stores', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Segunda', slug: 'segunda' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Voce ja possui uma loja')
  })

  it('S07: Edge — slug case-insensitive (mongoose lowercase)', async () => {
    const user = await User.create({ clerkId: 'case_slug', email: 'caseslug@test.com' })
    const token = generateTestToken({ clerkId: 'case_slug', userId: user._id })
    const app = createAuthenticatedApp()

    await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Case', slug: 'CASE-Test' })

    const found = await Store.findOne({ slug: 'case-test' })
    expect(found).not.toBeNull()
  })

  it('S08: RN006 — 1 loja por usuario', async () => {
    const user = await User.create({ clerkId: 'one_store', email: 'onestore@test.com' })
    const token = generateTestToken({ clerkId: 'one_store', userId: user._id })
    const app = createAuthenticatedApp()

    await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unica', slug: 'unica' })

    const res2 = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicada', slug: 'duplicada' })

    expect(res2.status).toBe(400)
    expect(res2.body.error).toBe('Voce ja possui uma loja')
  })
})

describe('getMyStore (QAT-004)', () => {
  it('S09: Happy path — getMyStore', async () => {
    const user = await User.create({ clerkId: 'my_store', email: 'mystore@test.com' })
    await Store.create({ userId: user._id, name: 'Minha Loja', slug: 'minha-loja' })
    const token = generateTestToken({ clerkId: 'my_store', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .get('/stores/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Minha Loja')
    expect(res.body.slug).toBe('minha-loja')
  })

  it('S10: Erro — getMyStore sem loja', async () => {
    const user = await User.create({ clerkId: 'no_store', email: 'nostore@test.com' })
    const token = generateTestToken({ clerkId: 'no_store', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .get('/stores/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Store not found')
  })
})

describe('getStoreBySlug (QAT-004)', () => {
  it('S11: Happy path — buscar por slug ativo', async () => {
    const user = await User.create({ clerkId: 'slug_store', email: 'slugstore@test.com' })
    await Store.create({ userId: user._id, name: 'Slug Store', slug: 'slug-store', status: 'active' })

    const app = createAuthenticatedApp()
    const res = await request(app).get('/stores/slug/slug-store')

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Slug Store')
  })

  it('S12: Erro — slug inexistente', async () => {
    const app = createAuthenticatedApp()
    const res = await request(app).get('/stores/slug/nao-existe')
    expect(res.status).toBe(404)
  })

  it('S13: RN011 — store inativa nao retorna', async () => {
    const user = await User.create({ clerkId: 'inactive_store', email: 'inactive@test.com' })
    await Store.create({ userId: user._id, name: 'Inativa', slug: 'inativa', status: 'inactive' })

    const app = createAuthenticatedApp()
    const res = await request(app).get('/stores/slug/inativa')
    expect(res.status).toBe(404)
  })

  it('S16: RN014 — views incrementado ao buscar', async () => {
    const user = await User.create({ clerkId: 'views_store', email: 'viewsstore@test.com' })
    const store = await Store.create({ userId: user._id, name: 'Views', slug: 'views-test', status: 'active' })

    const app = createAuthenticatedApp()
    await request(app).get('/stores/slug/views-test')
    const updated = await Store.findById(store._id)
    expect(updated.stats.totalViews).toBe(store.stats.totalViews + 1)
  })
})

describe('getAllStores (QAT-004)', () => {
  it('S17: Paginacao default — 20 lojas, sorted by rating', async () => {
    const user = await User.create({ clerkId: 'list_owner', email: 'listowner@test.com' })
    for (let i = 0; i < 3; i++) {
      await Store.create({ userId: user._id, name: `Loja ${i}`, slug: `loja-${i}`, status: 'active', rating: { average: i, reviewsCount: 1 } })
    }

    const app = createAuthenticatedApp()
    const res = await request(app).get('/stores')

    expect(res.status).toBe(200)
    expect(res.body.stores.length).toBe(3)
    expect(res.body.total).toBe(3)
    expect(res.body.page).toBe(1)
    expect(res.body.stores[0].rating.average).toBeGreaterThanOrEqual(res.body.stores[1].rating.average)
  })
})

describe('updateStore (QAT-004)', () => {
  it('S14: Happy path — updateStore com dados parciais', async () => {
    const user = await User.create({ clerkId: 'update_store', email: 'update@test.com' })
    await Store.create({ userId: user._id, name: 'Original', slug: 'original' })
    const token = generateTestToken({ clerkId: 'update_store', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .put('/stores/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Atualizada', description: 'Nova descricao' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Atualizada')
    expect(res.body.description).toBe('Nova descricao')
  })

  it('S15: Erro — updateStore sem loja', async () => {
    const user = await User.create({ clerkId: 'no_update_store', email: 'noupdate@test.com' })
    const token = generateTestToken({ clerkId: 'no_update_store', userId: user._id })
    const app = createAuthenticatedApp()

    const res = await request(app)
      .put('/stores/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sem Loja' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Store not found')
  })
})
