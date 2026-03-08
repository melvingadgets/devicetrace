import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: 'whatsapp-webhook-service',
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    remove: true,
  },
  ...(env.NODE_ENV === 'development' && env.LOG_PRETTY
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
          },
        },
      }
    : {}),
});
