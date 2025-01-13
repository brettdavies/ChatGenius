import { Request } from 'express';
import { AuthResult } from 'express-oauth2-jwt-bearer';

export interface User {
  id?: string;      // From auth middleware
  sub?: string;     // From auth middleware
  db_id?: string;   // From user-sync
  auth0_id?: string; // From user-sync
  name?: string;    // From auth middleware
  picture?: string; // From auth middleware
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email_verified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      auth?: AuthResult;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  auth?: AuthResult;
} 