import type { Logger } from 'pino';
import type { QueuePort, QueueJob } from '../queue/queuePort';
import type { QueuedWebhookWork } from '../../types/queue';
import type { IdempotencyStore } from '../dedup/idempotencyStore';
import { EventDispatcher } from '../handlers/eventDispatcher';
import type { NormalizedWhatsAppEvent } from '../../types/whatsapp';

export class WebhookWorker {
  constructor(
    private readonly queue: QueuePort<QueuedWebhookWork>,
    private readonly dispatcher: EventDispatcher,
    private readonly idempotencyStore: IdempotencyStore,
    private readonly logger: Logger,
    private readonly idempotencyTtlSeconds: number
  ) {}

  async start(): Promise<void> {
    await this.queue.start(async (job: QueueJob<QueuedWebhookWork>) => {
      const { event, correlationId, eventToken } = job.data;

      const jobLogger = this.logger.child({
        queue: this.queue.getName(),
        queueJobId: job.id,
        eventId: event.eventId,
        eventKind: event.kind,
        correlationId,
        attempts: job.attempts,
      });

      try {
        await this.dispatch(event, {
          correlationId,
          logger: jobLogger,
        });

        const processed = await this.idempotencyStore.markProcessed(
          event.eventId,
          eventToken,
          this.idempotencyTtlSeconds
        );

        if (!processed) {
          jobLogger.warn('Skipping event because claim was no longer owned');
          return;
        }
      } catch (error) {
        // If we've exhausted retries, allow future webhook retries by clearing the claim.
        if (job.attempts + 1 >= job.maxAttempts) {
          await this.idempotencyStore.release(event.eventId, eventToken);
        }
        jobLogger.error(
          {
            eventId: event.eventId,
            error: error instanceof Error ? error.message : String(error),
          },
          'Event processing failed'
        );
        throw error;
      }
    });
  }

  async stop(): Promise<void> {
    await this.queue.stop();
  }

  private async dispatch(event: NormalizedWhatsAppEvent, context: { correlationId: string; logger: Logger }): Promise<void> {
    await this.dispatcher.dispatch(event, context);
  }
}
