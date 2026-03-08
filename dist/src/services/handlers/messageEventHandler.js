"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageEventHandler = void 0;
class MessageEventHandler {
    aiPipeline;
    sender;
    handoffGuard;
    logger;
    constructor(aiPipeline, sender, handoffGuard, logger) {
        this.aiPipeline = aiPipeline;
        this.sender = sender;
        this.handoffGuard = handoffGuard;
        this.logger = logger;
    }
    canHandle(event) {
        return event.kind === 'message';
    }
    async handle(event, context) {
        if (event.kind !== 'message')
            return;
        const message = event.payload;
        const messageEvent = event;
        if (!messageEvent.source.from || !messageEvent.source.phoneNumberId) {
            const missingFields = [];
            if (!messageEvent.source.from)
                missingFields.push('from');
            if (!messageEvent.source.phoneNumberId)
                missingFields.push('phoneNumberId');
            context.logger.warn({
                eventId: event.eventId,
                entryId: event.source.entryId,
                missingFields,
            }, 'Message event missing required routing fields');
            return;
        }
        const inHandoff = await this.handoffGuard.isHumanHandoffActive(messageEvent.source.entryId, messageEvent.source.phoneNumberId);
        if (inHandoff) {
            context.logger.info({
                eventId: event.eventId,
                entryId: messageEvent.source.entryId,
            }, 'Skipping AI reply: human handoff active');
            return;
        }
        const aiResult = await this.aiPipeline.generateReply({
            conversationId: messageEvent.source.entryId,
            phoneNumberId: messageEvent.source.phoneNumberId,
            from: messageEvent.source.from,
            messageId: messageEvent.source.waMessageId ?? message.id,
            messageType: message.type,
            text: message.text?.body,
            timestamp: messageEvent.receivedAt,
            rawPayload: message,
        });
        if (aiResult.skip) {
            this.logger.info({
                eventId: event.eventId,
                reason: aiResult.reason,
            }, 'AI reply skipped by pipeline');
            return;
        }
        if (typeof aiResult.text === 'string' && aiResult.text.trim() !== '') {
            await this.sender.sendTextMessage({
                to: messageEvent.source.from,
                phoneNumberId: messageEvent.source.phoneNumberId,
                text: aiResult.text,
            });
            context.logger.info({
                eventId: event.eventId,
            }, 'AI reply delegated to sender adapter');
        }
    }
}
exports.MessageEventHandler = MessageEventHandler;
//# sourceMappingURL=messageEventHandler.js.map