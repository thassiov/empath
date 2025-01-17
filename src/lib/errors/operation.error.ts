import { BaseError, ErrorOpts } from './base-error';

export class OperationError extends BaseError {
  constructor(opts?: ErrorOpts) {
    super('operation-error', opts);
    this.name = 'operation-error';
  }
}
