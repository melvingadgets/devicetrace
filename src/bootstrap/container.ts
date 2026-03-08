import { logger } from '../config/logger';
import { env } from '../config/env';
import { createQueueAdapter } from '../services/queue/queueFactory';
import { createIdempotencyStore } from '../services/dedup/dedupFactory';
import { WebhookIngestionService } from '../services/ingestion/webhookIngestionService';
import { WebhookWorker } from '../services/worker/webhookWorker';
import { EventDispatcher } from '../services/handlers/eventDispatcher';
import { MessageEventHandler } from '../services/handlers/messageEventHandler';
import { StatusEventHandler } from '../services/handlers/statusEventHandler';
import { UnsupportedEventHandler } from '../services/handlers/unsupportedEventHandler';
import { NoopAiReplyPipeline } from '../services/ai/noopAiReplyPipeline';
import { NoopWhatsAppSender } from '../services/sender/whatsappSender';
import { StaticHumanHandoffGuard } from '../services/handoff/humanHandoffGuard';
import { WebhookController } from '../controllers/webhook.controller';
import type { QueuePort } from '../services/queue/queuePort';
import type { IdempotencyStore } from '../services/dedup/idempotencyStore';
import type { QueuedWebhookWork } from '../types/queue';

export interface AppContainer {
  webhookController: WebhookController;
  webhookWorker: WebhookWorker;
  queue: QueuePort<QueuedWebhookWork>;
  idempotencyStore: IdempotencyStore;
}

export const createContainer = (): AppContainer => {
  const containerLogger = logger.child({ layer: 'container' });

  const queue = createQueueAdapter();
  const idempotencyStore = createIdempotencyStore();

  const ingestionService = new WebhookIngestionService(
    idempotencyStore,
    queue,
    env.IDEMPOTENCY_TTL_SECONDS
  );

  const aiPipeline = new NoopAiReplyPipeline(containerLogger.child({ subsystem: 'ai' }));
  const sender = new NoopWhatsAppSender(containerLogger.child({ subsystem: 'sender' }));
  const handoffGuard = new StaticHumanHandoffGuard();

  const messageHandler = new MessageEventHandler(
    aiPipeline,
    sender,
    handoffGuard,
    containerLogger.child({ subsystem: 'handler.message' })
  );
  const statusHandler = new StatusEventHandler();
  const unsupportedHandler = new UnsupportedEventHandler(
    containerLogger.child({ subsystem: 'handler.unsupported' })
  );

  const dispatcher = new EventDispatcher(
    [messageHandler, statusHandler],
    unsupportedHandler,
    containerLogger.child({ subsystem: 'dispatcher' })
  );

  const webhookWorker = new WebhookWorker(
    queue,
    dispatcher,
    idempotencyStore,
    logger.child({ subsystem: 'worker' }),
    env.IDEMPOTENCY_TTL_SECONDS
  );

  const webhookController = new WebhookController(ingestionService, env.VERIFY_TOKEN);

  return {
    webhookController,
    webhookWorker,
    queue,
    idempotencyStore,
  };
};
