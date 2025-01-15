# API Testing Strategy

## Overview

Our API testing strategy combines OpenAPI/Swagger documentation with automated curl-based testing scripts. This provides both interactive development tools and automated testing capabilities, all running in an isolated test environment.

## Components

### 1. OpenAPI Documentation (`/server/src/openapi/`)

- **Purpose**: Single source of truth for API contracts, documentation, and validation
- **Structure**:

  ```plaintext
  openapi/
  ├── schemas/           # Request/response type definitions
  ├── paths/            # Endpoint specifications
  ├── components/       # Reusable components
  └── index.ts         # Main OpenAPI configuration
  ```

### 2. Curl-based Testing (`/server/scripts/api-tests/`)

- **Purpose**: Automated testing, development workflows
- **Structure**:

```plaintext
  scripts/api-tests/
  ├── _common/
  │   ├── auth.sh        # Auth token management
  │   ├── env.sh         # Environment variables
  │   ├── setup.sh       # Test data initialization
  │   └── utils.sh       # Helper functions
  ├── auth/
  │   ├── login.sh       # Authentication tests
  │   ├── register.sh    # Registration tests
  │   └── profile.sh     # Profile tests
  └── run-all.sh         # Test runner
  ```

## Test Environment

### 1. Configuration

- Uses `.env.test` for all test types:
  - Jest unit/integration tests
  - OpenAPI/Swagger validation
  - Curl-based API tests
- Test-specific settings:
  - Separate port (3001)
  - Test database credentials
  - Test security keys

### 2. Database Isolation

- All tests run in isolated schemas
- Schema naming: `test_api_<timestamp>`
- Automatic schema creation and cleanup
- Uses existing test database but separate schemas

### 3. Test Data Management

- Fresh schema for each test run
- Automated test data setup
- Predefined test users
- Cleanup on test completion or failure

## Development Workflow

1. **Start Development Server**

   ```bash
   cd server
   npm run dev
   ```

2. **Access API Documentation**
   - Navigate to `/api-docs`
   - Interactive API exploration
   - Real-time request testing
   - Documentation reference

3. **Run API Tests**

   ```bash
   cd server/scripts/api-tests
   ./run-all.sh
   ```

## Test Scripts

### 1. Authentication Tests

- Login scenarios
  - Successful login
  - Invalid credentials
  - Invalid input format
- Registration scenarios
  - Successful registration
  - Duplicate email
  - Invalid input
- Profile scenarios
  - Successful retrieval
  - Unauthorized access
  - Invalid token

### 2. Common Utilities

- Token management
- Environment setup
- Database schema handling
- Response validation

## Maintenance

### 1. Schema Updates

- Update OpenAPI schemas when endpoints change
- Keep curl scripts in sync with schema examples
- Run full test suite before deployments
- Review and update documentation

### 2. Test Data

- Maintain test data consistency
- Update setup scripts for new features
- Clean up test artifacts
- Monitor schema isolation

## Usage Examples

### OpenAPI/Swagger

```typescript
// Example OpenAPI schema
{
  "/api/auth/login": {
    "post": {
      "summary": "User login",
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "email": { "type": "string" },
                "password": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

### Curl Script

```bash
#!/bin/bash
# /server/scripts/api-tests/auth/login.sh
source "../_common/auth.sh"

response=$(curl -s -X POST \
  "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$response" | jq '.'
```
