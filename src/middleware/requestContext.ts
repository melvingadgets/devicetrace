import { v4 as uuidv4 } from 'uuid';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const headerValue = req.header('x-correlation-id');
  const correlationId =
    typeof headerValue === 'string' && headerValue.trim() !== '' ? headerValue : uuidv4();

  req.correlationId = correlationId;
  req.logger = logger.child({
    correlationId,
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
    },
  });

  res.setHeader('x-correlation-id', correlationId);
  next();
};
