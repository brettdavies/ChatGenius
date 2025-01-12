import { QueryResult, QueryResultRow } from 'pg';
import { Response } from 'express';
import { jest, expect } from '@jest/globals';

/**
 * Type for mocking database rows with proper date handling
 */
export interface MockDbRow extends QueryResultRow {
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Creates a mock database row with proper date handling
 */
export const createMockDbRow = <T extends MockDbRow>(
  data: Omit<T, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }
): T => {
  const now = new Date();
  return {
    ...data,
    createdAt: data.createdAt || now.toISOString(),
    updatedAt: data.updatedAt || now.toISOString(),
  } as T;
};

/**
 * Creates a mock query result
 */
export const createMockQueryResult = <T extends QueryResultRow>(
  rows: T[],
  command = 'SELECT'
): QueryResult<T> => ({
  rows,
  rowCount: rows.length,
  command,
  oid: 0,
  fields: [],
});

/**
 * Transforms date strings to Date objects in database results
 */
export const transformDates = <T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[] = ['createdAt', 'updatedAt'] as (keyof T)[]
): T => {
  const result = { ...data };
  for (const field of dateFields) {
    if (typeof result[field] === 'string') {
      (result[field] as unknown) = new Date(result[field] as string);
    }
  }
  return result;
};

/**
 * Creates a mock Express response with spy methods
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as Response & { [key: string]: jest.Mock };
  return res;
};

/**
 * Creates a mock Express request with optional overrides
 */
export const createMockRequest = (overrides: Record<string, any> = {}) => ({
  headers: {},
  query: {},
  params: {},
  body: {},
  user: { id: 'test-user-id' },
  ...overrides,
});

/**
 * Waits for all promises to resolve
 * Useful when testing async code that doesn't return promises
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/**
 * Creates a mock error for testing error handlers
 */
export const createMockError = (message: string, code?: string) => {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
};

/**
 * Type-safe mock function creator with predefined return value
 */
export const createTypedMock = <T>(returnValue: T): jest.Mock => {
  return jest.fn(() => Promise.resolve(returnValue));
};

/**
 * Asserts that a promise rejects with a specific error
 */
export const expectToReject = async (
  promise: Promise<any>,
  errorType: new (...args: any[]) => Error,
  message?: string
) => {
  try {
    await promise;
    throw new Error('Promise should have rejected');
  } catch (error) {
    if (error instanceof Error) {
      expect(error).toBeInstanceOf(errorType);
      if (message) {
        expect(error.message).toMatch(message);
      }
    }
  }
};

/**
 * Creates a mock transaction for testing database operations
 */
export const createMockTransaction = () => ({
  query: jest.fn(),
  commit: jest.fn(() => Promise.resolve()),
  rollback: jest.fn(() => Promise.resolve()),
}); 