# Workflow and Contribution Guidelines: ChatGenius

This document outlines the standard workflows and contribution practices for ChatGenius. It ensures consistency, efficiency, and collaboration among all contributors.

---

## Table of Contents

- [Workflow and Contribution Guidelines: ChatGenius](#workflow-and-contribution-guidelines-chatgenius)
  - [Table of Contents](#table-of-contents)
  - [Version Control Guidelines](#version-control-guidelines)
    - [Git Branching Strategy](#git-branching-strategy)
    - [Commit Message Conventions](#commit-message-conventions)
  - [Pull Request Process](#pull-request-process)
  - [Code Review Guidelines](#code-review-guidelines)
  - [Documentation Updates](#documentation-updates)
  - [Workflow for Features](#workflow-for-features)
  - [General Best Practices](#general-best-practices)

---

## Version Control Guidelines

### Git Branching Strategy

1. **Main Branch**:
   - The `main` branch contains production-ready code.
   - All code in this branch must be tested and approved.

2. **Development Branch**:
   - Use a `develop` branch (if applicable) to aggregate feature branches before merging into `main`.

3. **Feature Branches**:
   - Name feature branches using the format: `feature/<feature-id>-<short-description>`.
   - Example: `feature/ID-001-add-login-page`.

4. **Hotfix Branches**:
   - Name hotfix branches using the format: `hotfix/<short-description>`.
   - Example: `hotfix/fix-login-bug`.

5. **Bugfix Branches**:
   - Use `bugfix/<issue-id>-<short-description>` for fixing specific bugs.
   - Example: `bugfix/ID-005-fix-api-error`.

### Commit Message Conventions

- Use the following format for commit messages:

    ```plaintext
    type(scope): concise description [Feature ID(s): ID-001]
    ```

- **Types**:
- `feat`: For new features.
- `fix`: For bug fixes.
- `chore`: For maintenance tasks (e.g., updating dependencies).
- `docs`: For documentation changes.
- `refactor`: For code improvements without changing functionality.
- `test`: For adding or updating tests.

- **Examples**:

    ```plaintext
    feat(auth): add OAuth login functionality [Feature ID(s): ID-001]
    fix(api): resolve error in message retrieval [Feature ID(s): ID-002]
    docs: update README with setup instructions
    ```

---

## Pull Request Process

1. **Create the Pull Request**:
   - Use descriptive titles (e.g., `Add login functionality [Feature ID(s): ID-001]`).
   - Link the PR to the relevant issue or feature ID.

2. **Provide a Clear Description**:
   - Include:
     - A summary of changes.
     - Testing details.
     - Screenshots or videos (if applicable).

3. **Add Reviewers**:
   - Assign appropriate team members for review.

4. **Review and Feedback**:
   - Ensure all comments and requested changes are addressed before merging.

5. **Merge Process**:
   - Only merge into `main` or `develop` branches after:
     - All tests pass.
     - At least one reviewer approves the PR.
     - CI/CD pipelines (if applicable) succeed.

---

## Code Review Guidelines

1. **Reviewer Responsibilities**:
   - Ensure the code follows the project’s coding standards.
   - Check for clear naming conventions and code comments.
   - Test the feature or bugfix in a staging environment (if applicable).

2. **Author Responsibilities**:
   - Address all comments or provide justifications for any unresolved issues.
   - Update the feature documentation if required.

3. **Common Code Review Questions**:
   - Does the code solve the problem efficiently?
   - Are there any potential edge cases not accounted for?
   - Are there opportunities to simplify the implementation?

4. **Common Code Review Issues**:
   - **Ambiguous Variable Names**: Use descriptive names like `isAuthenticated` instead of `authFlag`.
   - **Missing Tests**: Ensure all new features have corresponding unit and E2E tests.
   - **Inefficient Logic**: Refactor nested loops or repeated queries where possible.

5. **Large-Scale Refactoring**:
   - Open a dedicated branch: `refactor/<module-name>-improvements`.
   - Update documentation to outline the changes and their rationale.
   - Ensure all impacted tests are updated and validated.

---

## Documentation Updates

1. **When to Update Documentation**:
   - When a feature is added, updated, or removed.
   - When new processes, tools, or guidelines are introduced.

2. **Affected Documents**:
   - Update the **Feature List**, **Feature Template**, or relevant markdown files.

3. **Best Practices**:
   - Ensure clarity and consistency.
   - Link related features or references (e.g., `[Feature ID(s): ID-001]`).

---

## Workflow for Features

1. **Start with a Feature Template**:
   - Create or update the corresponding **Individual Feature Template**.

2. **Follow the Feature Workflow**:
   - Add the feature to the **Feature List**.
   - Create a feature branch (`feature/<feature-id>-<short-description>`).
   - Implement and test the feature in alignment with the **Testing Plan**.

3. **Update the Feature List**:
   - Mark the feature status as "In Progress," "Completed," etc.

4. **Open a Pull Request**:
   - Include all relevant details and link the PR to the **Feature ID**.

5. **Address Review Feedback**:
   - Ensure all requested changes are applied before merging.

---

## General Best Practices

1. **Communication**:
   - Notify team members about significant updates or blockers.
   - Use tools like Slack or Jira for asynchronous updates.

2. **Testing**:
   - Write tests for all new functionality.
   - Ensure all existing tests pass before opening a pull request.

3. **CI/CD**:
   - Monitor automated pipelines to ensure smooth deployments.

4. **Documentation**:
   - Treat documentation as part of the codebase—keep it up-to-date.
