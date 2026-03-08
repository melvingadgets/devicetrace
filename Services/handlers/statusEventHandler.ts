import type { EventHandler, EventHandlerContext } from './types';
import type { NormalizedStatusEvent, NormalizedWhatsAppEvent, WhatsAppStatus } from '../../Types/whatsapp';

export class StatusEventHandler implements EventHandler {
  canHandle(event: NormalizedWhatsAppEvent): boolean {
    return event.kind === 'status';
  }

  async handle(event: NormalizedWhatsAppEvent, context: EventHandlerContext): Promise<void> {
    if (event.kind !== 'status') return;
    const statusEvent = event as NormalizedStatusEvent;
    const status = statusEvent.payload as WhatsAppStatus;

    context.logger.info(
      {
        eventId: event.eventId,
        messageId: statusEvent.source.waMessageId,
        recipientId: status.recipient_id,
        status: status.status,
      },
      'Status event handled'
    );
  }
}
