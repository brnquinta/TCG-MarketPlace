import Listing from '../models/Listing.js'
import Store from '../models/Store.js'
import User from '../models/User.js'

const normalizeListingData = (data) => {
  const languageMap = {
    portugues: 'PT-BR',
    portuguese: 'PT-BR',
    ptbr: 'PT-BR',
    'pt-br': 'PT-BR',

    english: 'EN',
    en: 'EN',

    japanese: 'JP',
    jp: 'JP',

    spanish: 'ES',
    es: 'ES',

    french: 'FR',
    fr: 'FR',

    german: 'DE',
    de: 'DE',

    italian: 'IT',
    it: 'IT',

    korean: 'KO',
    ko: 'KO',

    chinese: 'ZH',
    zh: 'ZH',
  }

  const normalizeString = (value) => {
    if (!value) return null
    if (typeof value !== 'string') return null
    if (value.trim() === '') return null
    return value.trim()
  }

  return {
    ...data,

    language:
      languageMap[String(data.language || '').toLowerCase()] ||
      data.language ||
      'EN',

    condition: data.condition || 'NM',

    price: Number(data.price) || 0,

    quantity: Math.max(1, parseInt(data.quantity) || 1),

    gradingCompany: normalizeString(data.gradingCompany),

    grade: normalizeString(data.grade),

    city: normalizeString(data.city),

    state: normalizeString(data.state),

    certified: Boolean(data.certified),

    acceptsOffer: Boolean(data.acceptsOffer),

    shippingAvailable:
      data.shippingAvailable !== undefined
        ? Boolean(data.shippingAvailable)
        : true,

    localPickup: Boolean(data.localPickup),
  }
}

export const createListing = async (req, res) => {
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

    const { cardSnapshot, listingData, photos } = req.body

    if (!cardSnapshot || !listingData) {
      return res.status(400).json({ error: 'cardSnapshot and listingData are required' })
    }

    const normalizedData = normalizeListingData(listingData)

    const listing = new Listing({
      storeId: store._id,
      userId: user._id,
      cardSnapshot,
      listingData: normalizedData,
      photos: photos || {},
      status: 'active',
      views: 0,
    })

    await listing.save()

    store.stats.activeListings += 1
    await store.save()

    return res.status(201).json(listing)
  } catch (error) {
    console.error('Error creating listing:', error)
    return res.status(500).json({ error: 'Failed to create listing' })
  }
}

export const getMyListings = async (req, res) => {
  try {
    const clerkId = req.user.clerkId
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const listings = await Listing.find({ userId: user._id }).sort({ createdAt: -1 })

    return res.json(listings)
  } catch (error) {
    console.error('Error getting listings:', error)
    return res.status(500).json({ error: 'Failed to get listings' })
  }
}

export const updateListing = async (req, res) => {
  try {
    const { id } = req.params
    const clerkId = req.user.clerkId
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const listing = await Listing.findOne({ _id: id, userId: user._id })

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    const { cardSnapshot, listingData, photos, status } = req.body

    if (cardSnapshot) listing.cardSnapshot = { ...listing.cardSnapshot, ...cardSnapshot }

    if (listingData) {
      listing.listingData = normalizeListingData({
        ...listing.listingData.toObject(),
        ...listingData,
      })
    }

    if (photos) listing.photos = { ...listing.photos, ...photos }

    if (status) listing.status = status

    await listing.save()

    return res.json(listing)
  } catch (error) {
    console.error('Error updating listing:', error)
    return res.status(500).json({ error: 'Failed to update listing' })
  }
}

export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params
    const clerkId = req.user.clerkId
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const listing = await Listing.findOne({ _id: id, userId: user._id })

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    await Listing.deleteOne({ _id: id })

    await Store.updateOne(
      { _id: listing.storeId },
      { $inc: { 'stats.activeListings': -1 } }
    )

    return res.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return res.status(500).json({ error: 'Failed to delete listing' })
  }
}

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params

    const listing = await Listing.findById(id).populate(
      'storeId',
      'name slug logoUrl rating location'
    )

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    listing.views += 1
    await listing.save()

    return res.json(listing)
  } catch (error) {
    console.error('Error getting listing:', error)
    return res.status(500).json({ error: 'Failed to get listing' })
  }
}

export const getPublicListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      condition,
      certified,
      setName,
      language,
      search,
    } = req.query

    const query = { status: 'active' }

    if (minPrice || maxPrice) {
      query['listingData.price'] = {}
      if (minPrice) query['listingData.price'].$gte = Number(minPrice)
      if (maxPrice) query['listingData.price'].$lte = Number(maxPrice)
    }

    if (condition) query['listingData.condition'] = condition
    if (certified === 'true') query['listingData.certified'] = true
    if (language) query['listingData.language'] = language

    if (setName) {
      query['cardSnapshot.setName'] = new RegExp(setName, 'i')
    }

    if (search) {
      query.$or = [
        { 'cardSnapshot.name': new RegExp(search, 'i') },
        { 'cardSnapshot.setName': new RegExp(search, 'i') },
      ]
    }

    const listings = await Listing.find(query)
      .populate('storeId', 'name slug logoUrl rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Listing.countDocuments(query)

    return res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error getting listings:', error)
    return res.status(500).json({ error: 'Failed to get listings' })
  }
}