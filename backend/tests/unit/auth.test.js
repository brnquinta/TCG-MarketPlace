import { describe, it, expect, vi } from 'vitest'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { authenticateToken, optionalAuth } from '../../src/middleware/auth.js'
import { generateTestToken, generateExpiredToken, generateInvalidToken } from '../fixtures/index.js'
import User from '../../src/models/User.js'

const createAuthApp = () => {
  const app = express()
  app.use(express.json())
  app.get('/protected', authenticateToken, (req, res) => {
    res.json({ user: req.user })
  })
  return app
}

const createOptionalAuthApp = () => {
  const app = express()
  app.use(express.json())
  app.get('/optional', optionalAuth, (req, res) => {
    res.json({ user: req.user || null })
  })
  return app
}

describe('authenticateToken', () => {
  it('A01: deve aceitar token valido e popular req.user', async () => {
    const app = createAuthApp()
    const token = generateTestToken({ clerkId: 'clerk_001' })
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.clerkId).toBe('clerk_001')
  })

  it('A02: deve retornar 401 se nao houver header Authorization', async () => {
    const app = createAuthApp()
    const res = await request(app).get('/protected')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('No token provided')
  })

  it('A03: deve retornar 401 se header nao comecar com Bearer', async () => {
    const app = createAuthApp()
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'token')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('No token provided')
  })

  it('A04: deve retornar 401 se token for invalido', async () => {
    const app = createAuthApp()
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer token_invalido')
    expect(res.status).toBe(401)
  })

  it('A05: ✅ CORRIGIDO — token expirado retorna 401 (jwt.verify rejeita)', async () => {
    const app = createAuthApp()
    const token = generateExpiredToken({ clerkId: 'clerk_expired' })
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })

  it('A08: RN002 — deve criar usuario automaticamente se nao existir', async () => {
    const app = createAuthApp()
    const clerkId = 'clerk_new_user'
    const token = generateTestToken({ clerkId })
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const user = await User.findOne({ clerkId })
    expect(user).not.toBeNull()
    expect(user.clerkId).toBe(clerkId)
  })

  it('A10: RN002 — nao deve duplicar usuario se ja existir', async () => {
    const clerkId = 'clerk_existing'
    await User.create({ clerkId, email: 'existing@test.com' })
    const countBefore = await User.countDocuments({ clerkId })

    const app = createAuthApp()
    const token = generateTestToken({ clerkId })
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const countAfter = await User.countDocuments({ clerkId })
    expect(countAfter).toBe(countBefore)
  })

  it('A09: ✅ CORRIGIDO — token forjado com chave errada retorna 401', async () => {
    const app = createAuthApp()
    const forgedToken = jwt.sign({ sub: 'hacker' }, 'chave-secreta-do-hacker')
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${forgedToken}`)
    expect(res.status).toBe(401)
  })
})

describe('optionalAuth', () => {
  it('A06: deve chamar next mesmo sem token', async () => {
    const app = createOptionalAuthApp()
    const res = await request(app).get('/optional')
    expect(res.status).toBe(200)
    expect(res.body.user).toBeNull()
  })

  it('A07: deve chamar next com token invalido (req.user undefined)', async () => {
    const app = createOptionalAuthApp()
    const res = await request(app)
      .get('/optional')
      .set('Authorization', 'Bearer token_invalido')
    expect(res.status).toBe(200)
    expect(res.body.user).toBeNull()
  })

  it('deve popular req.user com token valido', async () => {
    const app = createOptionalAuthApp()
    const token = generateTestToken({ clerkId: 'clerk_optional' })
    const res = await request(app)
      .get('/optional')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.user).not.toBeNull()
    expect(res.body.user.clerkId).toBe('clerk_optional')
  })
})
