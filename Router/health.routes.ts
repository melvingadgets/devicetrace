import { Router } from 'express';
import { env } from '../config/env';

export const healthRouter = (): Router => {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'whatsapp-webhook-service',
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};
