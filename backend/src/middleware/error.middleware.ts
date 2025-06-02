import type { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code: string;
  details?: { [key: string]: string };

  constructor(message: string, statusCode: number, code: string, details?: { [key: string]: string }) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      timestamp: new Date().toISOString()
    });
  }

  // Programming or other unknown error
  console.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong'
    },
    timestamp: new Date().toISOString()
  });
}; 