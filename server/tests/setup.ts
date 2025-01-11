import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

// Global test teardown
afterAll(() => {
  // Add any global cleanup here
}); 