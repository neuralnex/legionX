declare module './middleware/error.middleware' {
  import { Request, Response, NextFunction } from 'express';

  export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
  }

  export const errorHandler: (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
}

declare module './middleware/logger.middleware' {
  import { Request, Response, NextFunction } from 'express';
  
  export const requestLogger: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
} 