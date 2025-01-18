declare module 'express-session' {
  interface SessionData {
    totpSetup?: {
      secret: string;
      backupCodes: string[];
      userId: string;
      tokenVerified?: boolean;
    };
  }
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  avatarUrl: string | null;
  totpEnabled: boolean;
  totpSecret: string | null;
  backupCodes: string[];
  totpVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserDB extends Omit<User, 'createdAt' | 'updatedAt' | 'deletedAt' | 'avatarUrl' | 'totpEnabled' | 'totpSecret' | 'backupCodes' | 'totpVerifiedAt'> {
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  avatar_url: string | null;
  totp_enabled: boolean;
  totp_secret: string | null;
  backup_codes: string[];
  totp_verified_at: Date | null;
}

export function toUser(dbUser: UserDB): User {
  return {
    ...dbUser,
    avatarUrl: dbUser.avatar_url,
    totpEnabled: dbUser.totp_enabled,
    totpSecret: dbUser.totp_secret,
    backupCodes: dbUser.backup_codes || [],
    totpVerifiedAt: dbUser.totp_verified_at,
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
      avatarUrl: string | null;
      totpEnabled: boolean;
    }

    interface Session {
      totpSetup?: {
        secret: string;
        backupCodes: string[];
        userId: string;
        tokenVerified?: boolean;
      };
    }
  }
} 