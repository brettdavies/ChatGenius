# Authentication API Documentation

## Overview

The authentication system uses email/password for initial authentication and user ID for subsequent operations. This design provides a balance between user-friendly authentication and secure internal identification.

## Authentication Flow

1. User registers or logs in with email/password
2. System returns user data including the user ID
3. Client stores user ID for subsequent requests
4. All internal operations use user ID for identification

## Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### POST /api/auth/login

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### GET /api/auth/me

Get user profile by user ID.

**Query Parameters:**
- `userId`: User ID (ULID format)

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Error message"
}
```

## Implementation Notes

1. User IDs are in ULID format (26 characters, sortable, unique)
2. Email is only used for authentication, not for internal operations
3. All timestamps are in ISO 8601 format
4. Passwords must be at least 8 characters long 