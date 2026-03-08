import type { Express } from 'express';
import { WebhookController } from '../Controller/webhook.controller';
import { healthRouter } from './health.routes';
import { webhookRouter } from './webhook.routes';

export const registerRoutes = (app: Express, webhookController: WebhookController): void => {
  app.use('/', healthRouter());
  app.use('/', webhookRouter(webhookController));
};
