import '@jest/globals';

// Extend timeout for all tests
jest.setTimeout(30000);

// Ensure timezone is consistent
process.env.TZ = 'UTC';

// Load test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Global test setup
beforeAll(() => {
  // Add any additional setup here
});

// Reset application state before each test
beforeEach(async () => {
  // Clear any test data between tests
});

// Global test teardown
afterAll(async () => {
  // Add any cleanup here
}); 