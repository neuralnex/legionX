import type { Request, Response } from 'express';
import { Router } from 'express';
import { PremiumController } from '../controllers/premium.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();

// Public routes
router.get('/features', PremiumController.getPremiumFeatures);
router.get('/analytics/features', PremiumController.getAnalyticsFeatures);

// Protected routes
router.post('/listing/:listingId', authMiddleware, PremiumController.purchasePremiumListing);
router.post('/analytics/subscribe', authMiddleware, PremiumController.purchaseAnalyticsSubscription);

export default router; 