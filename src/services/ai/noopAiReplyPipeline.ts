import type { Logger } from 'pino';
import type { AiReplyInput, AiReplyOutput, AiReplyPipeline } from './aiReplyPipeline';

export class NoopAiReplyPipeline implements AiReplyPipeline {
  constructor(private readonly logger: Logger) {}

  async generateReply(input: AiReplyInput): Promise<AiReplyOutput> {
    this.logger.info(
      {
        conversationId: input.conversationId,
        from: input.from,
        messageId: input.messageId,
        messageType: input.messageType,
      },
      'AI pipeline stub: returning skip=true'
    );

    return {
      skip: true,
      reason: 'AI pipeline intentionally stubbed for local development',
    };
  }
}
