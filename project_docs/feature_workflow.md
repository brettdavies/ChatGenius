# Feature Workflow Example: [[Example Feature Name]]

This document provides a step-by-step example of implementing, testing, and documenting a feature within ChatGenius. It demonstrates how to follow the project's workflow and integrate various documentation and testing processes.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Workflow Steps](#workflow-steps)
   - Add to Feature List
   - Create Feature Document
   - Implementation
   - Testing
   - Documentation Updates
   - Code Review and Merging
3. [Example Artifacts](#example-artifacts)

---

## Feature Overview

**Example Feature**: User Authentication  
**Feature ID**: ID-001  
**Description**: Enable users to register, log in, and reset their passwords using OAuth integration (e.g., Google, Microsoft).  

### Functional Requirements

1. Users can register with an OAuth provider.
2. Users can log in with valid credentials.
3. Users can reset their password via email.

---

## Workflow Steps

### Step 1: Add to Feature List

1. Open the **Feature List** document.
2. Add the feature with the following details:
   - Feature ID: `ID-001`
   - Status: `Planned`
   - Assigned To: `Developer Name`
   - Link: `feature-id-001-auth.md`

**Example**:
    ```md
    | ID-001 | User Authentication    | Enable OAuth-based user authentication. | 🟦 Planned  | Jane Doe       | [Commit Hash](https://github.com/repo/commit/abc123) | [Details](./feature-id-001-auth.md) |
    ```

### Step 2: Create Feature Document

1. Create a new file in the docs/features/ directory named feature-id-001-auth.md.
2. Use the Individual Feature Template to document the feature.
3. Fill in details such as:
   - Functional requirements
   - Validation rules
   - Acceptance criteria
   - Dependencies

### Step 3: Implementation

1. Create a Feature Branch:
   - Branch name: feature/ID-001-auth
   - Example:

    ```plaintext
    git checkout -b feature/ID-001-auth
    ```

2. Frontend Implementation:
   - Add OAuth login buttons to the login page using MUI components.
   - Create a useAuth hook for managing authentication state.
3. Backend Implementation:
   - Set up an endpoint for OAuth login in the Express server.
   - Integrate Auth0 SDK for token management.
4. Link Commits to Feature ID:
   - Example commit message:

feat(auth): add OAuth login functionality [Feature ID(s): ID-001]

### Step 4: Testing

1. Write Test Cases:
   - Add test cases to the Testing Plan document.
   - Example:

    ```md
    | TC-001 | Login with valid credentials | Valid username/password | Redirect to dashboard | Pass | tests/integration/auth.spec.ts | Tested on staging |
    ```

2. Run Tests:
   - Unit Tests:

    ```plaintext
    npm run test
    ```

   - End-to-End Tests:

    ```plaintext
    npx cypress open
    ```

3. Fix Bugs:
   - Resolve issues identified during testing.
   - Ensure all tests pass before moving to code review.

### Step 5: Documentation Updates

1. Update the Feature List:
   - Change the status to 🟩 Completed.
2. Update the Changelog:
   - Example entry:

    ```md
    | Date       | Change Made                           | Made By   |
    |------------|---------------------------------------|-----------|
    | [[Date]]   | Completed User Authentication (ID-001) | Jane Doe  |
    ```

### Step 6: Code Review and Merging

1. Open a Pull Request:
   - Example Pull Request Description:

      **Title**: `feat(auth): implement OAuth login [Feature ID(s): ID-001]`

      **Description**:

      - Added Google and Microsoft OAuth login buttons to the frontend.
      - Integrated Auth0 SDK for token management on the backend.

      **Testing**:

      - Unit tests: Passed.
      - E2E tests: OAuth login scenarios validated on staging.

2. Address Feedback:
   - Apply requested changes from reviewers.
3. Merge:
   - Once approved and CI/CD pipelines pass, merge the branch into main.

### Reworking Completed Features

- Open a new feature branch with the format: `rework/<feature-id>-<description>`.
- Update the corresponding feature document and changelog to reflect the rework.

### Example Artifacts

#### Feature List Entry

```md
| ID-001 | User Authentication    | Enable OAuth-based user authentication. | 🟩 Completed | Jane Doe       | [Commit Hash](https://github.com/repo/commit/abc123) | [Details](./feature-id-001-auth.md) |
```

#### Individual Feature Template

```plaintext
See Feature ID-001 Document.
```

#### Test Case Example

```md
| TC-001 | Login with valid credentials | Valid username/password | Redirect to dashboard | Pass | tests/integration/auth.spec.ts | Tested on staging |
```

Reminder: Follow this example for implementing and documenting features to maintain consistency and quality across the project.

---

## Highlights of This Template

1. **Practical Guide**:
   - Demonstrates how to integrate feature workflows with documentation, implementation, and testing.

2. **Step-by-Step Clarity**:
   - Breaks the process into manageable steps, ideal for onboarding junior developers.

3. **Real Examples**:
   - Includes mock entries for feature lists, test cases, and changelogs to make the process concrete.

4. **Emphasizes Documentation and Testing**:
   - Ensures that all feature-related documentation is updated as part of the workflow.
