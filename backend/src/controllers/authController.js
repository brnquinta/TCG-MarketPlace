import User from '../models/User.js'

export const syncUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl } = req.body

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' })
    }

    let user = await User.findOne({ clerkId })

    if (user) {
      user.firstName = firstName || user.firstName
      user.lastName = lastName || user.lastName
      user.imageUrl = imageUrl || user.imageUrl
      await user.save()
      return res.json(user)
    }

    user = new User({
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl
    })

    await user.save()
    res.status(201).json(user)
  } catch (error) {
    console.error('Error syncing user:', error)
    res.status(500).json({ error: 'Failed to sync user' })
  }
}

export const getUser = async (req, res) => {
  try {
    const { clerkId } = req.params
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error getting user:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.clerkId })
    res.json(user)
  } catch (error) {
    console.error('Error getting current user:', error)
    res.status(500).json({ error: 'Failed to get current user' })
  }
}