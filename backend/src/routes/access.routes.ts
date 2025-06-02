import type { Request, Response } from 'express';
import { Router } from 'express';
import { AccessController } from '../controllers/access.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();
const accessController = new AccessController();

// All routes are protected
router.use(authMiddleware);

const getMetadataHandler = async (req: Request, res: Response) => {
  await accessController.getMetadata(req, res);
};

const verifyAccessHandler = async (req: Request, res: Response) => {
  await accessController.verifyAccess(req, res);
};

router.get('/metadata/:listingId', getMetadataHandler);
router.get('/verify/:listingId', verifyAccessHandler);

export default router; 