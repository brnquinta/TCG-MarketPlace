import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import pokemonRoutes from './routes/pokemonProxyRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { authenticateToken, optionalAuth } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

connectDB()

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

const uploadsPath = path.join(__dirname, '../uploads')
app.use('/uploads', express.static(uploadsPath))

app.use('/api/auth', authRoutes)
app.use('/api/stores', optionalAuth, storeRoutes)
app.use('/api/listings', optionalAuth, listingRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/cart', authenticateToken, cartRoutes)
app.use('/api', pokemonRoutes)


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app