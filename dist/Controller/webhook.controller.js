"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const asyncHandler_1 = require("../Middleware/asyncHandler");
class WebhookController {
    ingestionService;
    verifyToken;
    constructor(ingestionService, verifyToken) {
        this.ingestionService = ingestionService;
        this.verifyToken = verifyToken;
    }
    verifyWebhook = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const mode = this.pickQueryString(req, 'hub.mode');
        const verifyToken = this.pickQueryString(req, 'hub.verify_token');
        const challenge = this.pickQueryString(req, 'hub.challenge');
        if (mode === 'subscribe' && verifyToken === this.verifyToken && !!challenge) {
            res.status(200).type('text/plain').send(challenge);
            return;
        }
        req.logger?.warn({
            hasMode: Boolean(mode),
            hasVerifyToken: Boolean(verifyToken),
        }, 'Webhook verification failed');
        res.sendStatus(403);
    });
    // POST webhook responds quickly: ingest + enqueue; heavy work is done by async worker.
    handleWebhook = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const correlationId = req.correlationId ?? 'no-correlation-id';
        const result = await this.ingestionService.ingest(req.body, correlationId);
        req.logger?.info({
            accepted: result.accepted,
            duplicates: result.duplicates,
            unsupported: result.unsupported,
        }, 'Webhook accepted');
        res.status(200).json({
            status: 'accepted',
            accepted: result.accepted,
            duplicates: result.duplicates,
            unsupported: result.unsupported,
        });
    });
    pickQueryString(req, key) {
        const value = req.query[key];
        if (typeof value === 'string')
            return value;
        if (Array.isArray(value) && value.length > 0)
            return String(value[0]);
        return undefined;
    }
}
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhook.controller.js.map