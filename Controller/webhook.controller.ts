import type { Request, Response } from 'express';
import { asyncHandler } from '../Middleware/asyncHandler';
import type { WebhookIngestionService } from '../Services/ingestion/webhookIngestionService';

export class WebhookController {
  constructor(
    private readonly ingestionService: WebhookIngestionService,
    private readonly verifyToken: string
  ) {}

  verifyWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const mode = this.pickQueryString(req, 'hub.mode');
    const verifyToken = this.pickQueryString(req, 'hub.verify_token');
    const challenge = this.pickQueryString(req, 'hub.challenge');

    if (mode === 'subscribe' && verifyToken === this.verifyToken && !!challenge) {
      res.status(200).type('text/plain').send(challenge);
      return;
    }

    req.logger?.warn(
      {
        hasMode: Boolean(mode),
        hasVerifyToken: Boolean(verifyToken),
      },
      'Webhook verification failed'
    );
    res.sendStatus(403);
  });

  // POST webhook responds quickly: ingest + enqueue; heavy work is done by async worker.
  handleWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const correlationId = req.correlationId ?? 'no-correlation-id';
    const result = await this.ingestionService.ingest(req.body, correlationId);
    req.logger?.info(
      {
        accepted: result.accepted,
        duplicates: result.duplicates,
        unsupported: result.unsupported,
      },
      'Webhook accepted'
    );

    res.status(200).json({
      status: 'accepted',
      accepted: result.accepted,
      duplicates: result.duplicates,
      unsupported: result.unsupported,
    });
  });

  private pickQueryString(req: Request, key: string): string | undefined {
    const value = req.query[key];
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    return undefined;
  }
}
