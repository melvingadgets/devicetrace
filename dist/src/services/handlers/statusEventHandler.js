"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEventHandler = void 0;
class StatusEventHandler {
    canHandle(event) {
        return event.kind === 'status';
    }
    async handle(event, context) {
        if (event.kind !== 'status')
            return;
        const statusEvent = event;
        const status = statusEvent.payload;
        context.logger.info({
            eventId: event.eventId,
            messageId: statusEvent.source.waMessageId,
            recipientId: status.recipient_id,
            status: status.status,
        }, 'Status event handled');
    }
}
exports.StatusEventHandler = StatusEventHandler;
//# sourceMappingURL=statusEventHandler.js.map