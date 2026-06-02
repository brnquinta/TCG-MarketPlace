import { Router } from 'express'
import { uploadListingPhotos, uploadStoreImage } from '../controllers/uploadController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.post('/listing-photos', authenticateToken, uploadListingPhotos)
router.post('/store-image', authenticateToken, uploadStoreImage)

export default router
