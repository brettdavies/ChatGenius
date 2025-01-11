# Feature Specification: ULID System

## Basic Information

- **Feature ID**: DB-F-006
- **Feature Name**: ULID System
- **Priority**: High
- **Status**: 🟩 Completed

## Overview

This feature implements a ULID (Universally Unique Lexicographically Sortable Identifier) system for generating primary keys across all database tables. ULIDs provide several advantages over traditional auto-incrementing IDs or UUIDs:

- They are lexicographically sortable (maintain time ordering)
- They contain a timestamp component for easy time-based queries
- They prevent sequential ID attacks
- They are URL-safe and case-insensitive
- They are shorter than UUIDs (26 characters vs 36)

The system will be used by all database tables that require a primary key, ensuring consistent ID generation across the application.

## User Stories & Acceptance Criteria

| ID | As a | I want to | So that | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Developer | Generate unique IDs for database records | I can ensure uniqueness across distributed systems | - IDs are 26 characters long<br>- IDs are unique across multiple calls<br>- IDs are lexicographically sortable<br>- IDs contain embedded timestamps |
| US-002 | Developer | Extract timestamps from IDs | I can perform time-based queries without additional columns | - Timestamp extraction is accurate<br>- Invalid IDs are properly handled<br>- Timestamps are in milliseconds since epoch |
| US-003 | Developer | Validate IDs | I can ensure data integrity | - Valid IDs are accepted<br>- Invalid IDs are rejected<br>- Proper error messages are returned |
| US-004 | Developer | Compare IDs chronologically | I can sort records by creation time | - Earlier IDs sort before later IDs<br>- Equal IDs compare as equal<br>- Comparison works with string sorting |

## Technical Implementation

### Security Requirements

- IDs must not be predictable to prevent enumeration attacks
- Validation must be strict to prevent injection of invalid IDs
- Error messages must not expose internal implementation details

### Frontend Changes

The frontend requires TypeScript type definitions and validation utilities for ULID handling. Requirements:

1. Type Safety:
   - Define a ULID type alias for type checking
   - Implement type guards for runtime validation
   - Ensure proper typing in component props and API responses

2. Validation:
   - Client-side validation before API calls
   - Proper error handling for invalid ULIDs
   - Consistent validation with backend rules

Example type definitions:

```typescript
// Example of how to type ULIDs in frontend code
type ULID = string & { readonly _brand: unique symbol };

// Example type guard implementation
function isValidULID(id: string): id is ULID {
  // Implementation details in server utils
  return /^[0-9A-HJ-KM-NP-TV-Z]{26}$/i.test(id);
}
```

### Backend Changes

The backend system must provide core ULID functionality through a utility module. Requirements:

1. Core Functions:
   - ULID generation meeting the specification
   - Timestamp extraction capability
   - Validation functionality
   - Comparison utilities for sorting

2. Error Handling:
   - Clear error messages for invalid IDs
   - Type-safe error handling
   - Proper error propagation

3. Performance:
   - Fast ID generation (sub-millisecond)
   - Efficient validation checks
   - Optimized timestamp extraction

The implementation should be placed in a dedicated utility module (e.g., `src/utils/id.ts`) and exposed through a clean API.

### Database Changes

Database schema and constraints must be updated to properly handle ULIDs. Requirements:

1. Schema Updates:
   - All ID columns should be VARCHAR(26)
   - Add appropriate check constraints for ULID format
   - Create indexes for timestamp-based queries

2. Constraints:
   - Enforce ULID format via check constraints
   - Maintain foreign key relationships
   - Ensure case-insensitive comparisons

Example constraint pattern:

```sql
-- Example of required database changes
ALTER TABLE table_name
  ALTER COLUMN id SET DATA TYPE VARCHAR(26),
  ADD CONSTRAINT valid_ulid_check 
    CHECK (id ~ '^[0-9A-HJ-KM-NP-TV-Z]{26}$');
```

