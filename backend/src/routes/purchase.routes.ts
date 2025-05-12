import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const purchaseController = new PurchaseController();

// Protected routes
router.use(authMiddleware);
router.post('/', purchaseController.createPurchase);
router.get('/:id', purchaseController.getPurchase);
router.put('/:id', purchaseController.updatePurchase);
router.get('/', purchaseController.listPurchases);

export default router; 