import pool from '../pool.js';
import { User, UserDB, toUser } from '../../auth/types.js';
import { normalizeEmail } from '../../utils/email.js';

export async function findUserByEmail(email: string): Promise<UserDB | null> {
  if (!email) return null;
  
  const normalizedEmail = normalizeEmail(email);
  const result = await pool.query<UserDB>(
    `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [normalizedEmail]
  );

  return result.rows[0] || null;
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
  
  // Convert camelCase to snake_case
  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  
  // Build the query dynamically
  const insertFields = ['id', ...fields.map(toSnakeCase)].join(', ');
  const insertValues = [`$1`, ...fields.map((_, i) => `$${i + 2}`)].join(', ');
  const updateSet = fields
    .map((field, i) => {
      const snakeCase = toSnakeCase(field);
      
      // Handle array type for backup_codes
      if (field === 'backupCodes') {
        return `backup_codes = $${i + 2}`;
      }
      // Handle date type for totp_verified_at
      if (field === 'totpVerifiedAt') {
        return `totp_verified_at = $${i + 2}`;
      }
      // Handle boolean type for totp_enabled
      if (field === 'totpEnabled') {
        return `totp_enabled = $${i + 2}`;
      }
      // Handle string type for totp_secret
      if (field === 'totpSecret') {
        return `totp_secret = $${i + 2}`;
      }
      // Default case for other fields
      return `${snakeCase} = $${i + 2}`;
    })
    .join(', ');

  const query = `
    INSERT INTO users (${insertFields})
    VALUES (${insertValues})
    ON CONFLICT (id) DO UPDATE
    SET ${updateSet}
    WHERE users.deleted_at IS NULL
    AND users.id = $1
    RETURNING *
  `;

  try {
    const result = await pool.query<UserDB>(query, [id, ...values]);
    return result.rows[0] ? toUser(result.rows[0]) : null;
  } catch (error: any) {
    // If the error is about null values in required fields, try to update only the specified fields
    if (error.code === '23502' && !isNew) {
      const existingUser = await pool.query<UserDB>(
        'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      
      if (!existingUser.rows[0]) {
        throw error;
      }

      // Only update the fields that were provided
      const updateFields = fields.map((field, i) => {
        const snakeCase = toSnakeCase(field);
        return `${snakeCase} = $${i + 2}`;
      }).join(', ');

      const updateQuery = `
        UPDATE users 
        SET ${updateFields}
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *
      `;

      const updateResult = await pool.query<UserDB>(updateQuery, [id, ...values]);
      return updateResult.rows[0] ? toUser(updateResult.rows[0]) : null;
    }
    throw error;
  }
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

export async function findUsersByIds(ids: string[]): Promise<User[]> {
  if (!ids.length) return [];
  
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const result = await pool.query<UserDB>(
    `SELECT * FROM users 
     WHERE id IN (${placeholders}) 
     AND deleted_at IS NULL`,
    ids
  );
  
  return result.rows.map(toUser);
} 