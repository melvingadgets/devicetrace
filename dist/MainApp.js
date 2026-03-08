"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainApp = void 0;
const App_1 = require("./App");
const container_1 = require("./Bootstrap/container");
const Config_1 = require("./config/Config");
const MainApp = async () => {
    const container = (0, container_1.createContainer)();
    const app = (0, App_1.createApp)(container.webhookController);
    app.get('/api/v1', (_req, res) => {
        res.status(200).json({
            message: 'Api is running successfully',
            service: 'whatsapp-webhook-service',
            webhookPath: Config_1.config.WEBHOOK_PATH,
            health: '/health',
        });
    });
    return { app, container };
};
exports.MainApp = MainApp;
//# sourceMappingURL=MainApp.js.map