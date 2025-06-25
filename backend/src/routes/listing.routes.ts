import type { Request, Response } from 'express';
import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';

const router = Router();
const listingController = new ListingController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create listing with IPFS integration
router.post('/create-with-ipfs', listingController.createListingWithIPFS.bind(listingController));

// Get IPFS content URL
router.get('/ipfs/:ipfsHash', listingController.getIPFSContent.bind(listingController));

// Get listings with pagination and filters
router.get('/', listingController.getListings.bind(listingController));

// Existing routes
router.post('/', listingController.createListing.bind(listingController));
router.get('/:id', listingController.getListing.bind(listingController));
router.put('/:id', listingController.updateListing.bind(listingController));
router.delete('/:id', listingController.deleteListing.bind(listingController));
router.get('/list', listingController.listListings.bind(listingController));

// CORS preflight handling
router.options('/', (req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.status(204).send();
});

export default router; 