import express from 'express'
import { createStore, getMyStore, updateStore, getStoreBySlug, getAllStores } from '../controllers/storeController.js'

const router = express.Router()

router.post('/', createStore)
router.get('/me', getMyStore)
router.put('/me', updateStore)
router.get('/slug/:slug', getStoreBySlug)
router.get('/', getAllStores)

export default router