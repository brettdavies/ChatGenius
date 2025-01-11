/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.ts',
    '<rootDir>/src/**/*.{spec,test}.ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/setup.ts'
  ]
}; 