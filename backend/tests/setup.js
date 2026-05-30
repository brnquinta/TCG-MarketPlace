import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import jwt from 'jsonwebtoken'

process.env.CLERK_SECRET_KEY = 'test-secret-key-for-tests-only'

vi.mock('@clerk/clerk-sdk-node', () => {
  const TEST_SECRET = 'test-secret-key-for-tests-only'
  return {
    verifyToken: async (token) => {
      return jwt.verify(token, TEST_SECRET)
    }
  }
})

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  process.env.MONGODB_URI = uri

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }

  await mongoose.connect(uri)
}, 60000)

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
