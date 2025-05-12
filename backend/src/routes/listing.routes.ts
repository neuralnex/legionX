import { Router, Request, Response, RequestHandler } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();
const listingController = new ListingController();

// Public routes
const getListingsHandler: RequestHandler = async (req: Request, res: Response) => {
  await listingController.getListings(req, res);
};

const getListingHandler: RequestHandler = async (req: Request, res: Response) => {
  await listingController.getListing(req, res);
};

// Protected routes
const createListingHandler: RequestHandler = async (req: Request, res: Response) => {
  await listingController.createListing(req, res);
};

const updateListingHandler: RequestHandler = async (req: Request, res: Response) => {
  await listingController.updateListing(req, res);
};

const deleteListingHandler: RequestHandler = async (req: Request, res: Response) => {
  await listingController.deleteListing(req, res);
};

router.get('/', getListingsHandler);
router.get('/:id', getListingHandler);

// Protected routes
router.use(authMiddleware);
router.post('/', createListingHandler);
router.put('/:id', updateListingHandler);
router.delete('/:id', deleteListingHandler);

export default router; 