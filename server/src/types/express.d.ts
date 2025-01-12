import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

declare global {
  namespace Express {
    // This augments the user property in base Request
    interface Request {
      user: {
        id: string;
      };
    }
  }
} 