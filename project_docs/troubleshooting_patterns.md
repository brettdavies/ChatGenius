# Troubleshooting Patterns Guide

This document provides systematic approaches to diagnosing and resolving various types of issues in the ChatGenius project. Each pattern includes problem identification, investigation steps, and resolution strategies.

## Table of Contents
1. [API Integration Issues](#api-integration-issues)
2. [General Troubleshooting Framework](#general-troubleshooting-framework)
3. [Common Problem Patterns](#common-problem-patterns)

## API Integration Issues

### OpenAPI and Route Alignment Pattern

#### Overview
Request → OpenAPI Validator → Route Handler → Response

#### Investigation Process
1. **Problem Identification**
   ```
   Request → OpenAPI Validator → Route Handler → Response
   ```
   - Collect error messages and logs
   - Identify the specific endpoint and HTTP method
   - Note any middleware involvement

2. **Investigation Chain**
   ```mermaid
   graph TD
   A[Error Occurs] --> B{Check Route Implementation}
   B -->|Present| C{Check OpenAPI Spec}
   B -->|Missing| D[Add Route]
   C -->|Missing| E[Add OpenAPI Definition]
   C -->|Present| F{Check Middleware}
   ```

3. **Component Verification**
   - Route Implementation
   - OpenAPI Specification
   - Middleware Chain
   - Authentication/Authorization
   - Request/Response Schema

#### Required Steps for Endpoint Changes
1. **New Endpoint Creation**
   - Create OpenAPI specification first in `/server/src/openapi/paths/`
   - Implement route handler in `/server/src/routes/`
   - Cross-reference paths and methods between OpenAPI and route files
   - Verify response schemas match in both places

2. **Endpoint Modification**
   - Update OpenAPI spec and route handler simultaneously
   - Use a checklist to ensure all components are aligned:
     - [ ] Path parameters
     - [ ] Query parameters
     - [ ] Request body schema
     - [ ] Response schemas
     - [ ] Security requirements
     - [ ] Error responses

3. **Endpoint Removal**
   - Remove from both OpenAPI spec and route handler
   - Check for any client-side references

#### Validation Process
1. **Pre-commit Check**
   ```bash
   # Run OpenAPI validation
   npm run validate:openapi
   
   # Verify route alignment
   npm run check:routes
   ```

2. **Manual Review Points**
   - Compare route paths in OpenAPI vs Express routes
   - Verify security middleware matches OpenAPI security schemes
   - Check response formats match OpenAPI schemas
   - Validate error response structures

#### Common Issues and Solutions
A. **404 Error: Check OpenAPI Spec First**
   - Verify path exists in OpenAPI spec
   - Check for path parameter format mismatches
   - Validate security requirements

B. **400 Bad Request**
   - Compare request schema in OpenAPI vs actual payload
   - Verify parameter types and formats
   - Check validation middleware alignment

C. **Security Mismatches**
   - Ensure consistent security schemes
   - Verify middleware chain matches OpenAPI security

#### Best Practices
1. **Documentation First**
   - Write OpenAPI spec before implementing routes
   - Use spec as contract for implementation
   - Keep schemas in sync with database models

2. **Automated Checks**
   - Run OpenAPI validation in CI/CD
   - Use TypeScript types generated from OpenAPI
   - Implement route alignment tests

3. **Review Process**
   - Include OpenAPI changes in PR description
   - Use checklist for route/OpenAPI alignment
   - Require spec review before implementation

4. **Resolution Steps**
   - Update missing/incorrect components
   - Maintain alignment between implementation and specification
   - Verify changes with test cases

### Key Indicators
- 404 Error: Check OpenAPI spec first
- 401/403 Error: Check auth middleware
- Schema Validation Error: Check request/response types

## General Troubleshooting Framework

1. **Information Gathering**
   - Error messages and stack traces
   - System logs
   - User reports
   - Recent changes
   - Environment context

2. **Problem Isolation**
   ```
   Component A → Interface → Component B
   ```
   - Identify affected components
   - Test component boundaries
   - Verify data flow

3. **Root Cause Analysis**
   - Follow error chain backwards
   - Check documentation
   - Review similar past issues
   - Test assumptions

4. **Solution Development**
   - Create minimal reproduction
   - Test in isolation
   - Document changes
   - Update tests

5. **Verification**
   - Test in all environments
   - Verify edge cases
   - Update documentation
   - Add regression tests

## Common Problem Patterns

### Type System Issues
1. **Symptoms**
   - Compilation errors
   - Runtime type errors
   - Undefined properties

2. **Investigation**
   - Check type definitions
   - Verify imports
   - Review interface alignment
   - Check for null/undefined handling

3. **Resolution**
   - Update type definitions
   - Add type guards
   - Improve error handling
   - Add runtime checks

### State Management Issues
1. **Symptoms**
   - Inconsistent UI state
   - Race conditions
   - Stale data

2. **Investigation**
   - Review state updates
   - Check async operations
   - Verify cleanup
   - Test concurrency

3. **Resolution**
   - Add state guards
   - Implement proper cleanup
   - Use appropriate hooks
   - Add loading states

### Database Issues
1. **Symptoms**
   - Query errors
   - Performance issues
   - Data inconsistency

2. **Investigation**
   - Check query plans
   - Review indexes
   - Verify transactions
   - Check constraints

3. **Resolution**
   - Optimize queries
   - Add/update indexes
   - Implement proper transactions
   - Update schema

### Type Conversion Issues
1. **Symptoms**
   - Data properties missing or undefined
   - Incorrect boolean values
   - Snake_case vs camelCase mismatches
   - Database values not reflecting in application

2. **Investigation Steps**
   ```mermaid
   graph TD
   A[Issue Detected] --> B{Check Type Definitions}
   B --> C{Review Conversion Functions}
   C --> D{Compare DB Schema}
   D --> E{Test Data Flow}
   ```
   - Compare database schema with application types
   - Review type conversion functions (e.g., toUser)
   - Check property mapping between snake_case and camelCase
   - Verify default values for nullable fields
   - Test data flow from DB to API response

3. **Resolution Pattern**
   - Update type definitions to match DB schema
   - Add missing property mappings in conversion functions
   - Implement proper null/undefined handling
   - Add default values where appropriate
   - Update tests to cover conversion edge cases

4. **Example: 2FA Status Issue**
   - **Problem**: 2FA status not correctly reflected after DB query
   - **Root Cause**: Missing property mapping in toUser conversion
   - **Solution**: Updated UserDB interface and toUser function to properly map:
     ```typescript
     // Before
     interface UserDB {
       // Missing TOTP fields
     }
     
     // After
     interface UserDB {
       totp_enabled: boolean;
       totp_secret: string | null;
       // Other TOTP fields...
     }
     
     // Updated conversion
     function toUser(dbUser: UserDB): User {
       return {
         ...dbUser,
         totpEnabled: dbUser.totp_enabled,
         // Other mappings...
       };
     }
     ```

5. **Prevention**
   - Always review DB schema changes against type definitions
   - Maintain comprehensive type conversion tests
   - Document property mapping conventions
   - Use automated tools to detect schema/type mismatches

## Best Practices

1. **Documentation First**
   - Update specs before implementation
   - Keep documentation in sync
   - Document investigation steps
   - Record solutions

2. **Systematic Approach**
   - Follow established patterns
   - Use debugging tools
   - Maintain audit trail
   - Test thoroughly

3. **Communication**
   - Report findings clearly
   - Document assumptions
   - Share knowledge
   - Update team

## Template for New Issues

```markdown
### Issue Description
- Symptoms:
- Environment:
- Recent Changes:

### Investigation
1. Initial Analysis:
2. Component Check:
3. Data Flow:
4. Root Cause:

### Resolution
1. Changes Made:
2. Verification:
3. Prevention:

### Lessons Learned
- What worked:
- What didn't:
- Future improvements:
```

## Contributing

When adding new patterns to this guide:
1. Follow the existing structure
2. Include concrete examples
3. Add relevant diagrams
4. Update table of contents
5. Link to related documentation

Remember: This is a living document. Update it with new patterns and insights as they emerge from real-world problem-solving experiences. 