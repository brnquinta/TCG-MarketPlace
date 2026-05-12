import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const CLERK_PUBLIC_KEY = process.env.CLERK_SECRET_KEY

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.decode(token, { complete: true })
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const payload = decoded.payload
    const clerkId = payload.sub || payload._id
    
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

    req.user = {
      clerkId,
      email: user.email,
      id: user._id
    }

    next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.decode(token, { complete: true })
      
      if (decoded) {
        const payload = decoded.payload
        req.user = {
          clerkId: payload.sub || payload._id,
          email: payload.email
        }
      }
    }

    next()
  } catch (error) {
    next()
  }
}