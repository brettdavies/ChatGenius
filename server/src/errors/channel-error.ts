export class ChannelError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ChannelError';
  }
} 