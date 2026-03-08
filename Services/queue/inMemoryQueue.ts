import { v4 as uuidv4 } from 'uuid';
import type { QueueJob, QueuePort, QueueProcessor } from './queuePort';

// In-memory queue keeps the project runnable without Redis.
// It is intentionally bounded by process memory and is not production durable.
export class InMemoryQueue<T> implements QueuePort<T> {
  private readonly jobs: QueueJob<T>[] = [];
  private processor?: QueueProcessor<T>;
  private running = false;
  private activeWorkers = 0;

  constructor(
    private readonly name: string,
    private readonly concurrency: number,
    private readonly maxAttempts: number
  ) {}

  async enqueue(data: T): Promise<string> {
    const job: QueueJob<T> = {
      id: uuidv4(),
      data,
      attempts: 0,
      maxAttempts: this.maxAttempts,
    };
    this.jobs.push(job);
    this.flush();
    return job.id;
  }

  async start(processor: QueueProcessor<T>): Promise<void> {
    this.processor = processor;
    this.running = true;
    this.flush();
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  getName(): string {
    return this.name;
  }

  private flush(): void {
    if (!this.processor || !this.running) return;

    while (this.jobs.length > 0 && this.activeWorkers < this.concurrency) {
      const job = this.jobs.shift();
      if (!job) return;
      this.activeWorkers += 1;
      this.runJob(job).catch(() => {
        // errors are retried/handled inside runJob and re-queued.
      });
    }
  }

  private async runJob(job: QueueJob<T>): Promise<void> {
    try {
      await this.processor?.(job);
    } catch {
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
    } finally {
      this.activeWorkers -= 1;
      this.flush();
    }
  }
}
