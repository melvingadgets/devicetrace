import { logger } from '../config/logger';
import { env } from '../config/env';
import { createQueueAdapter } from '../Services/queue/queueFactory';
import { createIdempotencyStore } from '../Services/dedup/dedupFactory';
import { WebhookIngestionService } from '../Services/ingestion/webhookIngestionService';
import { WebhookWorker } from '../Services/worker/webhookWorker';
import { EventDispatcher } from '../Services/handlers/eventDispatcher';
import { MessageEventHandler } from '../Services/handlers/messageEventHandler';
import { StatusEventHandler } from '../Services/handlers/statusEventHandler';
import { UnsupportedEventHandler } from '../Services/handlers/unsupportedEventHandler';
import { NoopAiReplyPipeline } from '../Services/ai/noopAiReplyPipeline';
import { NoopWhatsAppSender } from '../Services/sender/whatsappSender';
import { StaticHumanHandoffGuard } from '../Services/handoff/humanHandoffGuard';
import { WebhookController } from '../Controller/webhook.controller';
import type { QueuePort } from '../Services/queue/queuePort';
import type { IdempotencyStore } from '../Services/dedup/idempotencyStore';
import type { QueuedWebhookWork } from '../Types/queue';

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
