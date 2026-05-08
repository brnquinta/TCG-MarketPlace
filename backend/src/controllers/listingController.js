import Listing from '../models/Listing.js'
import Store from '../models/Store.js'
import User from '../models/User.js'

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

    const listing = new Listing({
      storeId: store._id,
      userId: user._id,
      cardSnapshot,
      listingData: {
        ...listingData,
        price: parseFloat(listingData.price),
        quantity: parseInt(listingData.quantity) || 1
      },
      photos: photos || {},
      status: 'active',
      views: 0
    })

    await listing.save()

    store.stats.activeListings += 1
    await store.save()

    res.status(201).json(listing)
  } catch (error) {
    console.error('Error creating listing:', error)
    res.status(500).json({ error: 'Failed to create listing' })
  }
}

export const getMyListings = async (req, res) => {
  try {
    const clerkId = req.user.clerkId
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const listings = await Listing.find({ userId: user._id })
      .sort({ createdAt: -1 })

    res.json(listings)
  } catch (error) {
    console.error('Error getting listings:', error)
    res.status(500).json({ error: 'Failed to get listings' })
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
    if (listingData) listing.listingData = { ...listing.listingData, ...listingData }
    if (photos) listing.photos = { ...listing.photos, ...photos }
    if (status) listing.status = status

    await listing.save()
    res.json(listing)
  } catch (error) {
    console.error('Error updating listing:', error)
    res.status(500).json({ error: 'Failed to update listing' })
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

    res.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('Error deleting listing:', error)
    res.status(500).json({ error: 'Failed to delete listing' })
  }
}

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params

    const listing = await Listing.findById(id)
      .populate('storeId', 'name slug logoUrl rating location')

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    listing.views += 1
    await listing.save()

    res.json(listing)
  } catch (error) {
    console.error('Error getting listing:', error)
    res.status(500).json({ error: 'Failed to get listing' })
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
      search
    } = req.query

    const query = { status: 'active' }

    if (minPrice || maxPrice) {
      query['listingData.price'] = {}
      if (minPrice) query['listingData.price'].$gte = parseFloat(minPrice)
      if (maxPrice) query['listingData.price'].$lte = parseFloat(maxPrice)
    }
    if (condition) query['listingData.condition'] = condition
    if (certified === 'true') query['listingData.certified'] = true
    if (language) query['listingData.language'] = language
    if (setName) query['cardSnapshot.setName'] = new RegExp(setName, 'i')
    if (search) {
      query.$or = [
        { 'cardSnapshot.name': new RegExp(search, 'i') },
        { 'cardSnapshot.setName': new RegExp(search, 'i') }
      ]
    }

    const listings = await Listing.find(query)
      .populate('storeId', 'name slug logoUrl rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Listing.countDocuments(query)

    res.json({
      listings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error getting listings:', error)
    res.status(500).json({ error: 'Failed to get listings' })
  }
}