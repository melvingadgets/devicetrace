import type { Logger } from 'pino';
import type { EventHandler, EventHandlerContext } from './types';
import { AiReplyPipeline } from '../ai/aiReplyPipeline';
import { WhatsAppSender } from '../sender/whatsappSender';
import { HumanHandoffGuard } from '../handoff/humanHandoffGuard';
import type { NormalizedMessageEvent, NormalizedWhatsAppEvent, WhatsAppMessage } from '../../types/whatsapp';

export class MessageEventHandler implements EventHandler {
  constructor(
    private readonly aiPipeline: AiReplyPipeline,
    private readonly sender: WhatsAppSender,
    private readonly handoffGuard: HumanHandoffGuard,
    private readonly logger: Logger
  ) {}

  canHandle(event: NormalizedWhatsAppEvent): boolean {
    return event.kind === 'message';
  }

  async handle(event: NormalizedWhatsAppEvent, context: EventHandlerContext): Promise<void> {
    if (event.kind !== 'message') return;

    const message = event.payload as WhatsAppMessage;
    const messageEvent = event as NormalizedMessageEvent;

    if (!messageEvent.source.from || !messageEvent.source.phoneNumberId) {
      const missingFields: string[] = [];
      if (!messageEvent.source.from) missingFields.push('from');
      if (!messageEvent.source.phoneNumberId) missingFields.push('phoneNumberId');
      context.logger.warn(
        {
          eventId: event.eventId,
          entryId: event.source.entryId,
          missingFields,
        },
        'Message event missing required routing fields'
      );
      return;
    }

    const inHandoff = await this.handoffGuard.isHumanHandoffActive(
      messageEvent.source.entryId,
      messageEvent.source.phoneNumberId
    );
    if (inHandoff) {
      context.logger.info(
        {
          eventId: event.eventId,
          entryId: messageEvent.source.entryId,
        },
        'Skipping AI reply: human handoff active'
      );
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
      this.logger.info(
        {
          eventId: event.eventId,
          reason: aiResult.reason,
        },
        'AI reply skipped by pipeline'
      );
      return;
    }

    if (typeof aiResult.text === 'string' && aiResult.text.trim() !== '') {
      await this.sender.sendTextMessage({
        to: messageEvent.source.from,
        phoneNumberId: messageEvent.source.phoneNumberId,
        text: aiResult.text,
      });
      context.logger.info(
        {
          eventId: event.eventId,
        },
        'AI reply delegated to sender adapter'
      );
    }
  }
}
