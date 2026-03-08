import './Database/Database.js';
import { config } from './config/Config.js';
import { MainApp } from './MainApp.js';
import Db from './Database/Database.js';
import type { Server } from 'http';
import { logger } from './config/logger.js';
import type { AppBuildResult } from './MainApp.js';

const port = config.port;
let server: Server;
let appBuild: AppBuildResult | undefined;
let shuttingDown = false;

async function stopGracefully(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown start');

  try {
    if (appBuild?.container) {
      await appBuild.container.webhookWorker.stop();
      await appBuild.container.queue.stop();
      if (appBuild.container.idempotencyStore.close) {
        await appBuild.container.idempotencyStore.close();
      }
    }

    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Shutdown failed');
    process.exit(1);
  }
}

async function startServer(): Promise<void> {
  try {
    await Db;
    appBuild = await MainApp();

    await appBuild.container.webhookWorker.start();
    server = appBuild.app.listen(port, () => {
      logger.info({ port }, 'Server listening');
    });
  } catch (error) {
    logger.fatal({ error }, 'Server startup failed');
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

process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  void stopGracefully('unhandledRejection');
});
