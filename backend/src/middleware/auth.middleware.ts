import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.js';

const authService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const user = await authService.verifyToken(token);
    (req as any).user = user;
    next();
    return;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}; 