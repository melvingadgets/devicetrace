import { IdempotencyStore } from './idempotencyStore';
import { InMemoryIdempotencyStore } from './inMemoryIdempotencyStore';

export const createIdempotencyStore = (): IdempotencyStore => {
  return new InMemoryIdempotencyStore();
};
