"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookIngestionService = void 0;
const logger_1 = require("../../config/logger");
const errors_1 = require("../../Utils/errors");
const whatsappWebhook_schema_1 = require("../../Validation/whatsappWebhook.schema");
const whatsappNormalizer_1 = require("../normalizer/whatsappNormalizer");
class WebhookIngestionService {
    idempotencyStore;
    queue;
    idempotencyTtlSeconds;
    constructor(idempotencyStore, queue, idempotencyTtlSeconds) {
        this.idempotencyStore = idempotencyStore;
        this.queue = queue;
        this.idempotencyTtlSeconds = idempotencyTtlSeconds;
    }
    async ingest(rawPayload, correlationId) {
        const parseResult = whatsappWebhook_schema_1.WhatsAppWebhookPayloadSchema.safeParse(rawPayload);
        if (!parseResult.success) {
            logger_1.logger.warn({
                correlationId,
                issues: parseResult.error.issues,
            }, 'Invalid WhatsApp webhook payload');
            throw new errors_1.ValidationError('Invalid WhatsApp webhook payload', parseResult.error.issues);
        }
        // Parsing once and then normalizing into typed events gives predictable processing input.
        const events = (0, whatsappNormalizer_1.normalizeWhatsAppWebhookPayload)(parseResult.data, new Date().toISOString());
        const acceptedEventIds = [];
        const duplicateEventIds = [];
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
                const work = {
                    event,
                    correlationId,
                    eventToken: token,
                    ingressAt: event.receivedAt,
                };
                await this.queue.enqueue(work);
                acceptedEventIds.push(event.eventId);
            }
            catch (error) {
                // Release the in-memory claim so the same event can be retried if enqueue fails.
                await this.idempotencyStore.release(event.eventId, token);
                logger_1.logger.error({ error: String(error), eventId: event.eventId, correlationId }, 'Failed to enqueue webhook event');
                throw new errors_1.AppError('Failed to enqueue webhook event', 503, 'QUEUE_UNAVAILABLE');
            }
        }
        logger_1.logger.info({
            correlationId,
            eventsTotal: events.length,
            accepted: acceptedEventIds.length,
            duplicates: duplicateEventIds.length,
            unsupported: unsupportedCount,
        }, 'Webhook payload accepted');
        return {
            accepted: acceptedEventIds.length,
            duplicates: duplicateEventIds.length,
            unsupported: unsupportedCount,
            acceptedEventIds,
            duplicateEventIds,
        };
    }
}
exports.WebhookIngestionService = WebhookIngestionService;
//# sourceMappingURL=webhookIngestionService.js.map