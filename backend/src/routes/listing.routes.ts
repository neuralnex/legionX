import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const listingController = new ListingController();

// Public routes
router.get('/', listingController.listListings);
router.get('/:id', listingController.getListing);

// Protected routes
router.use(authMiddleware);
router.post('/', listingController.createListing);
router.put('/:id', listingController.updateListing);
router.delete('/:id', listingController.deleteListing);

export default router; 