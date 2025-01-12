# Testing Guide

## Test Organization

### Directory Structure

```plaintext
server/
├── src/
│   ├── __mocks__/           # Jest auto-mocks
│   │   ├── pg.ts
│   │   └── auth0.ts
│   └── utils/
│       └── __tests__/       # Test files
│           ├── test-helpers.ts
│           └── test-mocks.ts
├── tests/
│   ├── setup.ts            # Regular test setup
│   ├── setup.e2e.ts       # E2E test setup
│   ├── global-setup.e2e.ts
│   └── global-teardown.e2e.ts
└── jest.config.ts         # Test configuration
```

### Mock Organization

- **External Module Mocks** (`__mocks__/`):
  - Place mocks for external modules here
  - Jest automatically loads these mocks when using `jest.mock()`
  - Example: `pg.ts` for database mocks

- **Service Mocks** (`test-mocks.ts`):
  - Internal service mocks (event service, auth service)
  - Shared response mocks
  - Event mocks

- **Test Utilities** (`test-helpers.ts`):
  - Helper functions for creating test data
  - Query result builders
  - Date handling utilities

## Database Testing

### Date Handling

- PostgreSQL stores timestamps in `TIMESTAMPTZ` format
- When retrieving dates from the database:
  - Use aliases in SQL queries (e.g., `created_at as "createdAt"`)
  - Use the `transformDates` utility to convert string dates to `Date` objects
  - In tests, verify both the type (`expect(date).toBeInstanceOf(Date)`) and value (`expect(date.toISOString()).toBe(expectedString)`)

### Mock Database Rows

- Use the `createMockDbRow` utility from `test-helpers.ts`
- Follow the camelCase convention for field names in mock data
- Always provide proper types for mock data using interfaces

### Database Pool Mocking

- Import mocks from `__mocks__/pg.ts`
- Mock is automatically loaded when using `jest.mock('pg')`
- Includes proper pool options and event emitter methods

## Event Testing

### Event Data Verification

- When testing event emissions, extract and verify the event data separately:

  ```typescript
  const emitCall = mockEventService.emit.mock.calls[0][0];
  
  // Verify event metadata
  expect(emitCall).toEqual(expect.objectContaining({
    channel: 'channels',
    operation: 'INSERT',
    schema: 'public',
    table: 'channels',
  }));

  // Verify event data separately
  expect(emitCall.data).toEqual(expect.objectContaining({
    id: channelId,
    name: 'Test Channel',
  }));
  ```

### Date Objects in Events

- Event data may contain Date objects
- Verify Date objects separately from other data:

  ```typescript
  expect(emitCall.data.createdAt).toBeInstanceOf(Date);
  expect(emitCall.data.createdAt.toISOString()).toBe(expectedDateString);
  ```

## Jest Mocking

### Mock Dependencies

- Mock external modules before importing them:

  ```typescript
  // External module mocks are auto-loaded from __mocks__
  jest.mock('pg');
  jest.mock('@auth0/auth0-react');

  // Then import service mocks
  import { mockEventService, mockAuthService } from '../../utils/__tests__/test-mocks';
  ```

### ID Generation

- Mock ID generation functions to ensure consistent IDs in tests:

  ```typescript
  jest.mock('../../utils/id', () => ({
    generateId: jest.fn().mockReturnValue('test-channel-id'),
  }));
  ```

## Test Setup

### Before Each Test

- Use `beforeEach` to reset mocks and create fresh instances
- Clear mocks between tests: `jest.clearAllMocks()`
- Create constants for commonly used test data:

  ```typescript
  const userId = 'test-user';
  const validChannelData = {
    name: 'Test Channel',
    description: 'A test channel',
    isPrivate: false,
  };
  ```

### Test Cases

- Test both success and error cases
- Verify all aspects of the operation:
  - Database operations
  - Event emissions
  - Authorization checks
  - Data validation
  - Error handling
  - Resource cleanup (e.g., client release)

### Transaction Testing

- Test the complete transaction flow:
  - BEGIN
  - Operations
  - COMMIT
  - Client release
- Test rollback scenarios:
  - BEGIN
  - Failed operation
  - ROLLBACK
  - Client release

## Best Practices

### Type Safety

- Always provide proper types for mock data
- Use TypeScript interfaces to ensure type safety in tests
- Use type assertions judiciously (e.g., `as jest.Mock`)

### Test Utilities

- Create and use shared test utilities for common operations
- Document utility functions with JSDoc comments
- Keep utilities simple and focused

### Validation Testing

1. **Schema Testing**:
   - Test both success and failure cases for each validation rule
   - Verify error messages are clear and helpful
   - Test optional vs required fields
   - Test default values
   - Test type coercion (if enabled)

2. **Edge Cases**:
   - Empty strings vs null values
   - Whitespace-only values
   - Maximum length boundaries
   - Special characters and Unicode (including emojis)
   - Type conversion edge cases

