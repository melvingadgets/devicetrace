"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const env_1 = require("../config/env");
const webhookRouter = (webhookController) => {
    const router = (0, express_1.Router)();
    // GET /webhook for Meta challenge verification.
    router.get(env_1.env.WEBHOOK_PATH, webhookController.verifyWebhook);
    // POST /webhook for event delivery.
    router.post(env_1.env.WEBHOOK_PATH, webhookController.handleWebhook);
    return router;
};
exports.webhookRouter = webhookRouter;
//# sourceMappingURL=webhook.routes.js.map