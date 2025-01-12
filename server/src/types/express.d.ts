import { Request } from 'express';
import { User } from './user';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        payload: {
          sub: string;
          email: string;
          name: string;
          picture?: string;
        };
      };
      user?: User;
    }
  }
} 