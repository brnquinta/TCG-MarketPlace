import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import pokemonRoutes from './routes/pokemonProxyRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import debugRoutes from './routes/debugRoutes.js'
import { authenticateToken, optionalAuth } from './middleware/auth.js'

dotenv.config()

console.log('ENV KEY:', process.env.POKEMON_TCG_API_KEY)

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

connectDB()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/stores', optionalAuth, storeRoutes)
app.use('/api/listings', optionalAuth, listingRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/cart', authenticateToken, cartRoutes)
app.use('/api/debug', debugRoutes)
app.use('/api', pokemonRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app