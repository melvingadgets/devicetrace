// Idempotency abstraction keeps deduplication implementation swappable.
// In a multi-instance deployment, Redis adapter should be used so every instance
// shares duplicate state.
export interface IdempotencyStore {
  // Returns a claim token if the event was not seen, or null if duplicate.
  tryAcquire(eventId: string, ttlSeconds: number): Promise<string | null>;

  // Marks event as fully processed for dedup retention.
  markProcessed(eventId: string, token: string, ttlSeconds: number): Promise<boolean>;

  // Releases a claim so a transient failure can be retried.
  release(eventId: string, token: string): Promise<void>;

  // Optional lifecycle method for adapters that own external resources.
  close?(): Promise<void>;
}
