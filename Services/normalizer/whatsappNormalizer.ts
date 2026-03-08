import { stableHash } from '../../Utils/hash';
import type { ParsedWhatsAppWebhookPayload } from '../../Validation/whatsappWebhook.schema';
import type {
  NormalizedMessageEvent,
  NormalizedStatusEvent,
  NormalizedUnsupportedEvent,
  NormalizedWhatsAppEvent,
  WhatsAppMessage,
  WhatsAppStatus,
} from '../../Types/whatsapp';

const buildMessageEvent = (
  eventSeed: string,
  entryId: string,
  changeIndex: number,
  messageIndex: number,
  msg: WhatsAppMessage,
  source: NormalizedMessageEvent['source'],
  receivedAt: string
): NormalizedMessageEvent => {
  const eventId = msg.id || stableHash(`message:${eventSeed}:${entryId}:${changeIndex}:${messageIndex}`);
  return {
    eventId,
    kind: 'message',
    source,
    receivedAt,
    rawChange: { kind: 'message', payload: msg },
    payload: msg,
  };
};

const buildStatusEvent = (
  eventSeed: string,
  entryId: string,
  changeIndex: number,
  statusIndex: number,
  status: WhatsAppStatus,
  source: NormalizedStatusEvent['source'],
  receivedAt: string
): NormalizedStatusEvent => {
  const eventId = status.id || stableHash(`status:${eventSeed}:${entryId}:${changeIndex}:${statusIndex}`);
  return {
    eventId,
    kind: 'status',
    source,
    receivedAt,
    rawChange: { kind: 'status', payload: status },
    payload: status,
  };
};

const buildUnsupportedEvent = (
  seed: string,
  entryId: string,
  changeIndex: number,
  rawChange: Record<string, unknown>,
  receivedAt: string
): NormalizedUnsupportedEvent => {
  const eventId = stableHash(`unsupported:${seed}:${entryId}:${changeIndex}`);
  return {
    eventId,
    kind: 'unsupported',
    source: {
      entryId,
      waMessageId: eventId.slice(0, 20),
      field: rawChange.field ? String(rawChange.field) : undefined,
    },
    receivedAt,
    rawChange,
    payload: {
      reason: 'unsupported-change-shape',
      reasonCode: 'UNSUPPORTED_EVENT_SHAPE',
      details: rawChange,
    },
  };
};

export const normalizeWhatsAppWebhookPayload = (
  payload: ParsedWhatsAppWebhookPayload,
  receivedAt = new Date().toISOString()
): NormalizedWhatsAppEvent[] => {
  const events: NormalizedWhatsAppEvent[] = [];

  for (const entry of payload.entry ?? []) {
    const changes = entry.changes ?? [];
    const entrySeed = entry.id || stableHash(`entry:${JSON.stringify(entry).slice(0, 128)}`);

    for (let changeIndex = 0; changeIndex < changes.length; changeIndex += 1) {
      const change = changes[changeIndex] ?? {};
      const value = change.value ?? {};
      const metadata = value.metadata ?? {};
      const messages: WhatsAppMessage[] = Array.isArray(value.messages) ? value.messages : [];
      const statuses: WhatsAppStatus[] = Array.isArray(value.statuses) ? value.statuses : [];

      const baseSource = {
        entryId: entry.id,
        phoneNumberId: metadata.phone_number_id,
        field: change.field,
      };

      if (messages.length > 0) {
        messages.forEach((msg, messageIndex) => {
          const source = {
            ...baseSource,
            from: msg.from,
            waMessageId: msg.id,
          };
          events.push(buildMessageEvent(entrySeed, entry.id, changeIndex, messageIndex, msg, source, receivedAt));
        });
      }

      if (statuses.length > 0) {
        statuses.forEach((status, statusIndex) => {
          const source = {
            ...baseSource,
            from: status.recipient_id,
            waMessageId: status.id,
          };
          events.push(buildStatusEvent(entrySeed, entry.id, changeIndex, statusIndex, status, source, receivedAt));
        });
      }

      if (messages.length === 0 && statuses.length === 0) {
        events.push(buildUnsupportedEvent(entrySeed, entry.id, changeIndex, change as Record<string, unknown>, receivedAt));
      }
    }
  }

  return events;
};
