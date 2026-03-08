"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const container_1 = require("./bootstrap/container");
const logger_1 = require("./config/logger");
const env_1 = require("./config/env");
const container = (0, container_1.createContainer)();
const app = (0, app_1.createApp)(container.webhookController);
const server = http_1.default.createServer(app);
let shuttingDown = false;
const shutdown = async (signal) => {
    if (shuttingDown)
        return;
    shuttingDown = true;
    logger_1.logger.info({ signal }, 'Graceful shutdown start');
    const timeoutMs = env_1.env.SHUTDOWN_TIMEOUT_MS;
    const shutdownTimer = setTimeout(() => {
        logger_1.logger.error('Shutdown timeout exceeded, forcing exit');
        process.exit(1);
    }, timeoutMs);
    try {
        await container.webhookWorker.stop();
        await container.queue.stop();
        if (container.idempotencyStore.close) {
            await container.idempotencyStore.close();
        }
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
        clearTimeout(shutdownTimer);
        logger_1.logger.info('Graceful shutdown complete');
        process.exit(0);
    }
    catch (error) {
        clearTimeout(shutdownTimer);
        logger_1.logger.error({ error: String(error) }, 'Shutdown failed');
        process.exit(1);
    }
};
process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
    void shutdown('SIGINT');
});
process.on('unhandledRejection', (error) => {
    logger_1.logger.error({ error }, 'Unhandled rejection');
});
process.on('uncaughtException', (error) => {
    logger_1.logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
});
void (async () => {
    await container.webhookWorker.start();
    server.listen(env_1.env.PORT, () => {
        logger_1.logger.info({
            port: env_1.env.PORT,
            webhookPath: env_1.env.WEBHOOK_PATH,
        }, 'Webhook service started');
    });
})();
//# sourceMappingURL=index.js.map