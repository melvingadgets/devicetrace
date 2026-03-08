"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const toBoolean = (value) => {
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
const parsePort = () => process.env.PORT ?? process.env.port ?? process.env.Port;
const parsed = zod_1.z
    .object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().min(1).max(65535),
    Database_url: zod_1.z.string().min(1, 'Database_url is required'),
    VERIFY_TOKEN: zod_1.z.string().min(1, 'VERIFY_TOKEN is required'),
    LOG_LEVEL: zod_1.z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),
    LOG_PRETTY: zod_1.z.preprocess(toBoolean, zod_1.z.coerce.boolean()).default(false),
    CORS_ORIGINS: zod_1.z.string().default('*'),
    JSON_BODY_LIMIT: zod_1.z.string().default('1mb'),
    WEBHOOK_PATH: zod_1.z.string().default('/webhook'),
    QUEUE_CONCURRENCY: zod_1.z.coerce.number().int().positive().default(4),
    QUEUE_MAX_ATTEMPTS: zod_1.z.coerce.number().int().positive().default(3),
    IDEMPOTENCY_TTL_SECONDS: zod_1.z.coerce.number().int().positive().default(86400),
    SHUTDOWN_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(10000),
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
exports.config = {
    ...parsed.data,
    port: parsed.data.PORT,
    PORT: parsed.data.PORT,
};
//# sourceMappingURL=Config.js.map