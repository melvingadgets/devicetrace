"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContainer = void 0;
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const queueFactory_1 = require("../Services/queue/queueFactory");
const dedupFactory_1 = require("../Services/dedup/dedupFactory");
const webhookIngestionService_1 = require("../Services/ingestion/webhookIngestionService");
const webhookWorker_1 = require("../Services/worker/webhookWorker");
const eventDispatcher_1 = require("../Services/handlers/eventDispatcher");
const messageEventHandler_1 = require("../Services/handlers/messageEventHandler");
const statusEventHandler_1 = require("../Services/handlers/statusEventHandler");
const unsupportedEventHandler_1 = require("../Services/handlers/unsupportedEventHandler");
const noopAiReplyPipeline_1 = require("../Services/ai/noopAiReplyPipeline");
const whatsappSender_1 = require("../Services/sender/whatsappSender");
const humanHandoffGuard_1 = require("../Services/handoff/humanHandoffGuard");
const webhook_controller_1 = require("../Controller/webhook.controller");
const createContainer = () => {
    const containerLogger = logger_1.logger.child({ layer: 'container' });
    const queue = (0, queueFactory_1.createQueueAdapter)();
    const idempotencyStore = (0, dedupFactory_1.createIdempotencyStore)();
    const ingestionService = new webhookIngestionService_1.WebhookIngestionService(idempotencyStore, queue, env_1.env.IDEMPOTENCY_TTL_SECONDS);
    const aiPipeline = new noopAiReplyPipeline_1.NoopAiReplyPipeline(containerLogger.child({ subsystem: 'ai' }));
    const sender = new whatsappSender_1.NoopWhatsAppSender(containerLogger.child({ subsystem: 'sender' }));
    const handoffGuard = new humanHandoffGuard_1.StaticHumanHandoffGuard();
    const messageHandler = new messageEventHandler_1.MessageEventHandler(aiPipeline, sender, handoffGuard, containerLogger.child({ subsystem: 'handler.message' }));
    const statusHandler = new statusEventHandler_1.StatusEventHandler();
    const unsupportedHandler = new unsupportedEventHandler_1.UnsupportedEventHandler(containerLogger.child({ subsystem: 'handler.unsupported' }));
    const dispatcher = new eventDispatcher_1.EventDispatcher([messageHandler, statusHandler], unsupportedHandler, containerLogger.child({ subsystem: 'dispatcher' }));
    const webhookWorker = new webhookWorker_1.WebhookWorker(queue, dispatcher, idempotencyStore, logger_1.logger.child({ subsystem: 'worker' }), env_1.env.IDEMPOTENCY_TTL_SECONDS);
    const webhookController = new webhook_controller_1.WebhookController(ingestionService, env_1.env.VERIFY_TOKEN);
    return {
        webhookController,
        webhookWorker,
        queue,
        idempotencyStore,
    };
};
exports.createContainer = createContainer;
//# sourceMappingURL=container.js.map