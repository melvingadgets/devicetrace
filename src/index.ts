import http from 'http';
import { createApp } from './app';
import { createContainer } from './bootstrap/container';
import { logger } from './config/logger';
import { env } from './config/env';

const container = createContainer();
const app = createApp(container.webhookController);
const server = http.createServer(app);

let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown start');

  const timeoutMs = env.SHUTDOWN_TIMEOUT_MS;
  const shutdownTimer = setTimeout(() => {
    logger.error('Shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, timeoutMs);

  try {
    await container.webhookWorker.stop();
    await container.queue.stop();
    if (container.idempotencyStore.close) {
      await container.idempotencyStore.close();
    }

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    clearTimeout(shutdownTimer);
    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimer);
    logger.error({ error: String(error) }, 'Shutdown failed');
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
  logger.error({ error }, 'Unhandled rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

void (async () => {
  await container.webhookWorker.start();

  server.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      webhookPath: env.WEBHOOK_PATH,
    },
    'Webhook service started'
  );
  });
})();
