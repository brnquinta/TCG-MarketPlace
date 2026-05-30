import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const TEST_SECRET = 'test-secret-key-for-tests-only'

export const generateTestToken = (overrides = {}) => {
  const payload = {
    sub: overrides.clerkId || 'test_clerk_123',
    userId: overrides.userId || new mongoose.Types.ObjectId().toString(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  }
  return jwt.sign(payload, overrides.secret || TEST_SECRET)
}

export const generateExpiredToken = (overrides = {}) => {
  const payload = {
    sub: 'test_clerk_123',
    userId: new mongoose.Types.ObjectId().toString(),
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
    ...overrides,
  }
  return jwt.sign(payload, TEST_SECRET)
}

export const generateInvalidToken = () => {
  return 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.invalid'
}
