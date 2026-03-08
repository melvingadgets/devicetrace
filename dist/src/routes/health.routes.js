"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const env_1 = require("../config/env");
const healthRouter = () => {
    const router = (0, express_1.Router)();
    router.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            service: 'whatsapp-webhook-service',
            env: env_1.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        });
    });
    return router;
};
exports.healthRouter = healthRouter;
//# sourceMappingURL=health.routes.js.map