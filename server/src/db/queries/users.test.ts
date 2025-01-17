import { ulid } from 'ulid';
import bcrypt from 'bcryptjs';
import { upsertUser, findUserByEmail, findUserById } from './users.js';
import pool from '../pool.js';
import { User } from '../../auth/types.js';

describe('User Queries', () => {
  let testUser: User;
  const testPassword = 'testPassword123!';
  
  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const result = await upsertUser(ulid(), {
      email: 'test@example.com',
      password: hashedPassword,
      username: 'testuser',
      role: 'user'
    }, true);
    
    if (!result) throw new Error('Failed to create test user');
    testUser = result;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  describe('upsertUser', () => {
    it('should create a new user when isNew is true', async () => {
      const id = ulid();
      const hashedPassword = await bcrypt.hash('newPassword123!', 10);
      const user = await upsertUser(id, {
        email: 'new@example.com',
        password: hashedPassword,
        username: 'newuser',
        role: 'user'
      }, true);

      expect(user).toBeTruthy();
      expect(user?.id).toBe(id);
      expect(user?.email).toBe('new@example.com');
      expect(user?.username).toBe('newuser');
      expect(user?.role).toBe('user');

      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['new@example.com']);
    });

    it('should throw error when required fields are missing for new user', async () => {
      await expect(upsertUser(ulid(), {
        email: 'incomplete@example.com'
      }, true)).rejects.toThrow('Missing required fields for new user');
    });

    it('should update existing user', async () => {
      const updatedUser = await upsertUser(testUser.id, {
        username: 'updateduser'
      });

      expect(updatedUser).toBeTruthy();
      expect(updatedUser?.id).toBe(testUser.id);
      expect(updatedUser?.username).toBe('updateduser');
      expect(updatedUser?.email).toBe(testUser.email);
    });

    it('should not update soft-deleted users', async () => {
      // First, soft delete a user
      const deletedUser = await upsertUser(ulid(), {
        email: 'deleted@example.com',
        password: await bcrypt.hash('password123!', 10),
        username: 'deleteduser',
        role: 'user'
      }, true);

      if (!deletedUser) throw new Error('Failed to create user for deletion test');

      // Soft delete the user
      await pool.query(
        'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [deletedUser.id]
      );

      // Try to update the soft-deleted user
      const updatedUser = await upsertUser(deletedUser.id, {
        username: 'shouldnotupdate'
      });

      expect(updatedUser).toBeNull();

      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['deleted@example.com']);
    });
  });

  describe('findUserByEmail', () => {
    it('should find existing user by email', async () => {
      const user = await findUserByEmail(testUser.email);
      expect(user).toBeTruthy();
      expect(user?.email).toBe(testUser.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await findUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find existing user by id', async () => {
      const user = await findUserById(testUser.id);
      expect(user).toBeTruthy();
      expect(user?.id).toBe(testUser.id);
    });

    it('should return null for non-existent id', async () => {
      const user = await findUserById(ulid());
      expect(user).toBeNull();
    });
  });
}); 