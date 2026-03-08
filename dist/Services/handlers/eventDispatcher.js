"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
// Handler registry keeps event routing explicit and testable.
class EventDispatcher {
    handlers;
    fallbackHandler;
    logger;
    constructor(handlers, fallbackHandler, logger) {
        this.handlers = handlers;
        this.fallbackHandler = fallbackHandler;
        this.logger = logger;
    }
    async dispatch(event, context) {
        const handler = this.handlers.find((candidate) => candidate.canHandle(event)) ?? this.fallbackHandler;
        this.logger.debug({ eventId: event.eventId, eventKind: event.kind }, 'Dispatching normalized event');
        await handler.handle(event, context);
    }
}
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=eventDispatcher.js.map