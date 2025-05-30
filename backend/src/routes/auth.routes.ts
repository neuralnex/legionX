import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/link-wallet', AuthController.linkWallet);
router.post('/login/wallet', AuthController.loginWithWallet);
router.get('/verify', AuthController.verifyToken);

// Protected routes
router.get('/profile', authMiddleware, (req: Request, res: Response) => {
    const controller = new AuthController();
    controller.getProfile(req, res);
});

export default router; 