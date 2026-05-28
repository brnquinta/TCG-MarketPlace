import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// ========================
// ENV CONFIG (TEM QUE SER PRIMEIRO)
// ========================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
// DEBUG

console.log('MONGO URI:', process.env.MONGODB_URI) 

// ========================
// IMPORTS (DEPOIS DO ENV)
// ========================
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import pokemonRoutes from './routes/pokemonProxyRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import debugRoutes from './routes/debugRoutes.js'
import { authenticateToken, optionalAuth } from './middleware/auth.js'

// ========================
// INIT APP
// ========================
const app = express()
const PORT = process.env.PORT || 3001

// ========================
// MIDDLEWARES
// ========================
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ========================
// DB CONNECTION
// ========================
connectDB()

// ========================
// ROUTES
// ========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/stores', optionalAuth, storeRoutes)
app.use('/api/listings', optionalAuth, listingRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/cart', authenticateToken, cartRoutes)
app.use('/api/debug', debugRoutes)
app.use('/api', pokemonRoutes)

// ========================
// ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app