import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ulid } from 'ulid';
import { pool } from '@db/pool';
import { AUTH_ERRORS, AUTH_MESSAGES, TOKEN_CONFIG } from '@constants/auth.constants';
import { User, UserCredentials, TokenPair } from '@auth/types';

export class AuthError extends Error {
  constructor(message: string, code: keyof typeof AUTH_ERRORS = AUTH_ERRORS.AUTHENTICATION_ERROR) {
    super(message);
    this.code = code;
  }
  code: string;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  return result.rows[0] || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username]
  );
  return result.rows[0] || null;
}

export async function validateCredentials(username: string, password: string): Promise<User> {
  const result = await pool.query(
    'SELECT id, username, email, role, password, created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt" FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username]
  );

  if (!result.rows[0]) {
    throw new AuthError(AUTH_MESSAGES.INVALID_CREDENTIALS, AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const isValid = await bcrypt.compare(password, result.rows[0].password);
  if (!isValid) {
    throw new AuthError(AUTH_MESSAGES.INVALID_CREDENTIALS, AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const { password: _, ...user } = result.rows[0];
  return user;
}

export async function createUser(credentials: UserCredentials): Promise<User> {
  const { username, email, password } = credentials;
  
  // Check if user exists
  const existingUser = await pool.query(
    'SELECT username, email FROM users WHERE (username = $1 OR email = $2) AND deleted_at IS NULL',
    [username, email]
  );

  if (existingUser.rows.length > 0) {
    throw new AuthError(AUTH_MESSAGES.USERNAME_TAKEN, AUTH_ERRORS.USERNAME_TAKEN);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with ULID
  const result = await pool.query(
    `INSERT INTO users (id, username, email, password, role)
     VALUES ($1, $2, $3, $4, 'user')
     RETURNING id, username, email, role, created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt"`,
    [ulid(), username, email, hashedPassword]
  );

  return result.rows[0];
}

export async function generateAuthTokens(user: User): Promise<TokenPair> {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  await pool.query(
    'INSERT INTO refresh_tokens (id, token, user_id, expires_at) VALUES ($1, $2, $3, NOW() + $4::interval)',
    [ulid(), refreshToken, user.id, TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY]
  );

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  const result = await pool.query(
    'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW() AND revoked_at IS NULL',
    [refreshToken]
  );

  if (!result.rows[0]) {
    throw new AuthError(AUTH_MESSAGES.INVALID_TOKEN, AUTH_ERRORS.INVALID_TOKEN);
  }

  const user = await getUserById(result.rows[0].user_id);
  if (!user) {
    throw new AuthError(AUTH_MESSAGES.USER_NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND);
  }

  return generateAuthTokens(user);
}

export async function revokeRefreshToken(token: string, reason?: string): Promise<void> {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW(), revoked_reason = $2 WHERE token = $1',
    [token, reason || 'Manual revocation']
  );
} 