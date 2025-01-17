import { OpenAPIV3 } from 'openapi-types';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  UserProfileResponse,
  UpdateUserRequest
} from '../schemas/auth';

const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['message', 'code'],
  properties: {
    message: {
      type: 'string',
      description: 'Error message'
    },
    code: {
      type: 'string',
      description: 'Error code'
    }
  }
};

export const authPaths: OpenAPIV3.PathsObject = {
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
          description: 'Invalid request data or email taken',
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
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get user profile',
      description: 'Get current user profile',
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
          description: 'Invalid request',
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
    },
    put: {
      tags: ['Authentication'],
      summary: 'Update user profile',
      description: 'Update current user profile',
      operationId: 'updateProfile',
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: UpdateUserRequest
          }
        }
      },
      responses: {
        '200': {
          description: 'User profile updated successfully',
          content: {
            'application/json': {
              schema: UserProfileResponse
            }
          }
        },
        '400': {
          description: 'Invalid request data or email taken',
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
    },
    delete: {
      tags: ['Authentication'],
      summary: 'Delete user account',
      description: 'Soft delete current user account',
      operationId: 'deleteAccount',
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
        '204': {
          description: 'User account deleted successfully'
        },
        '400': {
          description: 'Invalid request',
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
  },
  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'User logout',
      description: 'End current user session',
      operationId: 'logout',
      responses: {
        '204': {
          description: 'Logout successful'
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