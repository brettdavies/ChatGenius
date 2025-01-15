import { UserRole } from '../constants/auth.constants.js';

// Database model (matches DB column names)
export interface UserDB {
  id: string;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// API model (camelCase for frontend consumption)
export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Public profile (omits sensitive data)
export interface UserProfile extends Omit<User, 'password'> {
  // Add any additional profile fields here
}

// Helper function to convert DB model to API model
export function toUser(dbUser: UserDB): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    password: dbUser.password,
    username: dbUser.username,
    role: dbUser.role,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    deletedAt: dbUser.deleted_at
  };
} 