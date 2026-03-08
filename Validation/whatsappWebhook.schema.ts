import { z } from 'zod';

const metadataSchema = z
  .object({
    display_phone_number: z.string().optional(),
    phone_number_id: z.string().optional(),
  })
  .passthrough()
  .optional();

const messageSchema = z
  .object({
    id: z.string().min(1),
    from: z.string().min(1),
    type: z.string().min(1),
    timestamp: z.string().optional(),
    text: z
      .object({
        body: z.string(),
      })
      .optional(),
  })
  .passthrough();

const statusSchema = z
  .object({
    id: z.string().min(1),
    status: z.string().min(1),
    recipient_id: z.string().optional(),
    timestamp: z.string().optional(),
  })
  .passthrough();

const changeValueSchema = z
  .object({
    metadata: metadataSchema,
    messages: z.array(messageSchema).optional(),
    statuses: z.array(statusSchema).optional(),
  })
  .passthrough();

const changeSchema = z.object({
  field: z.string().optional(),
  value: changeValueSchema.optional(),
});

const entrySchema = z.object({
  id: z.string().min(1),
  changes: z.array(changeSchema).default([]),
});

export const WhatsAppWebhookPayloadSchema = z
  .object({
    object: z.string().min(1),
    entry: z.array(entrySchema).default([]),
  })
  .passthrough();

export type ParsedWhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookPayloadSchema>;
