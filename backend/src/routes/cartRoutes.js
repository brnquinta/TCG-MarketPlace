import express from 'express'
import { getCart, addItem, removeItem, clearCart } from '../controllers/cartController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateToken, getCart)
router.post('/items', authenticateToken, addItem)
router.delete('/items/:listingId', authenticateToken, removeItem)
router.delete('/', authenticateToken, clearCart)

export default router