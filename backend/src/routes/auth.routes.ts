import type { Request, Response } from 'express';
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { PaymentController } from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();

// Public routes - Fiat-based authentication
router.post('/register', AuthController.register);
router.post('/register/web2', AuthController.registerWeb2);
router.post('/login/web2', AuthController.loginWeb2);
router.post('/login/email', AuthController.loginWithEmail);
router.get('/verify', AuthController.verifyToken);
router.get('/check-exists', AuthController.checkUserExists);

// Payment routes (fiat-based)
router.post('/buy-listing-points', authMiddleware, PaymentController.buyListingPoints);
router.post('/flutterwave/webhook', PaymentController.flutterwaveWebhook);

// Protected routes
router.get('/profile', authMiddleware, (req: Request, res: Response) => {
    const controller = new AuthController();
    controller.getProfile(req, res);
});

export default router; 