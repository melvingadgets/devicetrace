import { createApp } from './App';
import type { Application } from 'express';
import { createContainer, type AppContainer } from './Bootstrap/container';
import { config } from './config/Config';

export interface AppBuildResult {
  app: Application;
  container: AppContainer;
}

export const MainApp = async (): Promise<AppBuildResult> => {
  const container = createContainer();
  const app = createApp(container.webhookController);

  app.get('/api/v1', (_req, res) => {
    res.status(200).json({
      message: 'Api is running successfully',
      service: 'whatsapp-webhook-service',
      webhookPath: config.WEBHOOK_PATH,
      health: '/health',
    });
  });

  return { app, container };
};
