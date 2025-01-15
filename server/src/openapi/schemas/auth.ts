import { OpenAPIV3 } from 'openapi-types';

// Request schemas
export const LoginRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'Email address used for login',
      example: 'user@example.com'
    },
    password: {
      type: 'string',
      format: 'password',
      minLength: 8,
      example: 'password123'
    }
  }
};

export const RegisterRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      description: 'Display name for the user (does not need to be unique)',
      example: 'johndoe'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Unique email address used for login',
      example: 'user@example.com'
    },
    password: {
      type: 'string',
      format: 'password',
      minLength: 8,
      example: 'password123'
    }
  }
};

// Response schemas
export const UserResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9A-Z]{26}$',
      description: 'Unique identifier for the user (ULID format)'
    },
    username: {
      type: 'string',
      description: 'Display name for the user'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address'
    },
    role: {
      type: 'string',
      enum: ['user', 'admin'],
      description: 'User role'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the user was created'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the user was last updated'
    }
  }
};

export const UserProfileResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['user'],
  properties: {
    user: {
      $ref: '#/components/schemas/UserResponse'
    }
  }
};

export const LoginResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['user'],
  properties: {
    user: {
      $ref: '#/components/schemas/UserResponse'
    }
  }
};

export const RegisterResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['user'],
  properties: {
    user: {
      $ref: '#/components/schemas/UserResponse'
    }
  }
}; 