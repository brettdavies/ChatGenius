import { Pool, PoolClient, QueryResult, QueryResultRow, PoolConfig, Notification } from 'pg';
import { jest } from '@jest/globals';

export const mockQuery = jest.fn().mockImplementation(() => 
  Promise.resolve({
    rows: [],
    rowCount: 0,
    command: '',
    oid: 0,
    fields: []
  } as QueryResult)
);

export const createMockClient = () => {
  const client = {
    query: mockQuery,
    release: jest.fn(),
    connect: jest.fn(),
    copyFrom: jest.fn(),
    copyTo: jest.fn(),
    pauseDrain: jest.fn(),
    resumeDrain: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    once: jest.fn(),
    addListener: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    listenerCount: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    eventNames: jest.fn(),
    emit: jest.fn(),
    getMaxListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    escapeIdentifier: jest.fn(),
    escapeLiteral: jest.fn(),
    setTypeParser: jest.fn(),
    getTypeParser: jest.fn()
  };

  return client as unknown as jest.Mocked<PoolClient>;
};

export const createMockPool = () => {
  const mockPoolConfig: PoolConfig = {
    max: 20,
    maxUses: 7500,
    allowExitOnIdle: true,
    maxLifetimeSeconds: 3600,
    idleTimeoutMillis: 10000
  };

  const pool = {
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
    expiredCount: 0,
    ending: false,
    ended: false,
    options: mockPoolConfig,
    connect: jest.fn().mockImplementation(() => Promise.resolve(createMockClient())),
    end: jest.fn().mockImplementation(() => Promise.resolve()),
    query: mockQuery,
    on: jest.fn(),
    off: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    once: jest.fn(),
    addListener: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    listenerCount: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    eventNames: jest.fn(),
    emit: jest.fn(),
    getMaxListeners: jest.fn(),
    setMaxListeners: jest.fn()
  };

  return pool as unknown as jest.Mocked<Pool>;
};

export const createQueryResult = <T extends QueryResultRow>(rows: T[]): QueryResult<T> => ({
  rows,
  rowCount: rows.length,
  command: 'SELECT',
  oid: 0,
  fields: []
}); 