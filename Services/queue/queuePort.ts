export interface QueueJob<T> {
  id: string;
  data: T;
  attempts: number;
  maxAttempts: number;
}

export type QueueProcessor<T> = (job: QueueJob<T>) => Promise<void>;

export interface QueuePort<T> {
  enqueue(data: T): Promise<string>;
  start(processor: QueueProcessor<T>): Promise<void>;
  stop(): Promise<void>;
  getName(): string;
}
