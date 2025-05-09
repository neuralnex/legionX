import { Router, RequestHandler } from 'express';
import { AccessController } from '../controllers/access.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const accessController = new AccessController();

// All routes are protected
router.use(authMiddleware);

const getMetadataHandler: RequestHandler = async (req, res) => {
  await accessController.getMetadata(req, res);
};

const verifyAccessHandler: RequestHandler = async (req, res) => {
  await accessController.verifyAccess(req, res);
};

router.get('/metadata/:assetId', getMetadataHandler);
router.get('/verify/:assetId', verifyAccessHandler);

export default router; 