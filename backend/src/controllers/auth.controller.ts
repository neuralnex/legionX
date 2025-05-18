import { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { RegisterRequest, LinkWalletRequest, AuthError } from '../types/auth';
import { Logger } from '../utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, wallet } = req.body;
      const user = await AuthService.register({ email, wallet });
      const token = await new AuthService().generateToken(user);
      
      res.json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          wallet: user.wallet
        }
      });
    } catch (error) {
      Logger.error('Error registering user:', error);
      res.status(400).json({ error: 'Failed to register user' });
    }
  }

  /**
   * Link wallet to user
   */
  static async linkWallet(req: Request, res: Response) {
    try {
      const { email, wallet } = req.body;
      const user = await AuthService.linkWallet({ email, wallet });
      const token = await new AuthService().generateToken(user);
      
      res.json({
        message: 'Wallet linked successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          wallet: user.wallet
        }
      });
    } catch (error) {
      Logger.error('Error linking wallet:', error);
      res.status(400).json({ error: 'Failed to link wallet' });
    }
  }

  /**
   * Login with wallet
   */
  static async loginWithWallet(req: Request, res: Response) {
    try {
      const { wallet } = req.body;
      const user = await AuthService.findByWallet(wallet);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = await new AuthService().generateToken(user);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          wallet: user.wallet
        }
      });
    } catch (error) {
      Logger.error('Error logging in with wallet:', error);
      res.status(400).json({ error: 'Failed to login' });
    }
  }

  /**
   * Verify token
   */
  static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const payload = await new AuthService().verifyToken(token);
      
      res.json({
        message: 'Token is valid',
        user: payload
      });
    } catch (error) {
      Logger.error('Error verifying token:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.getUserByEmail(req.user.email);
      if (!user) {
        const error: AuthError = {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        };
        res.status(404).json({ error });
        return;
      }

      res.json({ user });
    } catch (error) {
      const authError: AuthError = {
        code: 'PROFILE_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Failed to get profile'
      };
      res.status(500).json({ error: authError });
    }
  };
} 