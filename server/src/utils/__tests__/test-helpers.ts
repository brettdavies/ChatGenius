import { Request, Response } from 'express';
import { jest } from '@jest/globals';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createMockUser } from './test-mocks';

export const createMockRequest = (overrides: Partial<AuthenticatedRequest> = {}): jest.Mocked<AuthenticatedRequest> => {
  const req = {
    auth: {
      payload: {
        sub: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    },
    user: createMockUser(),
    params: {},
    query: {},
    body: {},
    headers: {},
    get: jest.fn(),
    header: jest.fn(),
    ...overrides
  } as jest.Mocked<AuthenticatedRequest>;
  
  return req;
};

export const createMockResponse = (): jest.Mocked<Response> => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis()
  } as jest.Mocked<Response>;
  
  return res;
};

export class DatabaseError extends Error {
  code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

export const createDatabaseError = (message: string, code: string): DatabaseError => {
  const error = new DatabaseError(message);
  error.code = code;
  return error;
}; 