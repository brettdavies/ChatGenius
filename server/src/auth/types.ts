import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  totpEnabled: boolean;
  totpSecret: string | null;
  backupCodes: string[];
  totpVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserDB extends Omit<User, 'createdAt' | 'updatedAt' | 'deletedAt'> {
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export function toUser(dbUser: UserDB): User {
  return {
    ...dbUser,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    deletedAt: dbUser.deleted_at
  };
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string;
      role: string;
      totpEnabled: boolean;
    }
  }
} 