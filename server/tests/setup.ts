import '@jest/globals';
import { jest } from '@jest/globals';

// Extend the Jest timeout for all tests
jest.setTimeout(10000);

// Global test setup
beforeAll(() => {
  // Ensure timezone is consistent for date testing
  process.env.TZ = 'UTC';
  
  // Mock console.error to catch unhandled errors
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test teardown
afterAll(() => {
  // Restore console.error
  jest.restoreAllMocks();
}); 