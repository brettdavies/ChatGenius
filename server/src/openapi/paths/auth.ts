import { OpenAPIV3 } from 'openapi-types';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  UserProfileResponse 
} from '../schemas/auth';

const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'string',
      description: 'Error message'
    }
  }
};

export const authPaths: OpenAPIV3.PathsObject = {
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user with email and password',
      security: [],
      operationId: 'login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LoginRequest
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: LoginResponse
            }
          }
        },
        '401': {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  },
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'User registration',
      description: 'Register a new user account',
      security: [],
      operationId: 'register',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: RegisterRequest
          }
        }
      },
      responses: {
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: RegisterResponse
            }
          }
        },
        '400': {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        '409': {
          description: 'Email or username already taken',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  },
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get user profile',
      description: 'Get user profile by user ID',
      security: [],
      operationId: 'getProfile',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            pattern: '^[0-9A-Z]{26}$',
            description: 'User ID in ULID format'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: UserProfileResponse
            }
          }
        },
        '400': {
          description: 'User ID is required',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  }
}; 