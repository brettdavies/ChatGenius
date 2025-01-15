/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  // Test environment
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalTeardown: '<rootDir>/tests/teardown.ts',

  // TypeScript configuration
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: true,
    }],
  },

  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '!**/*.e2e.test.ts',
  ],

  // Module resolution
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/types/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/__mocks__/',
    '/tests/setup.ts',
    '\\.d\\.ts$',
  ],

  // Performance & debugging
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  maxWorkers: '50%',
  extensionsToTreatAsEsm: ['.ts']
};

module.exports = config; 