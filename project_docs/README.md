# ChatGenius Project Documentation

## 1. [Project Overview Document](project_overview.md)

### Purpose

Provides a high-level introduction to the project.

### Contents

- Project vision and objectives
- Key stakeholders and teams
- High-level scope of the project (what the project will and won't do)
- Key milestones and timeline
- Tech stack overview and rationale

### Relation

- Serves as the foundation for all other documents
- Helps align team members, stakeholders, and developers on the overall goals and scope

## 2. [Project Structure Document](project_structure.md)

### Purpose

Outlines the organization of the codebase.

### Contents

- Directory structure with descriptions of each folder's purpose (e.g., components/, hooks/, db/)
- File naming conventions
- Rules for organizing and maintaining shared vs. one-off components
- Guidelines for keeping the structure consistent as the project scales

### Relation

- Provides guidance for developers on where to place files and how to navigate the codebase
- Ensures consistency when implementing features from the Feature List

## 3. [Tech Stack and Architecture Document](tech_stack_architecture.md)

### Purpose

Justifies the selection of tools, libraries, and frameworks, and explains how they integrate.

### Contents

- Detailed explanation of the tech stack (frontend, backend, database, third-party services)
- Architecture diagram (Mermaid or other tools)
- Key decisions and trade-offs made when choosing the stack
- Scalability and performance considerations

### Relation

- Informs the Project Overview Document and provides context for the Feature Template and Testing Plan
- Helps onboard new developers and ensures consistent decision-making during implementation

## 4. [Feature List Document](feature_list.md)

### Purpose

Tracks all features in the project, their statuses, and related details.

### Contents

- Comprehensive table of features:
  - Feature ID, name, description, status, assigned developer, recent Git commit, and link to the detailed feature document
- Feature status legend (e.g., Planned, In Progress, Completed)
- Workflow for updating the feature list and status tracking
- Changelog linking feature updates back to the table via Feature IDs

### Relation

- Provides a centralized view of all project features and their progress
- Links directly to Individual Feature Templates for detailed specifications

## 5. [Individual Feature Template](feature_template.md)

### Purpose

Documents detailed specifications for a single feature.

### Contents

- Basic feature details (ID, status, owner)
- Embedded user stories with acceptance criteria
- Functional requirements, validation rules, and edge cases
- Technical implementation details (frontend, backend, integration points)
- Mermaid diagram for data flow or architecture
- Testing plan with specific test cases and strategies
- Workflow for documentation and feature updates
- Changelog tracking changes to the feature specification

### Relation

- Directly tied to the Feature List Document, providing deeper detail for each listed feature
- Ensures every feature is documented and developed systematically

## 6. [Testing Plan Document](testing_plan.md)

### Purpose

Centralized documentation for testing strategies and quality assurance.

### Contents

- Overview of testing methodologies (unit, integration, E2E)
- Tools used for testing (e.g., Jest, Cypress, Postman)
- Testing guidelines for features
- Example test cases (ties into the Individual Feature Template)
- Bug reporting and resolution workflow

### Relation

- Supports the Feature Template by detailing how features should be tested
- Ensures quality across the project and consistency during development

## 7. [Workflow and Contribution Guidelines](workflow_contribution_guidelines.md)

### Purpose

Describes the day-to-day workflow for contributors.

### Contents

- Git branching strategy (e.g., main, feature/branch-name)
- Commit message conventions (reinforces .cursorrules)
- How to update documentation (ties into Feature List and Individual Feature Template)
- Code review process and guidelines for pull requests

### Relation

- Reinforces rules in .cursorrules but focuses on practical workflows
- Ensures smooth collaboration and efficient development processes

## 8. [Requirements Document](requirements.md)

### Purpose

Details functional and non-functional requirements.

### Contents

- Functional requirements for the application (what the system must do)
- Non-functional requirements (performance, scalability, security, usability)
- Acceptance criteria for the project overall and for specific deliverables

### Relation

- Ties directly to the Feature List and Feature Template
- Sets expectations for what constitutes "done" for each feature and the project

## 9. [Feature Workflow Example Document](feature_workflow_example.md)

### Purpose

Demonstrates how to implement, test, and document a feature end-to-end.

### Contents

- Example feature (e.g., user authentication)
- Step-by-step breakdown:
  1. Add the feature to the Feature List
  2. Create an individual Feature Template
  3. Update relevant documentation (e.g., Testing Plan, Project Structure)
  4. Complete implementation and testing
  5. Update the Feature List and Changelog

### Relation

- Provides a concrete example of how all documentation ties together
- Acts as a reference for junior developers to follow the workflow
