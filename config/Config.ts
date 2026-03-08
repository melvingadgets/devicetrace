import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const toBoolean = (value: unknown): unknown => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }
  return value;
};

const parsePort = (): string | undefined =>
  process.env.PORT ?? process.env.port ?? process.env.Port;

const parsed = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535),
    Database_url: z.string().min(1, 'Database_url is required'),
    VERIFY_TOKEN: z.string().min(1, 'VERIFY_TOKEN is required'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .default('info'),
    LOG_PRETTY: z.preprocess(toBoolean, z.coerce.boolean()).default(false),
    CORS_ORIGINS: z.string().default('*'),
    JSON_BODY_LIMIT: z.string().default('1mb'),
    WEBHOOK_PATH: z.string().default('/webhook'),
    QUEUE_CONCURRENCY: z.coerce.number().int().positive().default(4),
    QUEUE_MAX_ATTEMPTS: z.coerce.number().int().positive().default(3),
    IDEMPOTENCY_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  })
  .safeParse({
    ...process.env,
    PORT: parsePort(),
    Database_url: process.env.Database_url ?? process.env.DATABASE_URL ?? process.env.database_url,
  });

if (!parsed.success) {
  console.error('Invalid environment variables');
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = {
  ...parsed.data,
  port: parsed.data.PORT,
  PORT: parsed.data.PORT,
};
