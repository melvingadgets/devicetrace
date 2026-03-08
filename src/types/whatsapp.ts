export type UnknownRecord = Record<string, unknown>;

export interface WhatsAppMetadata {
  display_phone_number?: string;
  phone_number_id?: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  type: string;
  timestamp?: string;
  text?: { body: string };
  [key: string]: UnknownRecord[keyof UnknownRecord];
}

export interface WhatsAppStatus {
  id: string;
  status: string;
  recipient_id?: string;
  timestamp?: string;
  [key: string]: UnknownRecord[keyof UnknownRecord];
}

export interface WhatsAppChangeValue {
  metadata?: WhatsAppMetadata;
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
  [key: string]: UnknownRecord[keyof UnknownRecord];
}

export interface WhatsAppChange {
  field?: string;
  value?: WhatsAppChangeValue;
  [key: string]: UnknownRecord[keyof UnknownRecord];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
  [key: string]: UnknownRecord[keyof UnknownRecord];
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
  [key: string]: UnknownRecord[keyof UnknownRecord];
}

export type NormalizedEventKind = 'message' | 'status' | 'unsupported';

export interface NormalizedEventBase {
  eventId: string;
  kind: NormalizedEventKind;
  source: {
    entryId: string;
    phoneNumberId?: string;
    from?: string;
    waMessageId?: string;
    field?: string;
  };
  receivedAt: string;
  rawChange: UnknownRecord;
  payload: UnknownRecord;
}

export interface NormalizedMessageEvent extends NormalizedEventBase {
  kind: 'message';
  payload: WhatsAppMessage;
}

export interface NormalizedStatusEvent extends NormalizedEventBase {
  kind: 'status';
  payload: WhatsAppStatus;
}

export interface NormalizedUnsupportedEvent extends NormalizedEventBase {
  kind: 'unsupported';
  payload: {
    reason: string;
    reasonCode: string;
    details: UnknownRecord;
  };
}

export type NormalizedWhatsAppEvent =
  | NormalizedMessageEvent
  | NormalizedStatusEvent
  | NormalizedUnsupportedEvent;
