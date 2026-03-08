import type { ErrorRequestHandler } from 'express';
import { logger as baseLogger } from '../config/logger';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestLogger = req.logger ?? baseLogger;
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
  const responsePayload = {
    success: false,
    code,
    error: error instanceof AppError ? error.message : 'Internal server error',
    ...(error instanceof AppError && error.details ? { details: error.details } : {}),
  };

  requestLogger.error(
    {
      statusCode,
      path: req.path,
      method: req.method,
      errorName: error?.name,
      errorMessage: error?.message,
    },
    'Request failed'
  );

  res.status(statusCode).json(responsePayload);
};
