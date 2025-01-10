# Feature List for ChatGenius

This document provides an overview of all features in the ChatGenius project. Each entry includes the feature's ID, name, description, status, assigned developer, and relevant links for tracking progress.

---

## Table of Contents

- [Feature List for ChatGenius](#feature-list-for-chatgenius)
  - [Table of Contents](#table-of-contents)
  - [Feature List Overview](#feature-list-overview)
  - [Feature Status Legend](#feature-status-legend)
  - [Feature List](#feature-list)
    - [ID-001](#id-001)
    - [ID-002](#id-002)
    - [ID-003](#id-003)
    - [ID-004](#id-004)
    - [ID-005](#id-005)
  - [Workflow for Updates](#workflow-for-updates)
    - [Adding a New Feature](#adding-a-new-feature)
    - [Updating Feature Status](#updating-feature-status)
    - [Removing or Deferring Features](#removing-or-deferring-features)
    - [Communicate Changes](#communicate-changes)
  - [Changelog](#changelog)
  - [Highlights of This Template](#highlights-of-this-template)

---

## Feature List Overview

The feature list serves as a centralized reference for:

- Tracking feature progress (Planned, In Progress, Completed, etc.).
- Linking to detailed feature documents, relevant Git commits, and test cases.
- Ensuring alignment across developers, testers, and stakeholders.

---

## Feature Status Legend

- 🟦 **Planned**: The feature is scoped but not yet started.
- 🟨 **In Progress**: The feature is actively being developed.
- 🟩 **Completed**: The feature is fully implemented, tested, and merged.
- 🟥 **Blocked**: The feature is delayed due to an external dependency or issue.
- 🟧 **Deferred**: The feature is deprioritized for now and will be revisited later.

---

## Feature List

### ID-001

| Feature ID | Feature Name             | Description                           | Status      | Assigned To  | Link to Details            | Commit Reference                                         | Last Updated |
|------------|--------------------------|---------------------------------------|-------------|--------------|---------------------------|---------------------------------------------------|
| [[ID-001]] | Feature A                | [[Brief Description]]                | 🟦 Planned  | [[Assignee]] | [Details](./[[feature-doc]]) | [Commit Hash](https://github.com/repo/commit/[[commit-id]]) | 2025-01-10 |

### ID-002

| Feature ID | Feature Name             | Description                           | Status      | Assigned To  | Link to Details            | Commit Reference                                         | Last Updated |
|------------|--------------------------|---------------------------------------|-------------|--------------|---------------------------|---------------------------------------------------|
| [[ID-002]] | Feature B                | [[Brief Description]]                | 🟨 In Progress | [[Assignee]] | [Details](./[[feature-doc]]) | [Commit Hash](https://github.com/repo/commit/[[commit-id]]) | 2025-01-10 |

### ID-003

| Feature ID | Feature Name             | Description                           | Status      | Assigned To  | Link to Details            | Commit Reference                                         | Last Updated |
|------------|--------------------------|---------------------------------------|-------------|--------------|---------------------------|---------------------------------------------------|
| [[ID-003]] | Feature C                | [[Brief Description]]                | 🟩 Completed | [[Assignee]] | [Details](./[[feature-doc]]) | [Commit Hash](https://github.com/repo/commit/[[commit-id]]) | 2025-01-10 |

### ID-004

| Feature ID | Feature Name             | Description                           | Status      | Assigned To  | Link to Details            | Commit Reference                                         | Last Updated |
|------------|--------------------------|---------------------------------------|-------------|--------------|---------------------------|---------------------------------------------------|
| [[ID-004]] | Feature D                | [[Brief Description]]                | 🟥 Blocked  | [[Assignee]] | [Details](./[[feature-doc]]) | [Commit Hash](https://github.com/repo/commit/[[commit-id]]) | 2025-01-10 |

### ID-005

| Feature ID | Feature Name             | Description                           | Status      | Assigned To  | Link to Details            | Commit Reference                                         | Last Updated |
|------------|--------------------------|---------------------------------------|-------------|--------------|---------------------------|---------------------------------------------------|
| [[ID-005]] | Feature E                | [[Brief Description]]                | 🟧 Deferred | [[Assignee]] | [Details](./[[feature-doc]]) | [Commit Hash](https://github.com/repo/commit/[[commit-id]]) | 2025-01-10 |

---

## Workflow for Updates

### Adding a New Feature

1. Assign a unique **Feature ID** using the format `ID-###`.
2. Add an entry to the **Feature List** table with:
   - A concise description.
   - The current status (default to 🟦 Planned).
   - The developer or team responsible for the feature.
   - A Link to the feature document. Use a placeholder like `[[feature-doc]]` for the individual feature file if it doesn't exist yet.
   - Leave the **Commit Reference** column blank for now.

### Updating Feature Status

1. Change the **Status** column in the table to reflect progress (e.g., 🟨 In Progress, 🟩 Completed).
2. Update the **Commit Reference** column with the most recent commit related to the feature.
3. Verify the **Link to Details** column is pointing to the correct feature document.

### Removing or Deferring Features

1. Mark the status as ⬜ Deferred or remove the feature entirely if it is no longer relevant.
2. Document the reason for deferring or removing the feature in the **Changelog**.

### Communicate Changes

1. Notify the team of significant updates during standups or in documentation pull requests.

---

## Changelog

| Date       | Change Made                                     | Made By     |
|------------|------------------------------------------------|-------------|
| [[Date]]   | Added [Feature A](#id-001) to "Planned" section | [[Name]]    |
| [[Date]]   | Moved [Feature B](#id-002) to "In Progress" section | [[Name]]    |
| [[Date]]   | Updated Git Commit ID for [Feature C](#id-003)     | [[Name]]    |

---

**Reminder**: Keep this document up to date to ensure clarity and alignment across the team. If you have questions or suggestions, add them to the workflow section for review.

---

## Highlights of This Template

1. **Centralized Tracking**:
   - Provides a comprehensive view of all project features and their statuses.
2. **Link Integration**:
   - Connects each feature to its detailed document and related Git commits.
3. **Clear Workflow**:
   - Includes instructions for adding, updating, and managing features, ensuring consistency.
4. **Progress at a Glance**:
   - Uses a status legend and table format to make tracking progress easy.
