import Store from '../models/Store.js'
import User from '../models/User.js'

export const createStore = async (req, res) => {
  try {
    const { name, slug, logoUrl, bannerUrl, description, location } = req.body
    const clerkId = req.user.clerkId

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' })
    }

    const existingStore = await Store.findOne({ slug })
    if (existingStore) {
      return res.status(400).json({ error: 'Slug already in use' })
    }

    const user = await User.findOne({ clerkId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const existingUserStore = await Store.findOne({ userId: user._id })
    if (existingUserStore) {
      return res.status(400).json({ error: 'Voce ja possui uma loja' })
    }

    const store = new Store({
      userId: user._id,
      name,
      slug,
      logoUrl: logoUrl || '',
      bannerUrl: bannerUrl || '',
      description: description || '',
      location: location || { city: '', state: '' },
      status: 'draft',
      onboardingStatus: 'pending',
      rating: { average: 0, reviewsCount: 0 },
      stats: { activeListings: 0, totalSales: 0, totalViews: 0 }
    })

    await store.save()
    res.status(201).json(store)
  } catch (error) {
    console.error('Error creating store:', error)
    res.status(500).json({ error: 'Failed to create store' })
  }
}

export const getMyStore = async (req, res) => {
  try {
    const clerkId = req.user.clerkId
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const store = await Store.findOne({ userId: user._id })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }

    res.json(store)
  } catch (error) {
    console.error('Error getting store:', error)
    res.status(500).json({ error: 'Failed to get store' })
  }
}

export const updateStore = async (req, res) => {
  try {
    const clerkId = req.user.clerkId
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const store = await Store.findOne({ userId: user._id })

    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }

    const { name, logoUrl, bannerUrl, description, location, status, onboardingStatus, contact, paymentInfo } = req.body

    if (name) store.name = name
    if (logoUrl !== undefined) store.logoUrl = logoUrl
    if (bannerUrl !== undefined) store.bannerUrl = bannerUrl
    if (description !== undefined) store.description = description
    if (location) store.location = { ...store.location, ...location }
    if (status) store.status = status
    if (onboardingStatus) store.onboardingStatus = onboardingStatus
    if (contact) store.contact = { ...store.contact, ...contact }
    if (paymentInfo) store.paymentInfo = { ...store.paymentInfo, ...paymentInfo }

    await store.save()
    res.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    res.status(500).json({ error: 'Failed to update store' })
  }
}

export const getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const store = await Store.findOne({ slug, status: 'active' })
      .populate('userId', 'firstName lastName imageUrl')

    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }

    store.stats.totalViews += 1
    await store.save()

    res.json(store)
  } catch (error) {
    console.error('Error getting store:', error)
    res.status(500).json({ error: 'Failed to get store' })
  }
}

export const getAllStores = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const stores = await Store.find({ status: 'active' })
      .select('name slug logoUrl description location rating stats.createdAt')
      .sort({ 'rating.average': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Store.countDocuments({ status: 'active' })

    res.json({
      stores,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error getting stores:', error)
    res.status(500).json({ error: 'Failed to get stores' })
  }
}