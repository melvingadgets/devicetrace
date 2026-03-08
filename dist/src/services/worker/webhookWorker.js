"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookWorker = void 0;
class WebhookWorker {
    queue;
    dispatcher;
    idempotencyStore;
    logger;
    idempotencyTtlSeconds;
    constructor(queue, dispatcher, idempotencyStore, logger, idempotencyTtlSeconds) {
        this.queue = queue;
        this.dispatcher = dispatcher;
        this.idempotencyStore = idempotencyStore;
        this.logger = logger;
        this.idempotencyTtlSeconds = idempotencyTtlSeconds;
    }
    async start() {
        await this.queue.start(async (job) => {
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
                const processed = await this.idempotencyStore.markProcessed(event.eventId, eventToken, this.idempotencyTtlSeconds);
                if (!processed) {
                    jobLogger.warn('Skipping event because claim was no longer owned');
                    return;
                }
            }
            catch (error) {
                // If we've exhausted retries, allow future webhook retries by clearing the claim.
                if (job.attempts + 1 >= job.maxAttempts) {
                    await this.idempotencyStore.release(event.eventId, eventToken);
                }
                jobLogger.error({
                    eventId: event.eventId,
                    error: error instanceof Error ? error.message : String(error),
                }, 'Event processing failed');
                throw error;
            }
        });
    }
    async stop() {
        await this.queue.stop();
    }
    async dispatch(event, context) {
        await this.dispatcher.dispatch(event, context);
    }
}
exports.WebhookWorker = WebhookWorker;
//# sourceMappingURL=webhookWorker.js.map