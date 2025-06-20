import type { Request, Response } from 'express';
import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();

// CORS preflight handling
router.options('/', (req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.status(204).send();
});

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