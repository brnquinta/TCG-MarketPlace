import jwt from 'jsonwebtoken'

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

    req.user = {
      clerkId: decoded.payload.sub,
      email: decoded.payload.email
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
        req.user = {
          clerkId: decoded.payload.sub,
          email: decoded.payload.email
        }
      }
    }

    next()
  } catch (error) {
    next()
  }
}