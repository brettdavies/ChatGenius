import { ulid } from 'ulid';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { findUserByEmail } from '../db/queries/users.js';
import { pool } from '@config/database.js';
import { User, UserDB, toUser } from './types.js';
import { USER_ROLES } from '../constants/auth.constants.js';
import { ErrorCodes } from '../openapi/schemas/common.js';
import { getAvatarUrl } from '../utils/avatar.js';
import { normalizeEmail } from '../utils/email.js';

export class UserError extends Error {
  constructor(public code: typeof ErrorCodes[keyof typeof ErrorCodes], message: string) {
    super(message);
    this.name = 'UserError';
  }
}

interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export async function createUser(input: RegisterInput): Promise<User> {
  const normalizedEmail = normalizeEmail(input.email);
  
  // Check if user already exists
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new UserError(ErrorCodes.EMAIL_ALREADY_EXISTS, 'Email already registered');
  }

  const hashedPassword = await hashPassword(input.password);
  const id = ulid();
  const now = new Date();
  const avatarUrl = await getAvatarUrl(normalizedEmail, input.username);

  try {
    const result = await pool.query<UserDB>(
      `INSERT INTO users (id, email, password, username, role, created_at, updated_at, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, normalizedEmail, hashedPassword, input.username, USER_ROLES.USER, now, now, avatarUrl]
    );

    return toUser(result.rows[0]);
  } catch (error) {
    console.error('[UserService] Failed to create user:', error);
    throw new UserError(ErrorCodes.CREATE_FAILED, 'Failed to create user');
  }
}

export async function validateCredentials(email: string, password: string): Promise<User> {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new UserError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new UserError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  return toUser(user);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const normalizedEmail = updates.email ? normalizeEmail(updates.email) : undefined;
  const user = await findUserByEmail(normalizedEmail || '');
  if (!user) {
    throw new UserError(ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  if (normalizedEmail && user.id !== id) {
    throw new UserError(ErrorCodes.EMAIL_ALREADY_EXISTS, 'Email already taken');
  }

  try {
    const result = await pool.query<UserDB>(
      `UPDATE users
       SET email = COALESCE($1, email),
           username = COALESCE($2, username),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [normalizedEmail, updates.username, id]
    );

    if (!result.rows[0]) {
      throw new UserError(ErrorCodes.UPDATE_FAILED, 'Failed to update user');
    }

    return toUser(result.rows[0]);
  } catch (error) {
    console.error('[UserService] Failed to update user:', error);
    throw new UserError(ErrorCodes.UPDATE_FAILED, 'Failed to update user');
  }
}

export async function deleteUser(id: string): Promise<void> {
  const result = await pool.query(
    `UPDATE users
     SET deleted_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (!result.rows[0]) {
    throw new UserError(ErrorCodes.USER_NOT_FOUND, 'User not found');
  }
}

export async function updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await pool.query<UserDB>(
    `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  if (!user.rows[0]) {
    throw new UserError(ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  const isValidPassword = await comparePassword(currentPassword, user.rows[0].password);
  if (!isValidPassword) {
    throw new UserError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid current password');
  }

  const hashedPassword = await hashPassword(newPassword);
  const result = await pool.query(
    `UPDATE users
     SET password = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [hashedPassword, id]
  );

  if (!result.rows[0]) {
    throw new UserError(ErrorCodes.UPDATE_FAILED, 'Failed to update password');
  }
}

export async function setupTOTP(id: string, secret: string, backupCodes: string[]): Promise<void> {
  const user = await pool.query<UserDB>(
    `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  if (!user.rows[0]) {
    throw new UserError(ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  if (user.rows[0].totp_enabled) {
    throw new UserError(ErrorCodes.TOTP_ALREADY_ENABLED, '2FA is already enabled');
  }

  if (!user.rows[0].totp_secret) {
    throw new UserError(ErrorCodes.TOTP_NOT_SETUP, '2FA setup not initiated');
  }

  if (user.rows[0].totp_secret !== secret) {
    throw new UserError(ErrorCodes.INVALID_TOTP_TOKEN, 'Invalid TOTP token');
  }

  const result = await pool.query(
    `UPDATE users
     SET totp_enabled = true,
         totp_backup_codes = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [backupCodes, id]
  );

  if (!result.rows[0]) {
    throw new UserError(ErrorCodes.UPDATE_FAILED, 'Failed to enable 2FA');
  }
} 