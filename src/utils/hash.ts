import { createHash } from 'crypto';

export const stableHash = (value: string): string =>
  createHash('sha256').update(value).digest('hex');
