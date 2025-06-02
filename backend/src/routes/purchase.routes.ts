import type { Request, Response } from 'express';
import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();

// Protected routes
router.post('/', authMiddleware, (req: Request, res: Response) => {
    const controller = new PurchaseController();
    controller.createPurchase(req, res);
});

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
    const controller = new PurchaseController();
    controller.getPurchase(req, res);
});

router.get('/user/:userId', authMiddleware, (req: Request, res: Response) => {
    const controller = new PurchaseController();
    controller.listPurchases(req, res);
});

export default router; 