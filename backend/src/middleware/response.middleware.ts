import { Request, Response, NextFunction } from 'express';

export const responseWrapper = (req: Request, res: Response, next: NextFunction) => {
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