3. **Validation Order**:
   - Validate data before any transformations
   - Test that validation happens before business logic
   - Verify proper transaction rollback on validation failure

4. **Error Handling**:
   - Test error message format consistency
   - Verify error messages are user-friendly
   - Test error aggregation for multiple validation failures
   - Ensure proper HTTP status codes (usually 400 for validation errors)

## Mock Implementation

### External Module Mocks

External modules should be mocked in the `__mocks__` directory:

```typescript
// __mocks__/pg.ts
import { Pool, Client } from 'pg';
import { jest } from '@jest/globals';

export const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
} as unknown as jest.Mocked<Client>;

export const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
  query: jest.fn(),
  // ... other methods
} as unknown as jest.Mocked<Pool>;

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool),
  Client: jest.fn(() => mockClient),
}));
```

### Service-Level Mocks

Service mocks should be defined in `test-mocks.ts`:

```typescript
export const mockAuthService = {
  checkPermission: jest.fn<() => Promise<AuthResult>>()
    .mockResolvedValue({ allowed: true }),
  // ... other methods
} as const;

export const mockEventService = {
  emit: jest.fn(),
  onEvent: jest.fn(),
  // ... other methods
};
```

### Test Utilities

Utilities should be simple and focused in `test-helpers.ts`:

```typescript
export const createMockDbRow = <T extends MockDbRow>(
  data: Omit<T, 'createdAt' | 'updatedAt'>
): T => ({
  ...data,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

## Test Coverage Requirements

### Coverage Thresholds

The project requires the following minimum coverage thresholds:

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    }
  }
}
```

### Required Test Coverage

1. **Services**:
   - 100% coverage for critical business logic
   - All error paths must be tested
   - Full coverage of transaction flows

2. **Controllers**:
   - All route handlers must be tested
   - Authentication/authorization flows covered
   - Error handling for all possible responses

3. **Middleware**:
   - Full coverage of validation logic
   - Error handling middleware tested
   - Authentication middleware tested

4. **Database Operations**:
   - All SQL queries must be tested
   - Transaction rollback scenarios covered
   - Connection error handling tested

5. **Event Handlers**:
   - All event emissions tested
   - Event handling logic covered
   - Error handling in event processing

### Excluded from Coverage

The following items may be excluded from coverage requirements:

```javascript
// jest.config.js
module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/__mocks__/',
    '/tests/setup.ts',
    '\\.d\\.ts$'
  ]
}
```

### Running Coverage Reports

To generate and view coverage reports:

```bash
# Generate coverage report
npm run test:coverage

# View detailed HTML report
open coverage/lcov-report/index.html
```

## Files to Move

Based on our new directory structure, the following files need to be moved:

1. Move database mocks to `__mocks__/pg.ts`:

   ```bash
   mv src/utils/__tests__/db-mocks.ts src/__mocks__/pg.ts
   ```

2. Move auth mocks to `__mocks__/auth0.ts`:

   ```bash
   mv src/utils/__tests__/auth-mocks.ts src/__mocks__/auth0.ts
   ```

3. Consolidate test utilities:

   ```bash
   mv src/utils/__tests__/test-utils.ts src/utils/__tests__/test-helpers.ts
   ```

4. Ensure global setup is in place:

   ```bash
   mkdir -p tests
   touch tests/setup.ts
   ```

## Running Tests

### Test Environment

Tests run in a Node.js environment with the following configuration:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/file.test.ts

# Run tests matching a pattern
npm test -- -t "pattern"
```

## Test Configuration

### Test Types

1. **Unit Tests** (`*.test.ts`):
   - Located in `__tests__` directories
   - Run with `npm test` or `npm run test:unit`
   - Use mocked dependencies
   - Fast execution, focused scope

2. **Integration Tests** (`*.integration.test.ts`):
   - Test interaction between components
   - Run with `npm run test:integration`
   - May use real database connections
   - Test transaction flows and service interactions

3. **E2E Tests** (`*.e2e.test.ts`):
   - Located in `e2e` directories
   - Run with `npm run test:e2e`
   - Use real database and services
   - Test complete user flows
   - Separate configuration in `jest.config.e2e.ts`

### Database Testing

For e2e tests, the database is managed automatically:

- `global-setup.e2e.ts`: Creates tables and loads seed data
- `global-teardown.e2e.ts`: Cleans up test database
- Uses separate test database (set via `TEST_DATABASE_URL`)

### Test Commands

```bash
# Regular tests (unit + integration)
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report

# E2E tests
npm run test:e2e        # Run e2e tests
npm run test:e2e:watch  # Watch mode for e2e

# Specific test types
npm run test:unit        # Only unit tests
npm run test:integration # Only integration tests

# Development helpers
npm run test:changed    # Test only changed files
npm run test:debug      # Run tests with debugger
```

### Coverage Requirements

- Branches: 80%
- Functions: 85%
- Lines: 90%
- Statements: 90%

Excluded from coverage:

- Type definitions (`*.d.ts`)
- Test files
- Mock files
- Configuration files
