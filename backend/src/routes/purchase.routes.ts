import { Router, RequestHandler } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const purchaseController = new PurchaseController();

// All routes are protected
router.use(authMiddleware);

const createPurchaseHandler: RequestHandler = async (req, res) => {
  await purchaseController.createPurchase(req, res);
};

const getPurchasesHandler: RequestHandler = async (req, res) => {
  await purchaseController.getPurchases(req, res);
};

const getPurchaseHandler: RequestHandler = async (req, res) => {
  await purchaseController.getPurchase(req, res);
};

router.post('/', createPurchaseHandler);
router.get('/', getPurchasesHandler);
router.get('/:id', getPurchaseHandler);

export default router; 