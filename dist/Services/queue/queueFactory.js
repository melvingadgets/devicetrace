"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueueAdapter = void 0;
const env_1 = require("../../config/env");
const inMemoryQueue_1 = require("./inMemoryQueue");
const createQueueAdapter = () => {
    // In-memory queue keeps local development and quick CI runs lightweight.
    return new inMemoryQueue_1.InMemoryQueue('whatsapp-webhook-dev', env_1.env.QUEUE_CONCURRENCY, env_1.env.QUEUE_MAX_ATTEMPTS);
};
exports.createQueueAdapter = createQueueAdapter;
//# sourceMappingURL=queueFactory.js.map