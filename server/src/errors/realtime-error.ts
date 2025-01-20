import { BaseError, ErrorCode } from './base-error.js';

export class RealtimeError extends BaseError {
  constructor(code: ErrorCode, message: string) {
    super(code, message);
  }
} 