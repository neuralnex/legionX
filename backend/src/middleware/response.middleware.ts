import type { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

export const responseWrapper = (req: Request, res: Response, next: NextFunction) => {
  // Skip response wrapping for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Store original json method
  const originalJson = res.json;

  // Override json method
  res.json = function(data: any) {
    // If data is already wrapped, return as is
    if (data && data.success !== undefined) {
      return originalJson.call(this, data);
    }

    // Wrap the response
    return originalJson.call(this, {
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  };

  next();
}; 