### Configuration

No specific configuration values are required for the ULID system, but the following should be considered:

1. Environment Variables:
   - No additional variables needed
   - Consider monotonic option for future use

2. Feature Flags:
   - No feature flags required
   - Consider flags for future ULID format changes

3. Performance Settings:
   - No specific settings needed
   - Monitor system time synchronization

## Testing Requirements

The ULID system requires comprehensive testing across multiple levels:

### Unit Tests

The following test cases must be implemented:

1. ID Generation:
   - Verify 26-character length
   - Ensure valid character set
   - Test uniqueness across multiple generations
   - Verify chronological ordering

2. Timestamp Extraction:
   - Validate timestamp accuracy
   - Test with current time
   - Handle invalid inputs
   - Verify millisecond precision

3. Validation:
   - Test valid ULID formats
   - Test invalid formats
   - Test edge cases (empty string, wrong length)
   - Test case sensitivity

4. Comparison:
   - Test chronological ordering
   - Test equality comparison
   - Test lexicographical sorting

Example test structure:

```typescript
// Key test cases that must be covered
describe('ULID System', () => {
  describe('Generation', () => {
    // Test uniqueness
    // Test format validity
    // Test chronological ordering
  });

  describe('Validation', () => {
    // Test valid cases
    // Test invalid cases
    // Test edge cases
  });
});
```

Note: Actual implementation and additional test files can be found in the server codebase under `/server/src/utils/id.ts` and its test directory.

## Monitoring Requirements

### Logging

The ULID system requires comprehensive logging to track ID generation, validation, and usage. The logging system should:

1. Track all ULID validation failures with appropriate context
2. Log timestamp extractions for debugging and auditing
3. Include correlation IDs for request tracing
4. Use appropriate log levels (debug for generation, warn/error for validation issues)

Example log format:

```typescript
interface LogFormat {
  timestamp: string;
  correlationId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  event: string;
  // Suggested data structure for ULID-related events
  data?: {
    id?: string;
    validationError?: string;
    timestampExtraction?: {
      id: string;
      timestamp: number;
    };
  };
}
```

### Metrics

The following metrics must be collected to monitor the health and usage of the ULID system:

1. Performance Metrics:
   - ID generation time (histogram)
   - Validation check latency
   - Timestamp extraction performance

2. Operational Metrics:
   - Number of IDs generated per minute
   - Number of validation checks performed
   - Number of timestamp extractions
   - Count of validation failures

3. Error Metrics:
   - Invalid ID attempts
   - Malformed ID submissions
   - Timestamp extraction failures

Example metrics structure:

```typescript
interface Metrics {
  performance: {
    idGeneration: Histogram;  // Track generation time distribution
    validationChecks: Counter;  // Count of validation operations
    timestampExtractions: Counter;  // Count of timestamp extractions
    validationErrors: Counter;  // Track validation failures
  };
}
```

Note: The actual implementation details can be found in the server codebase under `/server/src/utils/id.ts` and its corresponding test file.

## Definition of Done

- [x] ULID generation function implemented and tested
- [x] Timestamp extraction function implemented and tested
- [x] ID validation function implemented and tested
- [x] ID comparison function implemented and tested
- [x] All tests passing with >90% coverage
- [x] Documentation completed
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Performance benchmarks met

## Dependencies

- External services:
  - None required
- Internal dependencies:
  - None required
- Third-party packages:
  - ulid@2.3.0: Core ULID implementation

## Rollback Plan

1. Keep the ULID utility functions in place (they're backward compatible)
2. If needed, revert any database constraints added for ULID validation
3. No data migration needed as ULIDs are stored as strings

## Changelog

| Date | Author | Description | PR |
|------|--------|-------------|-------|
| 2024-03-20 | System | Initial ULID implementation | - |
| 2024-03-20 | System | Added comprehensive tests | - |
| 2024-03-20 | System | Added documentation | - |
