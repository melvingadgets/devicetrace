import type { Logger } from 'pino';
import type { EventHandler, EventHandlerContext } from './types';
import type { NormalizedUnsupportedEvent, NormalizedWhatsAppEvent } from '../../types/whatsapp';

export class UnsupportedEventHandler implements EventHandler {
  constructor(private readonly logger: Logger) {}

  canHandle(_event: NormalizedWhatsAppEvent): boolean {
    return true;
  }

  async handle(event: NormalizedWhatsAppEvent, context: EventHandlerContext): Promise<void> {
    if (event.kind !== 'unsupported') {
      context.logger.debug({ eventId: event.eventId }, 'UnsupportedEventHandler received non-unsupported event');
      return;
    }

    const payload = event.payload as NormalizedUnsupportedEvent['payload'];
    this.logger.warn(
      {
        eventId: event.eventId,
        source: event.source,
        reason: payload.reason,
        reasonCode: payload.reasonCode,
        details: payload.details,
      },
      'Unsupported WhatsApp event ignored'
    );
  }
}
