import { ulid } from 'ulid';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { findUserByEmail } from '../db/queries/users.js';
import pool from '../db/pool.js';
import { User, UserDB, toUser } from './types.js';
import { USER_ROLES } from '../constants/auth.constants.js';

interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export async function createUser(input: RegisterInput): Promise<User> {
  const hashedPassword = await hashPassword(input.password);
  const id = ulid();
  const now = new Date();

  const result = await pool.query<UserDB>(
    `INSERT INTO users (id, email, password, username, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, input.email, hashedPassword, input.username, USER_ROLES.USER, now, now]
  );

  return toUser(result.rows[0]);
}

export async function validateCredentials(email: string, password: string): Promise<User> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  return user;
} 