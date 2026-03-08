import { env } from '../../config/env';
import { QueuedWebhookWork } from '../../Types/queue';
import type { QueuePort } from './queuePort';
import { InMemoryQueue } from './inMemoryQueue';

export const createQueueAdapter = (): QueuePort<QueuedWebhookWork> => {
  // In-memory queue keeps local development and quick CI runs lightweight.
  return new InMemoryQueue<QueuedWebhookWork>(
    'whatsapp-webhook-dev',
    env.QUEUE_CONCURRENCY,
    env.QUEUE_MAX_ATTEMPTS
  );
};
