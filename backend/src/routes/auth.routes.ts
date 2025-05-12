import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/link-wallet', authMiddleware, authController.linkWallet);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

export default router; 