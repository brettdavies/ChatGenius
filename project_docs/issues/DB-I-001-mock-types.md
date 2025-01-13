# Database Mock Type Issues

## Problem
The current database mock implementations in `test-mocks.ts` and `test-utils.ts` have TypeScript type compatibility issues with `jest.Mocked<Pool>` and `jest.Mocked<Client>`.

## Current Workarounds
- Using `as unknown as jest.Mocked<Pool>` type assertions
- Keeping database mocks in separate files to avoid type conflicts

## Required Changes
1. Properly type the mock pool implementation to include all required Pool properties
2. Fix type compatibility between mock client and Pool's connect method
3. Add proper type definitions for query results

## Impact
- No functional impact (tests work correctly)
- Only affects TypeScript type checking
- Current workaround using type assertions is acceptable for now

## Related Files
- `server/src/utils/__tests__/test-mocks.ts`
- `server/src/utils/__tests__/test-utils.ts` 