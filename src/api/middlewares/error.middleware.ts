import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // Fallback
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error',
  });
};
