"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryQueue = void 0;
const uuid_1 = require("uuid");
// In-memory queue keeps the project runnable without Redis.
// It is intentionally bounded by process memory and is not production durable.
class InMemoryQueue {
    name;
    concurrency;
    maxAttempts;
    jobs = [];
    processor;
    running = false;
    activeWorkers = 0;
    constructor(name, concurrency, maxAttempts) {
        this.name = name;
        this.concurrency = concurrency;
        this.maxAttempts = maxAttempts;
    }
    async enqueue(data) {
        const job = {
            id: (0, uuid_1.v4)(),
            data,
            attempts: 0,
            maxAttempts: this.maxAttempts,
        };
        this.jobs.push(job);
        this.flush();
        return job.id;
    }
    async start(processor) {
        this.processor = processor;
        this.running = true;
        this.flush();
    }
    async stop() {
        this.running = false;
    }
    getName() {
        return this.name;
    }
    flush() {
        if (!this.processor || !this.running)
            return;
        while (this.jobs.length > 0 && this.activeWorkers < this.concurrency) {
            const job = this.jobs.shift();
            if (!job)
                return;
            this.activeWorkers += 1;
            this.runJob(job).catch(() => {
                // errors are retried/handled inside runJob and re-queued.
            });
        }
    }
    async runJob(job) {
        try {
            await this.processor?.(job);
        }
        catch {
            job.attempts += 1;
            if (job.attempts < job.maxAttempts) {
                const backoffMs = Math.min(300 * 2 ** job.attempts, 3000);
                setTimeout(() => {
                    if (this.running) {
                        this.jobs.push(job);
                        this.flush();
                    }
                }, backoffMs);
            }
        }
        finally {
            this.activeWorkers -= 1;
            this.flush();
        }
    }
}
exports.InMemoryQueue = InMemoryQueue;
//# sourceMappingURL=inMemoryQueue.js.map