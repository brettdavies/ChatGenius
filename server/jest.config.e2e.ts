import type { Config } from '@jest/types';
import baseConfig from './jest.config';

const config: Config.InitialOptions = {
  ...baseConfig,
  // Specify e2e test pattern
  testMatch: [
    '**/__tests__/**/*.e2e.test.ts',
    '**/e2e/**/*.test.ts'
  ],

  // Longer timeout for e2e tests
  testTimeout: 30000,

  // Separate coverage settings for e2e
  coverageDirectory: 'coverage/e2e',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/types/**',
    '!src/tests/**',
  ],

  // Use a separate setup file for e2e tests
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.e2e.ts'
  ],

  // Global setup/teardown for e2e tests (e.g., database)
  globalSetup: '<rootDir>/tests/global-setup.e2e.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.e2e.ts',

  // Use real implementations instead of mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  }
};

export default config; 