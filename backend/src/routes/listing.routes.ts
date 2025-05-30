import { Router, Request, Response } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Public routes
router.get('/', (req: Request, res: Response) => {
    const controller = new ListingController();
    controller.listListings(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
    const controller = new ListingController();
    controller.getListing(req, res);
});

// Protected routes
router.post('/', authMiddleware, (req: Request, res: Response) => {
    const controller = new ListingController();
    controller.createListing(req, res);
});

router.put('/:id', authMiddleware, (req: Request, res: Response) => {
    const controller = new ListingController();
    controller.updateListing(req, res);
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
    const controller = new ListingController();
    controller.deleteListing(req, res);
});

export default router; 