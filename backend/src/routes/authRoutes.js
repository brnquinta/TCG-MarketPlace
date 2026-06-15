import express from 'express'
import { syncUser, getUser, getCurrentUser } from '../controllers/authController.js'

const router = express.Router()

router.post('/sync', syncUser)
router.get('/user/:clerkId', getUser)
router.get('/me', getCurrentUser)

export default router