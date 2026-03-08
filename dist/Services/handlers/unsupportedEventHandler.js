"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedEventHandler = void 0;
class UnsupportedEventHandler {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    canHandle(_event) {
        return true;
    }
    async handle(event, context) {
        if (event.kind !== 'unsupported') {
            context.logger.debug({ eventId: event.eventId }, 'UnsupportedEventHandler received non-unsupported event');
            return;
        }
        const payload = event.payload;
        this.logger.warn({
            eventId: event.eventId,
            source: event.source,
            reason: payload.reason,
            reasonCode: payload.reasonCode,
            details: payload.details,
        }, 'Unsupported WhatsApp event ignored');
    }
}
exports.UnsupportedEventHandler = UnsupportedEventHandler;
//# sourceMappingURL=unsupportedEventHandler.js.map