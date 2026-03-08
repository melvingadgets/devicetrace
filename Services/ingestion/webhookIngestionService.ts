import { logger } from '../../config/logger';
import { AppError, ValidationError } from '../../Utils/errors';
import type { IdempotencyStore } from '../dedup/idempotencyStore';
import type { QueuePort } from '../queue/queuePort';
import type { QueuedWebhookWork } from '../../Types/queue';
import { WhatsAppWebhookPayloadSchema } from '../../Validation/whatsappWebhook.schema';
import { normalizeWhatsAppWebhookPayload } from '../normalizer/whatsappNormalizer';
import type { NormalizedWhatsAppEvent } from '../../Types/whatsapp';

export interface WebhookIngestionResult {
  accepted: number;
  duplicates: number;
  unsupported: number;
  acceptedEventIds: string[];
  duplicateEventIds: string[];
}

export class WebhookIngestionService {
  constructor(
    private readonly idempotencyStore: IdempotencyStore,
    private readonly queue: QueuePort<QueuedWebhookWork>,
    private readonly idempotencyTtlSeconds: number
  ) {}

  async ingest(rawPayload: unknown, correlationId: string): Promise<WebhookIngestionResult> {
    const parseResult = WhatsAppWebhookPayloadSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      logger.warn(
        {
          correlationId,
          issues: parseResult.error.issues,
        },
        'Invalid WhatsApp webhook payload'
      );
      throw new ValidationError('Invalid WhatsApp webhook payload', parseResult.error.issues);
    }

    // Parsing once and then normalizing into typed events gives predictable processing input.
    const events = normalizeWhatsAppWebhookPayload(
      parseResult.data,
      new Date().toISOString()
    );

    const acceptedEventIds: string[] = [];
    const duplicateEventIds: string[] = [];
    let unsupportedCount = 0;

    for (const event of events) {
      const token = await this.idempotencyStore.tryAcquire(event.eventId, this.idempotencyTtlSeconds);
      if (!token) {
        duplicateEventIds.push(event.eventId);
        continue;
      }

      if (event.kind === 'unsupported') {
        unsupportedCount += 1;
      }

      try {
        const work: QueuedWebhookWork = {
          event,
          correlationId,
          eventToken: token,
          ingressAt: event.receivedAt,
        };
        await this.queue.enqueue(work);
        acceptedEventIds.push(event.eventId);
      } catch (error) {
        // Release the in-memory claim so the same event can be retried if enqueue fails.
        await this.idempotencyStore.release(event.eventId, token);
        logger.error(
          { error: String(error), eventId: event.eventId, correlationId },
          'Failed to enqueue webhook event'
        );
        throw new AppError('Failed to enqueue webhook event', 503, 'QUEUE_UNAVAILABLE');
      }
    }

    logger.info(
      {
        correlationId,
        eventsTotal: events.length,
        accepted: acceptedEventIds.length,
        duplicates: duplicateEventIds.length,
        unsupported: unsupportedCount,
      },
      'Webhook payload accepted'
    );

    return {
      accepted: acceptedEventIds.length,
      duplicates: duplicateEventIds.length,
      unsupported: unsupportedCount,
      acceptedEventIds,
      duplicateEventIds,
    };
  }
}
