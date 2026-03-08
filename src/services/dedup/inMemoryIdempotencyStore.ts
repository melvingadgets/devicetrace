import { v4 as uuidv4 } from 'uuid';
import { IdempotencyStore } from './idempotencyStore';

type IdempotencyState = 'processing' | 'processed';

interface MemoryEntry {
  token: string;
  state: IdempotencyState;
  expiresAt: number;
}

// In-memory dedup is for local development only; it does not work across processes.
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly state = new Map<string, MemoryEntry>();

  private cleanup(now: number): void {
    for (const [id, entry] of this.state.entries()) {
      if (entry.expiresAt <= now) {
        this.state.delete(id);
      }
    }
  }

  async tryAcquire(eventId: string, ttlSeconds: number): Promise<string | null> {
    const now = Date.now();
    this.cleanup(now);

    const existing = this.state.get(eventId);
    if (existing && existing.expiresAt > now) {
      return null;
    }

    const token = uuidv4();
    this.state.set(eventId, {
      token,
      state: 'processing',
      expiresAt: now + ttlSeconds * 1000,
    });
    return token;
  }

  async markProcessed(eventId: string, token: string, ttlSeconds: number): Promise<boolean> {
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

  async release(eventId: string, token: string): Promise<void> {
    const entry = this.state.get(eventId);
    if (entry && entry.state === 'processing' && entry.token === token) {
      this.state.delete(eventId);
    }
  }

  async close(): Promise<void> {
    this.state.clear();
  }
}
