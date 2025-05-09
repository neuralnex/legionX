import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { UserPayload, AuthError } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      const error: AuthError = {
        code: 'NO_TOKEN',
        message: 'No token provided'
      };
      res.status(401).json({ error });
      return;
    }

    const token = authHeader.split(' ')[1];
    const authService = new AuthService();
    
    try {
      const payload = await authService.verifyToken(token) as UserPayload;
      req.user = payload;
      next();
    } catch (verifyError) {
      const error: AuthError = {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      };
      res.status(401).json({ error });
    }
  } catch (error) {
    const authError: AuthError = {
      code: 'AUTH_ERROR',
      message: error instanceof Error ? error.message : 'Authentication failed'
    };
    res.status(500).json({ error: authError });
  }
}; 