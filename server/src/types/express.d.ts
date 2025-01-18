import { Session } from 'express-session';
import { User } from './auth';

declare module 'express-session' {
  interface Session {
    createdAt: Date;
    totpSetup?: {
      secret: string;
      backupCodes: string[];
      userId: string;
      tokenVerified?: boolean;
    };
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
} 