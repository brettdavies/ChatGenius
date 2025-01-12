import { pool } from '../../config/database';
import { User } from '../../types/user';

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const result = await pool.query<User>(
    'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
    [user.email, user.name]
  );
  return result.rows[0];
} 