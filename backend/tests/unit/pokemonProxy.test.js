import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import pokemonRoutes from '../../src/routes/pokemonProxyRoutes.js'

const createApp = () => {
  const app = express()
  app.use('/api', pokemonRoutes)
  return app
}

describe('GET /api/cards (QAT-008)', () => {
  it('P01: sem filtros retorna dados paginados', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeLessThanOrEqual(20)
    expect(res.body.count).toBeGreaterThan(0)
    expect(res.body.page).toBe(1)
    expect(res.body.pageSize).toBe(20)
  })

  it('P02: filtro name:Charizard*', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?q=name:Charizard*')
    expect(res.status).toBe(200)
    expect(res.body.data.every(c => c.name.toLowerCase().includes('charizard'))).toBe(true)
  })

  it('P03: filtro number:4', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?q=number:4')
    expect(res.status).toBe(200)
    expect(res.body.data.every(c => c.number === '4')).toBe(true)
  })

  it('P04: filtro set.name:"Base Set"', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?q=set.name:"Base Set"')
    expect(res.status).toBe(200)
    expect(res.body.data.every(c => c.set?.name?.toLowerCase() === 'base set')).toBe(true)
  })

  it('P05: filtro rarity:"Rare Holo"', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?q=rarity:"Rare Holo"')
    expect(res.status).toBe(200)
    expect(res.body.data.every(c => c.rarity?.toLowerCase() === 'rare holo')).toBe(true)
  })

  it('P06: combinacao de filtros', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?q=name:Char* number:4')
    expect(res.status).toBe(200)
    expect(res.body.data.every(c => c.name.toLowerCase().includes('char') && c.number === '4')).toBe(true)
  })

  it('P07: sem resultados', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?q=name:ZZZNotFound*')
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(0)
    expect(res.body.data).toEqual([])
  })

  it('P08: paginacao pageSize=5', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards?page=2&pageSize=5')
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeLessThanOrEqual(5)
    expect(res.body.page).toBe(2)
    expect(res.body.pageSize).toBe(5)
  })
})

describe('GET /api/cards/:id (QAT-008)', () => {
  it('P09: carta existente retorna 200', async () => {
    const app = createApp()
    const listRes = await request(app).get('/api/cards?pageSize=1')
    const firstCard = listRes.body.data[0]
    const res = await request(app).get(`/api/cards/${firstCard.id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(firstCard.id)
  })

  it('P10: carta inexistente retorna 404', async () => {
    const app = createApp()
    const res = await request(app).get('/api/cards/id-inexistente-999')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Carta não encontrada')
  })
})

describe('GET /api/sets (QAT-008)', () => {
  it('P11: retorna sets', async () => {
    const app = createApp()
    const res = await request(app).get('/api/sets')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })
})

describe('GET /api/rarities (QAT-008)', () => {
  it('P12: retorna rarities', async () => {
    const app = createApp()
    const res = await request(app).get('/api/rarities')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })
})
