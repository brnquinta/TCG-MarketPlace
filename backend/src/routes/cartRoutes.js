import express from 'express'
import { getCart, addItem, removeItem, clearCart } from '../controllers/cartController.js'

const router = express.Router()

router.get('/', getCart)
router.post('/items', addItem)
router.delete('/items/:listingId', removeItem)
router.delete('/', clearCart)

export default router