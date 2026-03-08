import { NormalizedWhatsAppEvent } from './whatsapp';

export interface QueuedWebhookWork {
  event: NormalizedWhatsAppEvent;
  correlationId: string;
  eventToken: string;
  ingressAt: string;
}
