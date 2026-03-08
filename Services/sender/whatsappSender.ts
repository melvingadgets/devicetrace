import type { Logger } from 'pino';

export interface SendTextInput {
  to: string;
  phoneNumberId: string;
  text: string;
}

export interface WhatsAppSender {
  sendTextMessage(payload: SendTextInput): Promise<void>;
}

// Placeholder for future WhatsApp Cloud API sender implementation.
export class NoopWhatsAppSender implements WhatsAppSender {
  constructor(private readonly logger: Logger) {}

  async sendTextMessage(payload: SendTextInput): Promise<void> {
    this.logger.info(
      {
        to: payload.to,
        phoneNumberId: payload.phoneNumberId,
        messageLength: payload.text.length,
      },
      'Sender adapter stub: sendTextMessage'
    );
  }
}
