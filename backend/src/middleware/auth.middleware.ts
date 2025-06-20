import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.js';

const authService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[authMiddleware] No token provided. Header:', authHeader);
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    const token = authHeader.split(' ')[1];
    console.log('[authMiddleware] Received token:', token);
    try {
      const user = await authService.verifyToken(token);
      (req as any).user = user;
      next();
      return;
    } catch (verifyError) {
      console.error('[authMiddleware] Token verification failed:', verifyError instanceof Error ? verifyError.message : verifyError);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.error('[authMiddleware] Unexpected error:', error instanceof Error ? error.message : error);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}; 