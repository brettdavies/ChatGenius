import { USER_ROLES } from '@constants/auth.constants';

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface UserCredentials {
    username: string;
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
} 