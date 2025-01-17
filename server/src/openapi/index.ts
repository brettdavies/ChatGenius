import { OpenAPIV3 } from 'openapi-types';
import { authPaths } from './paths/auth';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserResponse,
  UserProfileResponse,
  UpdateUserRequest
} from './schemas/auth';

const openApiConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'ChatGenius API',
    version: '1.0.0',
    description: 'API documentation for ChatGenius'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  components: {
    schemas: {
      LoginRequest,
      LoginResponse,
      RegisterRequest,
      RegisterResponse,
      UserResponse,
      UserProfileResponse,
      UpdateUserRequest
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    ...authPaths
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication endpoints'
    }
  ]
};

// Convert to JSON and back to ensure it's a plain object
const serializedConfig = JSON.stringify(openApiConfig);
const plainConfig = JSON.parse(serializedConfig);

export default plainConfig; 