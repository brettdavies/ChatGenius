import pool from '../pool.js';
import { User, UserDB, toUser } from '../../auth/types.js';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserDB>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserDB>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

/**
 * Creates or updates a user record
 * @param id - User ID (ULID)
 * @param data - User data to upsert
 * @param isNew - Whether this is a new user (affects which fields are required)
 */
export async function upsertUser(
  id: string,
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  isNew: boolean = false
): Promise<User | null> {
  // For new users, ensure required fields
  if (isNew && (!data.email || !data.password || !data.username)) {
    throw new Error('Missing required fields for new user');
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  
  // Build the query dynamically
  const insertFields = ['id', ...fields].join(', ');
  const insertValues = [`$1`, ...fields.map((_, i) => `$${i + 2}`)].join(', ');
  const updateSet = fields
    .map((field, i) => `${field} = $${i + 2}`)
    .join(', ');

  const query = `
    INSERT INTO users (${insertFields})
    VALUES (${insertValues})
    ON CONFLICT (id) DO UPDATE
    SET ${updateSet}
    WHERE users.deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query<UserDB>(query, [id, ...values]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

/**
 * @deprecated Use upsertUser instead
 */
export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>
): Promise<User | null> {
  console.warn('updateUser is deprecated. Please use upsertUser instead.');
  return upsertUser(id, updates, false);
}

export async function softDeleteUser(id: string): Promise<boolean> {
  const result = await pool.query<UserDB>(
    `UPDATE users 
     SET deleted_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  );
  
  return (result.rowCount ?? 0) > 0;
}

export interface UserSearchParams {
  username?: string;
  email?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export async function searchUsers(params: UserSearchParams): Promise<{ users: User[]; total: number }> {
  const conditions: string[] = ['deleted_at IS NULL'];
  const values: (string | number)[] = [];
  let paramCount = 0;

  if (params.username) {
    paramCount++;
    conditions.push(`username ILIKE $${paramCount}`);
    values.push(`%${params.username}%`);
  }

  if (params.email) {
    paramCount++;
    conditions.push(`email ILIKE $${paramCount}`);
    values.push(`%${params.email}%`);
  }

  if (params.role) {
    paramCount++;
    conditions.push(`role = $${paramCount}`);
    values.push(params.role);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    values
  );
  
  // Get paginated results
  const limit = params.limit || 10;
  const offset = params.offset || 0;
  
  const result = await pool.query<UserDB>(
    `SELECT * FROM users 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT $${paramCount + 1} 
     OFFSET $${paramCount + 2}`,
    [...values, limit, offset]
  );

  return {
    users: result.rows.map(toUser),
    total: parseInt(countResult.rows[0].total)
  };
} 