import { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { RegisterRequest, LinkWalletRequest, AuthError } from '../types/auth';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
    try {
      const { email, wallet } = req.body;
      
      const existingUser = await this.authService.getUserByEmail(email);
      if (existingUser) {
        const error: AuthError = {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered'
        };
        res.status(400).json({ error });
        return;
      }

      const user = await this.authService.createUser(email, wallet);
      const token = this.authService.generateToken(user);

      res.status(201).json({ user, token });
    } catch (error) {
      const authError: AuthError = {
        code: 'REGISTRATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to register user'
      };
      res.status(500).json({ error: authError });
    }
  };

  linkWallet = async (req: Request<{}, {}, LinkWalletRequest>, res: Response): Promise<void> => {
    try {
      const { email, wallet } = req.body;
      
      const user = await this.authService.linkWallet(email, wallet);
      const token = this.authService.generateToken(user);

      res.json({ user, token });
    } catch (error) {
      const authError: AuthError = {
        code: 'WALLET_LINK_FAILED',
        message: error instanceof Error ? error.message : 'Failed to link wallet'
      };
      res.status(500).json({ error: authError });
    }
  };

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