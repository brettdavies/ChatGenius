import { Pool, Client, QueryResult } from 'pg';
import { jest } from '@jest/globals';

export const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
} as unknown as jest.Mocked<Client>;

export const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  end: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  totalCount: 0,
  idleCount: 0,
  waitingCount: 0,
  options: {
    max: 10,
    maxUses: 7500,
    allowExitOnIdle: false,
    maxLifetimeSeconds: 3600,
    idleTimeoutMillis: 10000,
  },
} as unknown as jest.Mocked<Pool>;

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool),
  Client: jest.fn(() => mockClient),
})); 