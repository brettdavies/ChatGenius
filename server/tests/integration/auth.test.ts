import request from 'supertest';
import { ulid } from 'ulid';
import app from '../../src/app.js';
import pool from '../../src/db/pool.js';
import { hashPassword } from '../../src/utils/hashPassword.js';
import { AUTH_MESSAGES } from '../../src/constants/auth.constants.js';
import { USER_ROLES } from '../../src/constants/auth.constants.js';

describe('Auth API', () => {
  const testUser = {
    id: ulid(),
    email: 'test@example.com',
    password: 'Password123!',
    username: 'testuser',
    role: USER_ROLES.USER
  };

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await hashPassword(testUser.password);
    const now = new Date();
    await pool.query(
      'INSERT INTO users (id, email, password, username, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [testUser.id, testUser.email, hashedPassword, testUser.username, testUser.role, now, now]
    );
  });

  afterAll(async () => {
    // Clean up test user
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(AUTH_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should fail with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(AUTH_MESSAGES.USER_NOT_FOUND);
    });
  });
}); 