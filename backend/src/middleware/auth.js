import { verifyToken } from '@clerk/clerk-sdk-node'
import User from '../models/User.js'

const buildUser = async (payload) => {
  const clerkId = payload.sub
  let user = await User.findOne({ clerkId })

  if (!user) {
    user = new User({
      clerkId,
      email: payload.email || `${clerkId}@temp.local`,
      firstName: payload.first_name || '',
      lastName: payload.last_name || ''
    })
    await user.save()
    console.log(`Usuario criado automaticamente: ${clerkId}`)
  }

  return {
    clerkId,
    email: user.email,
    id: user._id
  }
}

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })

    req.user = await buildUser(payload)
    next()
  } catch (error) {
    console.error('Auth error:', error.message)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })

      req.user = {
        clerkId: payload.sub,
        email: payload.email
      }
    }

    next()
  } catch (error) {
    console.error('optionalAuth: token verification failed:', error.message)
    next()
  }
}