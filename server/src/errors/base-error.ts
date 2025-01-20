import { ErrorCodes } from '../openapi/schemas/common.js';

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export class BaseError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
} 