import { BaseError, ErrorCode } from './base-error.js';

export class MessageError extends BaseError {
  constructor(code: ErrorCode, message: string) {
    super(code, message);
  }
} 