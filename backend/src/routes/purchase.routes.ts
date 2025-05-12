import { Router, Request, Response } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();
const purchaseController = new PurchaseController();

// All routes are protected
router.use(authMiddleware);

const createPurchaseHandler = async (req: Request, res: Response) => {
  await purchaseController.createPurchase(req, res);
};

const getPurchasesHandler = async (req: Request, res: Response) => {
  await purchaseController.getPurchases(req, res);
};

const getPurchaseHandler = async (req: Request, res: Response) => {
  await purchaseController.getPurchase(req, res);
};

router.post('/', createPurchaseHandler);
router.get('/', getPurchasesHandler);
router.get('/:id', getPurchaseHandler);

export default router; 