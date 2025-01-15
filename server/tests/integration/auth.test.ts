import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
import { pool } from '@db/pool';
import { AUTH_ERRORS } from '@constants/auth.constants';
import { API_ROUTES, AUTH_ROUTES } from '@constants/routes.constants';

const TEST_SCHEMA = 'test_schema';

describe('Authentication API', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Clear users table before tests
    await pool.query(`DELETE FROM ${TEST_SCHEMA}.users`);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query(`DELETE FROM ${TEST_SCHEMA}.users`);
  });

  describe(`POST ${API_ROUTES.AUTH}${AUTH_ROUTES.REGISTER}`, () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post(`${API_ROUTES.AUTH}${AUTH_ROUTES.REGISTER}`)
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body).not.toHaveProperty('refreshToken');
    });

    it('should not allow duplicate usernames', async () => {
      const res = await request(app)
        .post(`${API_ROUTES.AUTH}${AUTH_ROUTES.REGISTER}`)
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(AUTH_ERRORS.USERNAME_TAKEN);
    });
  });

  describe(`POST ${API_ROUTES.AUTH}${AUTH_ROUTES.LOGIN}`, () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post(`${API_ROUTES.AUTH}${AUTH_ROUTES.LOGIN}`)
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body).not.toHaveProperty('refreshToken');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post(`${API_ROUTES.AUTH}${AUTH_ROUTES.LOGIN}`)
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(AUTH_ERRORS.INVALID_CREDENTIALS);
    });
  });

  describe(`GET ${API_ROUTES.AUTH}${AUTH_ROUTES.ME}`, () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(`${API_ROUTES.AUTH}${AUTH_ROUTES.LOGIN}`)
        .send({
          username: testUser.username,
          password: testUser.password
        });
      accessToken = res.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get(`${API_ROUTES.AUTH}${AUTH_ROUTES.ME}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get(`${API_ROUTES.AUTH}${AUTH_ROUTES.ME}`)
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(AUTH_ERRORS.INVALID_TOKEN);
    });
  });
}); 