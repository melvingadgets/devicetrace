"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const health_routes_1 = require("./health.routes");
const webhook_routes_1 = require("./webhook.routes");
const registerRoutes = (app, webhookController) => {
    app.use('/', (0, health_routes_1.healthRouter)());
    app.use('/', (0, webhook_routes_1.webhookRouter)(webhookController));
};
exports.registerRoutes = registerRoutes;
//# sourceMappingURL=index.js.map