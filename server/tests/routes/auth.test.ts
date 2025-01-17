import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/db/pool.js';
import { hashPassword } from '../../src/utils/hashPassword.js';
import { ulid } from 'ulid';

describe('Auth Routes', () => {
  let testUserId: string;
  let agent: request.SuperAgentTest;

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

  beforeEach(() => {
    agent = request.agent(app);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@example.com']);
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          username: 'newuser'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('new@example.com');
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.role).toBe('user');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('INVALID_REQUEST');
    });

    it('should return 400 for existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'anotheruser'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('EMAIL_TAKEN');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get user profile', async () => {
      const response = await agent
        .get(`/api/auth/me?userId=${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(testUserId);
    });

    it('should return 400 for missing userId', async () => {
      const response = await agent.get('/api/auth/me');

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await agent
        .get(`/api/auth/me?userId=${ulid()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('PUT /api/auth/me', () => {
    it('should update user profile', async () => {
      const response = await agent
        .put(`/api/auth/me?userId=${testUserId}`)
        .send({
          username: 'updateduser'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('updateduser');
    });

    it('should return 400 for empty update', async () => {
      const response = await agent
        .put(`/api/auth/me?userId=${testUserId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('INVALID_REQUEST');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await agent
        .put(`/api/auth/me?userId=${ulid()}`)
        .send({
          username: 'updateduser'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('DELETE /api/auth/me', () => {
    it('should delete user account', async () => {
      // Create a user to delete
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'delete@example.com',
          password: 'password123',
          username: 'deleteuser'
        });

      const userId = response.body.user.id;

      const deleteResponse = await agent
        .delete(`/api/auth/me?userId=${userId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify user is not found
      const getResponse = await agent
        .get(`/api/auth/me?userId=${userId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await agent
        .delete(`/api/auth/me?userId=${ulid()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBeDefined();
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await agent
        .post('/api/auth/logout');

      expect(response.status).toBe(204);
    });
  });
}); 