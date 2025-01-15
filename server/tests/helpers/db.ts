import { nanoid } from 'nanoid';
import pool from '@db/pool';
import { User } from '@auth/types';
import { hashPassword } from '@utils/hashPassword';

export async function createTestUser(userData: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  const result = await pool.query(
    `INSERT INTO users (id, username, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, role, created_at as "createdAt", updated_at as "updatedAt", deleted_at as "deletedAt"`,
    [
      nanoid(),
      userData.username,
      userData.email,
      hashedPassword,
      userData.role || 'user'
    ]
  );
  return result.rows[0];
}

export async function cleanupTestUsers(): Promise<void> {
  await pool.query('DELETE FROM users');
} 