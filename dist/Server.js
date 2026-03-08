"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./Database/Database.js");
const Config_js_1 = require("./config/Config.js");
const MainApp_js_1 = require("./MainApp.js");
const Database_js_1 = __importDefault(require("./Database/Database.js"));
const logger_js_1 = require("./config/logger.js");
const port = Config_js_1.config.port;
let server;
let appBuild;
let shuttingDown = false;
async function stopGracefully(signal) {
    if (shuttingDown)
        return;
    shuttingDown = true;
    logger_js_1.logger.info({ signal }, 'Graceful shutdown start');
    try {
        if (appBuild?.container) {
            await appBuild.container.webhookWorker.stop();
            await appBuild.container.queue.stop();
            if (appBuild.container.idempotencyStore.close) {
                await appBuild.container.idempotencyStore.close();
            }
        }
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error)
                        reject(error);
                    else
                        resolve();
                });
            });
        }
        logger_js_1.logger.info('Graceful shutdown complete');
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error({ error }, 'Shutdown failed');
        process.exit(1);
    }
}
async function startServer() {
    try {
        await Database_js_1.default;
        appBuild = await (0, MainApp_js_1.MainApp)();
        await appBuild.container.webhookWorker.start();
        server = appBuild.app.listen(port);
        server.on('error', async (error) => {
            if (error.code === 'EADDRINUSE') {
                logger_js_1.logger.fatal({ port, errorCode: error.code }, 'Port is already in use. Stop the other process using this port and restart.');
                await stopGracefully('EADDRINUSE');
                return;
            }
            logger_js_1.logger.fatal({ error }, 'Server listen error');
            process.exit(1);
        });
        server.on('listening', () => {
            const address = server.address();
            logger_js_1.logger.info({ port: typeof address === 'string' ? address : address?.port }, 'Server listening');
        });
    }
    catch (error) {
        logger_js_1.logger.fatal({ error }, 'Server startup failed');
        process.exit(1);
    }
}
void startServer();
process.on('SIGTERM', () => {
    void stopGracefully('SIGTERM');
});
process.on('SIGINT', () => {
    void stopGracefully('SIGINT');
});
process.on('uncaughtException', (error) => {
    logger_js_1.logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger_js_1.logger.fatal({ reason }, 'Unhandled rejection');
    void stopGracefully('unhandledRejection');
});
//# sourceMappingURL=Server.js.map