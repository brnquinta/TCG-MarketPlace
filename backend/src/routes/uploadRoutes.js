import { Router } from 'express'
import { uploadListingPhotos } from '../controllers/uploadController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.post('/listing-photos', authenticateToken, uploadListingPhotos)

export default router
