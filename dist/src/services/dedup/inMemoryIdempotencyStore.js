"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryIdempotencyStore = void 0;
const uuid_1 = require("uuid");
// In-memory dedup is for local development only; it does not work across processes.
class InMemoryIdempotencyStore {
    state = new Map();
    cleanup(now) {
        for (const [id, entry] of this.state.entries()) {
            if (entry.expiresAt <= now) {
                this.state.delete(id);
            }
        }
    }
    async tryAcquire(eventId, ttlSeconds) {
        const now = Date.now();
        this.cleanup(now);
        const existing = this.state.get(eventId);
        if (existing && existing.expiresAt > now) {
            return null;
        }
        const token = (0, uuid_1.v4)();
        this.state.set(eventId, {
            token,
            state: 'processing',
            expiresAt: now + ttlSeconds * 1000,
        });
        return token;
    }
    async markProcessed(eventId, token, ttlSeconds) {
        const entry = this.state.get(eventId);
        const now = Date.now();
        if (!entry || entry.expiresAt <= now || entry.state !== 'processing' || entry.token !== token) {
            return false;
        }
        this.state.set(eventId, {
            ...entry,
            state: 'processed',
            expiresAt: now + ttlSeconds * 1000,
        });
        return true;
    }
    async release(eventId, token) {
        const entry = this.state.get(eventId);
        if (entry && entry.state === 'processing' && entry.token === token) {
            this.state.delete(eventId);
        }
    }
    async close() {
        this.state.clear();
    }
}
exports.InMemoryIdempotencyStore = InMemoryIdempotencyStore;
//# sourceMappingURL=inMemoryIdempotencyStore.js.map