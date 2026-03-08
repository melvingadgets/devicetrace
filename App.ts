import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { registerRoutes } from './Router';
import { errorHandler } from './Middleware/errorHandler';
import { requestContextMiddleware } from './Middleware/requestContext';
import { WebhookController } from './Controller/webhook.controller';

const parseCorsOrigins = (): boolean | string[] => {
  if (env.CORS_ORIGINS === '*') return true;
  return env.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean);
};

export const createApp = (webhookController: WebhookController): express.Express => {
  const app = express();
  app.disable('x-powered-by');

  // Security hardening at the edge.
  app.use(helmet());
  app.use(
    cors({
      origin: parseCorsOrigins(),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-correlation-id'],
      credentials: false,
    })
  );

  // Set body limit to guard against oversized payload attacks.
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
  app.use(requestContextMiddleware);

  registerRoutes(app, webhookController);

  // Keep this last so all thrown errors get centralized handling.
  app.use(errorHandler);

  return app;
};
