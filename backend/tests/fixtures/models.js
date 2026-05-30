import mongoose from 'mongoose'
import User from '../../src/models/User.js'
import Store from '../../src/models/Store.js'
import Listing from '../../src/models/Listing.js'
import Cart from '../../src/models/Cart.js'

export const createTestUser = async (overrides = {}) => {
  const data = {
    clerkId: 'test_clerk_123',
    email: 'test@example.com',
    username: 'testuser',
    ...overrides,
  }
  return await User.create(data)
}

export const createTestStore = async (overrides = {}) => {
  const userId = overrides.userId || new mongoose.Types.ObjectId()
  const data = {
    name: 'Test Store',
    slug: 'test-store',
    userId,
    ...overrides,
  }
  return await Store.create(data)
}

export const createTestListing = async (overrides = {}) => {
  const storeId = overrides.storeId || new mongoose.Types.ObjectId()
  const data = {
    storeId,
    cardSnapshot: {
      name: 'Charizard',
      set: { name: 'Base Set', series: 'Base' },
      number: '4',
      image: 'https://example.com/card.png',
    },
    listingData: {
      price: 199.90,
      condition: 'NM',
      language: 'PT-BR',
      quantity: 1,
    },
    ...overrides,
  }
  return await Listing.create(data)
}

export const createTestCart = async (overrides = {}) => {
  const userId = overrides.userId || new mongoose.Types.ObjectId()
  const data = {
    userId,
    items: [],
    total: 0,
    ...overrides,
  }
  return await Cart.create(data)
}
