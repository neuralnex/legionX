import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/link-wallet', AuthController.linkWallet);
router.post('/login/wallet', AuthController.loginWithWallet);
router.get('/verify', AuthController.verifyToken);

// Protected routes
router.get('/profile', authMiddleware, (req, res) => {
    const controller = new AuthController();
    controller.getProfile(req, res);
});

export default router; 