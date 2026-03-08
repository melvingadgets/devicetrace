"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopWhatsAppSender = void 0;
// Placeholder for future WhatsApp Cloud API sender implementation.
class NoopWhatsAppSender {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async sendTextMessage(payload) {
        this.logger.info({
            to: payload.to,
            phoneNumberId: payload.phoneNumberId,
            messageLength: payload.text.length,
        }, 'Sender adapter stub: sendTextMessage');
    }
}
exports.NoopWhatsAppSender = NoopWhatsAppSender;
//# sourceMappingURL=whatsappSender.js.map