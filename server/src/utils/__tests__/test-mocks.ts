import { Response } from 'express';
import { DatabaseEvent } from '../events';
import { AuthResult } from '../authorization';
import { jest } from '@jest/globals';

/**
 * Mock Auth0 middleware for testing
 */
export const mockAuth0Middleware = {
  checkJwt: (req: any, res: any, next: any) => {
    if (req.headers['x-mock-auth'] === 'fail') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = { id: 'test-user-id' };
    next();
  },
};

/**
 * Mock event service for testing
 */
export const mockEventService = {
  emit: jest.fn(),
  onEvent: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  getStatus: jest.fn(),
};

/**
 * Mock authorization service for testing
 */
export const mockAuthService = {
  checkPermission: jest.fn<() => Promise<AuthResult>>().mockResolvedValue({ allowed: true }),
  canCreateChannel: jest.fn<() => Promise<AuthResult>>().mockResolvedValue({ allowed: true }),
  canManageChannel: jest.fn<() => Promise<AuthResult>>().mockResolvedValue({ allowed: true }),
  canViewChannel: jest.fn<() => Promise<AuthResult>>().mockResolvedValue({ allowed: true }),
} as const;

/**
 * Creates a mock Express response object for testing
 */
export const createMockResponse = () => ({
  write: jest.fn().mockReturnValue(true),
  writeHead: jest.fn().mockReturnValue(true),
  setHeader: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
  end: jest.fn(),
}) as unknown as Response;

/**
 * Creates a mock database event for testing
 */
export const createMockDatabaseEvent = <T>(
  channel: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  data: T
): DatabaseEvent<T> => ({
  channel,
  operation,
  schema: 'public',
  table: channel,
  data,
}); 