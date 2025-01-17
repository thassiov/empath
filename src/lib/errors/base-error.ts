export type ErrorOpts = {
  details?: Record<string, unknown>;
  cause?: Error;
};

export class BaseError extends Error {
  details?: Record<string, unknown>;
  override cause?: Error;

  constructor(message: string, opts?: ErrorOpts) {
    super(message);
    this.name = 'BaseError';

    if (opts) {
      if (opts.details) {
        this.details = opts.details;
      }

      if (opts.cause) {
        this.cause = opts.cause;
        if (opts.cause.message) {
          this.message += `: ${opts.cause.message}`;
        }
      }
    }
  }
}
