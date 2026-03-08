"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWhatsAppWebhookPayload = void 0;
const hash_1 = require("../../Utils/hash");
const buildMessageEvent = (eventSeed, entryId, changeIndex, messageIndex, msg, source, receivedAt) => {
    const eventId = msg.id || (0, hash_1.stableHash)(`message:${eventSeed}:${entryId}:${changeIndex}:${messageIndex}`);
    return {
        eventId,
        kind: 'message',
        source,
        receivedAt,
        rawChange: { kind: 'message', payload: msg },
        payload: msg,
    };
};
const buildStatusEvent = (eventSeed, entryId, changeIndex, statusIndex, status, source, receivedAt) => {
    const eventId = status.id || (0, hash_1.stableHash)(`status:${eventSeed}:${entryId}:${changeIndex}:${statusIndex}`);
    return {
        eventId,
        kind: 'status',
        source,
        receivedAt,
        rawChange: { kind: 'status', payload: status },
        payload: status,
    };
};
const buildUnsupportedEvent = (seed, entryId, changeIndex, rawChange, receivedAt) => {
    const eventId = (0, hash_1.stableHash)(`unsupported:${seed}:${entryId}:${changeIndex}`);
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
const normalizeWhatsAppWebhookPayload = (payload, receivedAt = new Date().toISOString()) => {
    const events = [];
    for (const entry of payload.entry ?? []) {
        const changes = entry.changes ?? [];
        const entrySeed = entry.id || (0, hash_1.stableHash)(`entry:${JSON.stringify(entry).slice(0, 128)}`);
        for (let changeIndex = 0; changeIndex < changes.length; changeIndex += 1) {
            const change = changes[changeIndex] ?? {};
            const value = change.value ?? {};
            const metadata = value.metadata ?? {};
            const messages = Array.isArray(value.messages) ? value.messages : [];
            const statuses = Array.isArray(value.statuses) ? value.statuses : [];
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
                events.push(buildUnsupportedEvent(entrySeed, entry.id, changeIndex, change, receivedAt));
            }
        }
    }
    return events;
};
exports.normalizeWhatsAppWebhookPayload = normalizeWhatsAppWebhookPayload;
//# sourceMappingURL=whatsappNormalizer.js.map