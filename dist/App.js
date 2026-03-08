"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const Router_1 = require("./Router");
const errorHandler_1 = require("./Middleware/errorHandler");
const requestContext_1 = require("./Middleware/requestContext");
const parseCorsOrigins = () => {
    if (env_1.env.CORS_ORIGINS === '*')
        return true;
    return env_1.env.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean);
};
const createApp = (webhookController) => {
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    // Security hardening at the edge.
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: parseCorsOrigins(),
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'x-correlation-id'],
        credentials: false,
    }));
    // Set body limit to guard against oversized payload attacks.
    app.use(express_1.default.json({ limit: env_1.env.JSON_BODY_LIMIT }));
    app.use(requestContext_1.requestContextMiddleware);
    (0, Router_1.registerRoutes)(app, webhookController);
    // Keep this last so all thrown errors get centralized handling.
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=App.js.map