# ChatGenius Overview

This document provides a high-level introduction to the ChatGenius project, including its vision, objectives, scope, and key details. It is intended to align all team members and stakeholders with the project’s goals and purpose.

---

## Table of Contents

- [ChatGenius Overview](#chatgenius-overview)
  - [Table of Contents](#table-of-contents)
  - [Project Vision](#project-vision)
  - [Objectives](#objectives)
    - [Primary Objectives](#primary-objectives)
    - [Secondary Objectives](#secondary-objectives)
  - [Scope](#scope)
    - [In-Scope](#in-scope)
    - [Out-of-Scope (MVP Phase)](#out-of-scope-mvp-phase)
  - [Key Milestones](#key-milestones)
  - [Tech Stack Overview](#tech-stack-overview)
    - [Frontend Stack](#frontend-stack)
    - [Server Stack](#server-stack)
    - [Database Stack](#database-stack)
  - [Key Risks and Mitigations](#key-risks-and-mitigations)
  - [Stakeholders and Teams](#stakeholders-and-teams)
    - [Key Stakeholders](#key-stakeholders)
    - [Development Team](#development-team)
    - [External Dependencies](#external-dependencies)

---

## Project Vision

ChatGenius aims to create an exact replica of Slack's functionality and user interface. The project will focus on creating a complete clone of Slack with identical features and user experience.

Our goal is to develop a communication platform that is indistinguishable from Slack in its base functionality, providing users with a familiar and robust workplace communication tool.

---

## Objectives

### Primary Objectives

1. Create a Slack clone with:
   - Identical user interface and experience
   - Real-time messaging with SSE technology
   - Complete feature parity including:
     - Channel-based communication
     - Direct messaging
     - Thread support
     - Emoji reactions
     - User presence indicators
     - Search functionality

### Secondary Objectives

1. User Experience Excellence:
   - Match Slack's UI precisely
   - Ensure responsive design matching Slack's behavior
   - Implement all keyboard shortcuts and accessibility features
   - Support all languages and alphabets
   - Maintain real-time performance matching Slack's standards

2. Developer Experience:
   - Establish clear documentation and coding standards
   - Implement efficient development workflows using Cursor AI
   - Create automated testing and deployment pipelines
   - Maintain modular architecture for future enhancements

---

## Scope

### In-Scope

MVP Phase (2 Day Delivery):

- User Management
  - Auth0-based authentication with:
    - Social logins (Google, GitHub)
    - Email/password
  - User profiles matching Slack's format
  - Real-time presence indicators
  - Custom status messages
  - User preferences and settings

- Messaging Core
  - Real-time messaging via SSE
  - Full Unicode support for all languages
  - Rich text formatting
  - Markdown support
  - Emoji reactions (full parity with Slack)
  - Message editing and deletion with history
  - Typing indicators
  - Read states
  - Thread support with full functionality
  - Message search with Slack-like operators

- Channels & Direct Messages
  - Public and private channels
  - Direct messages (1:1)
  - Group direct messages
  - Channel creation and management
  - User invitations
  - Channel/conversation sidebar
  - Unread indicators
  - Channel/conversation search

- UI/UX
  - Pixel-perfect Slack clone
  - Dark/light theme support
  - All keyboard shortcuts
  - Responsive design matching Slack
  - Loading states and animations
  - Error states and notifications
  - Context menus
  - Tooltips and help text

### Out-of-Scope (MVP Phase)

- Mobile native applications
- Video/audio calls
- Screen sharing
- Third-party integrations (except Auth0)
- Custom emoji support
- Message scheduling
- Workflow builder
- Advanced search operators
- Analytics and insights
- User groups and org structure
- Compliance exports
- Custom retention policies
- File handling features:
  - File upload and sharing
  - File previews and comments
  - Storage management
  - File search functionality
- PWA features:
  - Offline support
  - Service Workers
  - Installation capabilities
  - Background sync
  - Push notifications
  - Local storage and caching

---

## Key Milestones

| Milestone           | Description                                        | Target Date    | Status       |
|--------------------|----------------------------------------------------|----------------|--------------|
| Project Initiation | Setup repository, documentation, and infrastructure | Jan 10, 2024   | Completed    |
| Day 1 Development  | Core messaging, channels, and auth implementation   | Jan 11, 2024   | In Progress  |
| Day 2 Development  | UI polish, testing, and deployment                 | Jan 12, 2024   | Planned      |

---

## Tech Stack Overview

| Layer        | Technology                          | Rationale                                   |
|--------------|-------------------------------------|--------------------------------------------|
| Frontend     | React, TypeScript, Tailwind, Vite   | Modern, type-safe UI development           |
| State        | Zustand                            | Simple, flexible state management          |
| Server       | Node.js, TypeScript, Express        | Type-safe, efficient message handling      |
| Database     | PostgreSQL                          | Reliable, self-hosted database             |
| Real-time    | Server-Sent Events (SSE)           | Simple, reliable one-way real-time updates |
| Auth         | Passport.js                        | Session-based authentication               |
| Testing      | Jest, React Testing Library        | Comprehensive test coverage                |
| Deployment   | Docker                             | Containerized deployment and scaling       |
| Development  | Cursor AI                          | AI-powered development assistance          |

### Frontend Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **Build Tool**: Vite
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library

### Server Stack

- **Runtime**: Node.js
- **Framework**: Express with TypeScript
- **API Style**: RESTful with SSE
- **Authentication**: Passport.js + Session
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI/Swagger

### Database Stack

- **Database**: PostgreSQL (self-hosted)
- **Connection**: node-postgres with connection pooling
- **Security**: SSL/TLS encryption
- **Events**: LISTEN/NOTIFY
- **Migrations**: Custom migration system
- **Testing**: Integration tests

---

## Key Risks and Mitigations

| Risk                                    | Mitigation                                        |
|----------------------------------------|--------------------------------------------------|
| Tight 2-day timeline                    | Focus on core features first, clear prioritization|
| SSE scalability                         | Implement proper connection pooling and event buffering |
| UI matching complexity                  | Use component-driven development with strict specs|
| Real-time performance at scale          | Implement efficient PostgreSQL querying and indexing |
| Passport.js integration complexity      | Start with basic auth flow, expand features later |
| Database connection reliability         | Implement robust SSH tunneling with auto-reconnect |

---

## Stakeholders and Teams

### Key Stakeholders

- **Project Lead**: Brett Davies
  Responsible for overall project direction, technical decisions, and delivery

### Development Team

| Role               | Name           | Responsibilities                        |
|--------------------|----------------|----------------------------------------|
| Full Stack Dev     | Brett Davies   | End-to-end implementation              |

### External Dependencies

- **Auth0**: Authentication provider
- **PostgreSQL**: Database hosting
- **Vercel**: Deployment and hosting

---

**Reminder**: This document is a living resource. Update it as the project evolves, particularly the scope, milestones, and team sections.
