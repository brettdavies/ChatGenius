import { pool } from '@/db/pool';
import { User } from '@/types/user';
import { ulid } from 'ulid';

export class UserService {
  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    const query = `
      SELECT 
        id,
        auth0_id,
        email,
        username,
        full_name as name,
        avatar_url as picture,
        created_at,
        updated_at,
        deleted_at
      FROM users 
      WHERE auth0_id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [auth0Id]);
    return result.rows[0] || null;
  }

  async syncUser(data: {
    auth0Id: string;
    email: string;
    username: string;
    name: string;
    picture: string;
  }): Promise<User> {
    const id = ulid();
    const query = `
      INSERT INTO users (id, auth0_id, email, username, name, avatar_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (auth0_id) 
      DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
      RETURNING *
    `;
    const values = [id, data.auth0Id, data.email, data.username, data.name, data.picture];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
} 