"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopAiReplyPipeline = void 0;
class NoopAiReplyPipeline {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async generateReply(input) {
        this.logger.info({
            conversationId: input.conversationId,
            from: input.from,
            messageId: input.messageId,
            messageType: input.messageType,
        }, 'AI pipeline stub: returning skip=true');
        return {
            skip: true,
            reason: 'AI pipeline intentionally stubbed for local development',
        };
    }
}
exports.NoopAiReplyPipeline = NoopAiReplyPipeline;
//# sourceMappingURL=noopAiReplyPipeline.js.map