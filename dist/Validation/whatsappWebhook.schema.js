"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppWebhookPayloadSchema = void 0;
const zod_1 = require("zod");
const metadataSchema = zod_1.z
    .object({
    display_phone_number: zod_1.z.string().optional(),
    phone_number_id: zod_1.z.string().optional(),
})
    .passthrough()
    .optional();
const messageSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1),
    from: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    timestamp: zod_1.z.string().optional(),
    text: zod_1.z
        .object({
        body: zod_1.z.string(),
    })
        .optional(),
})
    .passthrough();
const statusSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1),
    status: zod_1.z.string().min(1),
    recipient_id: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().optional(),
})
    .passthrough();
const changeValueSchema = zod_1.z
    .object({
    metadata: metadataSchema,
    messages: zod_1.z.array(messageSchema).optional(),
    statuses: zod_1.z.array(statusSchema).optional(),
})
    .passthrough();
const changeSchema = zod_1.z.object({
    field: zod_1.z.string().optional(),
    value: changeValueSchema.optional(),
});
const entrySchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    changes: zod_1.z.array(changeSchema).default([]),
});
exports.WhatsAppWebhookPayloadSchema = zod_1.z
    .object({
    object: zod_1.z.string().min(1),
    entry: zod_1.z.array(entrySchema).default([]),
})
    .passthrough();
//# sourceMappingURL=whatsappWebhook.schema.js.map