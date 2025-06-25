import { Router } from 'express';
import { PlatformController } from '../controllers/platform.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const platformController = new PlatformController();

// Platform-managed blockchain operations
router.post('/listings', authMiddleware, platformController.createListing);
router.post('/purchases', authMiddleware, platformController.processPurchase);
router.get('/assets', authMiddleware, platformController.getUserAssets);
router.get('/assets/:assetId/metadata', authMiddleware, platformController.getAssetMetadata);
router.post('/marketplace-data', authMiddleware, platformController.getMarketplaceData);
router.get('/stats', authMiddleware, platformController.getPlatformStats);
router.get('/access-summary', authMiddleware, platformController.getUserAccessSummary);
router.post('/mint-token', authMiddleware, platformController.mintAccessToken);

export default router; 