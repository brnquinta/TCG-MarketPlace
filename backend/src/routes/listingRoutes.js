import express from 'express'
import { 
  createListing, 
  getMyListings, 
  updateListing, 
  deleteListing,
  getListingById,
  getPublicListings 
} from '../controllers/listingController.js'

const router = express.Router()

router.post('/', createListing)
router.get('/my', getMyListings)
router.put('/:id', updateListing)
router.delete('/:id', deleteListing)
router.get('/:id', getListingById)
router.get('/', getPublicListings)

export default router