import pool from '../pool.js';
import { User, UserDB, toUser } from '../../auth/types.js';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserDB>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserDB>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
} 