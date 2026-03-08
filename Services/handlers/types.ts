import type { Logger } from 'pino';
import type { NormalizedWhatsAppEvent } from '../../Types/whatsapp';

export interface EventHandlerContext {
  correlationId: string;
  logger: Logger;
}

export interface EventHandler {
  canHandle(event: NormalizedWhatsAppEvent): boolean;
  handle(event: NormalizedWhatsAppEvent, context: EventHandlerContext): Promise<void>;
}
