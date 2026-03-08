export interface AiReplyInput {
  conversationId: string;
  phoneNumberId: string;
  from: string;
  messageId: string;
  messageType: string;
  text?: string;
  timestamp: string;
  rawPayload: unknown;
}

export interface AiReplyOutput {
  skip: boolean;
  text?: string;
  reason?: string;
}

export interface AiReplyPipeline {
  generateReply(input: AiReplyInput): Promise<AiReplyOutput>;
}
