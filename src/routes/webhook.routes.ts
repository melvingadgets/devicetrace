import { Router } from 'express';
import { env } from '../config/env';
import { WebhookController } from '../controllers/webhook.controller';

export const webhookRouter = (webhookController: WebhookController): Router => {
  const router = Router();

  // GET /webhook for Meta challenge verification.
  router.get(env.WEBHOOK_PATH, webhookController.verifyWebhook);

  // POST /webhook for event delivery.
  router.post(env.WEBHOOK_PATH, webhookController.handleWebhook);
  return router;
};
