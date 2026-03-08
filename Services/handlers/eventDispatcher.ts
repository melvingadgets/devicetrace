import { NormalizedWhatsAppEvent } from '../../Types/whatsapp';
import type { EventHandler, EventHandlerContext } from './types';

// Handler registry keeps event routing explicit and testable.
export class EventDispatcher {
  constructor(
    private readonly handlers: EventHandler[],
    private readonly fallbackHandler: EventHandler,
    private readonly logger: import('pino').Logger
  ) {}

  async dispatch(event: NormalizedWhatsAppEvent, context: EventHandlerContext): Promise<void> {
    const handler = this.handlers.find((candidate) => candidate.canHandle(event)) ?? this.fallbackHandler;
    this.logger.debug({ eventId: event.eventId, eventKind: event.kind }, 'Dispatching normalized event');
    await handler.handle(event, context);
  }
}
