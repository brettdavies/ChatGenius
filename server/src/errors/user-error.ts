export class UserError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'UserError';
  }
} 