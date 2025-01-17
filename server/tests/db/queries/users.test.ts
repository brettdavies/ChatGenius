import { beforeAll, afterAll, describe, it, expect, beforeEach } from '@jest/globals';
import { ulid } from 'ulid';
import pool from '../../../src/db/pool.js';
import { hashPassword } from '../../../src/utils/hashPassword.js';
import { 
  findUserByEmail, 
  findUserById, 
  updateUser, 
  softDeleteUser,
  searchUsers,
  UserSearchParams
} from '../../../src/db/queries/users.js';
import { User } from '../../../src/auth/types.js';

describe('User Queries', () => {
  let testUser: User;
  
  beforeAll(async () => {
    // Create test user
    const id = ulid();
    const hashedPassword = await hashPassword('password123');
    const now = new Date();
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password, username, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, 'test@example.com', hashedPassword, 'testuser', 'user', now, now]
    );
    
    testUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      password: result.rows[0].password,
      username: result.rows[0].username,
      role: result.rows[0].role,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      deletedAt: result.rows[0].deleted_at
    };
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const user = await findUserByEmail('test@example.com');
      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await findUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      const user = await findUserById(testUser.id);
      expect(user).toBeTruthy();
      expect(user?.id).toBe(testUser.id);
    });

    it('should return null for non-existent id', async () => {
      const user = await findUserById(ulid());
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const updates = {
        username: 'updateduser'
      };
      
      const user = await updateUser(testUser.id, updates);
      expect(user).toBeTruthy();
      expect(user?.username).toBe('updateduser');
    });

    it('should return null for non-existent user', async () => {
      const user = await updateUser(ulid(), { username: 'test' });
      expect(user).toBeNull();
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      // Create a user to delete
      const id = ulid();
      const hashedPassword = await hashPassword('password123');
      const now = new Date();
      
      await pool.query(
        `INSERT INTO users (id, email, password, username, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, 'delete@example.com', hashedPassword, 'deleteuser', 'user', now, now]
      );

      const result = await softDeleteUser(id);
      expect(result).toBe(true);

      // Verify user is not found by normal queries
      const user = await findUserById(id);
      expect(user).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const result = await softDeleteUser(ulid());
      expect(result).toBe(false);
    });
  });

  describe('searchUsers', () => {
    beforeEach(async () => {
      // Create additional test users
      const users = [
        { email: 'john@example.com', username: 'john', role: 'user' },
        { email: 'jane@example.com', username: 'jane', role: 'admin' },
        { email: 'bob@example.com', username: 'bob', role: 'user' }
      ];

      for (const user of users) {
        const id = ulid();
        const hashedPassword = await hashPassword('password123');
        const now = new Date();
        
        await pool.query(
          `INSERT INTO users (id, email, password, username, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, user.email, hashedPassword, user.username, user.role, now, now]
        );
      }
    });

    it('should search users by username', async () => {
      const params: UserSearchParams = {
        username: 'john'
      };
      
      const result = await searchUsers(params);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('john');
    });

    it('should search users by role', async () => {
      const params: UserSearchParams = {
        role: 'admin'
      };
      
      const result = await searchUsers(params);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe('admin');
    });

    it('should handle pagination', async () => {
      const params: UserSearchParams = {
        limit: 2,
        offset: 0
      };
      
      const result = await searchUsers(params);
      expect(result.users).toHaveLength(2);
      expect(result.total).toBeGreaterThan(2);
    });
  });
}); 