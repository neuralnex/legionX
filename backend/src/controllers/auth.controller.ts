import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.js';
import { Web2AuthService } from '../services/web2auth.js';
import type { RegisterRequest, AuthError } from '../types/auth.js';
import { Logger } from '../utils/logger.js';
import { AppError } from '../middleware/error.middleware.js';

const web2AuthService = new Web2AuthService();

export class AuthController {
  private authService: AuthService;
  private logger: Logger;

  constructor() {
    this.authService = new AuthService();
    this.logger = new Logger('AuthController');
  }

  /**
   * Web2 Registration (email, username, password)
   */
  static async registerWeb2(req: Request, res: Response) {
    try {
      const { email, username, firstName, lastName, password } = req.body;
      const user = await web2AuthService.register({ email, username, firstName, lastName, password });
      const accessToken = await web2AuthService.generateAccessToken(user);
      const refreshToken = await web2AuthService.generateRefreshToken(user);
      res.json({
        message: 'User registered successfully',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      Logger.error('Error registering user (web2):', error);
      res.status(400).json({ error: error.message || 'Failed to register user' });
    }
  }

  /**
   * Web2 Login (email, password)
   */
  static async loginWeb2(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await web2AuthService.login({ email, password });
      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      Logger.error('Error logging in (web2):', error);
      res.status(401).json({ error: error.message || 'Failed to login' });
    }
  }

  /**
   * Register a new user (fiat-based)
   */
  static async register(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await AuthService.register({ email });
      const token = await new AuthService().generateToken(user);
      
      res.json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error: any) {
      Logger.error('Error registering user:', error);
      
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        if (error.message.includes('email')) {
          res.status(409).json({ error: 'Email already registered' });
        } else {
          res.status(409).json({ error: error.message });
        }
      } else {
        res.status(400).json({ error: 'Failed to register user' });
      }
    }
  }

  /**
   * Login with email (fiat-based authentication)
   */
  static async loginWithEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await AuthService.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const token = await new AuthService().generateToken(user);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      Logger.error('Error logging in with email:', error);
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

  /**
   * Get user profile
   */
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

  /**
   * Check if user exists
   */
  static async checkUserExists(req: Request, res: Response) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const { emailExists } = await AuthService.userExists(email as string);
      
      res.json({
        emailExists: !!email && emailExists,
        exists: emailExists
      });
    } catch (error: any) {
      Logger.error('Error checking user existence:', error);
      res.status(400).json({ error: 'Failed to check user existence' });
    }
  }
} 