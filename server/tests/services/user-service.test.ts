import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { UserService, UserError, CreateUserInput, UpdateUserInput } from '../../src/services/user-service.js';
import pool from '../../src/db/pool.js';
import { hashPassword } from '../../src/utils/hashPassword.js';
import { ulid } from 'ulid';

describe('UserService', () => {
  const userService = new UserService();
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const id = ulid();
    const hashedPassword = await hashPassword('password123');
    const now = new Date();
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password, username, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [id, 'test@example.com', hashedPassword, 'testuser', 'user', now, now]
    );
    
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@example.com']);
    await pool.end();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const input: CreateUserInput = {
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser'
      };

      const user = await userService.createUser(input);
      expect(user).toBeTruthy();
      expect(user.email).toBe(input.email);
      expect(user.username).toBe(input.username);
      expect(user.role).toBe('user');
    });

    it('should throw error if email is taken', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        username: 'anotheruser'
      };

      await expect(userService.createUser(input))
        .rejects
        .toThrow(UserError);
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const input: UpdateUserInput = {
        username: 'updateduser'
      };

      const user = await userService.updateUser(testUserId, input);
      expect(user).toBeTruthy();
      expect(user.username).toBe(input.username);
    });

    it('should throw error if user not found', async () => {
      await expect(userService.updateUser(ulid(), { username: 'test' }))
        .rejects
        .toThrow(UserError);
    });

    it('should throw error if new email is taken', async () => {
      // Create another user first
      const anotherId = ulid();
      const hashedPassword = await hashPassword('password123');
      const now = new Date();
      
      await pool.query(
        `INSERT INTO users (id, email, password, username, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [anotherId, 'another@example.com', hashedPassword, 'another', 'user', now, now]
      );

      // Try to update test user's email to the other user's email
      await expect(userService.updateUser(testUserId, { email: 'another@example.com' }))
        .rejects
        .toThrow(UserError);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      // Create a user to delete
      const input: CreateUserInput = {
        email: 'delete@example.com',
        password: 'password123',
        username: 'deleteuser'
      };
      
      const user = await userService.createUser(input);
      const result = await userService.deleteUser(user.id);
      
      expect(result).toBe(true);
      
      // Verify user is not found
      await expect(userService.getUserById(user.id))
        .rejects
        .toThrow(UserError);
    });

    it('should throw error if user not found', async () => {
      await expect(userService.deleteUser(ulid()))
        .rejects
        .toThrow(UserError);
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const user = await userService.getUserById(testUserId);
      expect(user).toBeTruthy();
      expect(user.id).toBe(testUserId);
    });

    it('should throw error if user not found', async () => {
      await expect(userService.getUserById(ulid()))
        .rejects
        .toThrow(UserError);
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const user = await userService.getUserByEmail('test@example.com');
      expect(user).toBeTruthy();
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error if user not found', async () => {
      await expect(userService.getUserByEmail('nonexistent@example.com'))
        .rejects
        .toThrow(UserError);
    });
  });

  describe('searchUsers', () => {
    beforeAll(async () => {
      // Create additional test users
      const users = [
        { email: 'john@example.com', username: 'john', role: 'user' },
        { email: 'jane@example.com', username: 'jane', role: 'admin' }
      ];

      for (const user of users) {
        const input: CreateUserInput = {
          email: user.email,
          password: 'password123',
          username: user.username,
          role: user.role
        };
        
        await userService.createUser(input);
      }
    });

    it('should search users by username', async () => {
      const result = await userService.searchUsers({ username: 'john' });
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('john');
    });

    it('should search users by role', async () => {
      const result = await userService.searchUsers({ role: 'admin' });
      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe('admin');
    });

    it('should handle pagination', async () => {
      const result = await userService.searchUsers({ limit: 2, offset: 0 });
      expect(result.users).toHaveLength(2);
      expect(result.total).toBeGreaterThan(2);
    });
  });
}); 