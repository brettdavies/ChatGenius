import { authPaths } from './paths/auth.js';
import { channelPaths } from './paths/channels.js';
import { eventPaths } from './paths/events.js';
import { messagePaths, messageSchemas } from './paths/messages.js';
import { ErrorResponse, ValidationError } from './schemas/common.js';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserResponse,
  UserProfileResponse,
  UpdateUserRequest,
  TOTPSetupResponse,
  TOTPVerifyRequest,
  TOTPValidateRequest,
  TOTPDisableRequest
} from './schemas/auth.js';
import {
  ChannelResponse,
  ChannelMemberResponse,
  CreateChannelRequest,
  UpdateChannelRequest,
  AddChannelMemberRequest,
  UpdateChannelMemberRequest
} from './schemas/channels.js';
import { health } from './paths/health.js';

const openApiConfig = {
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
      // Common schemas
      ErrorResponse,
      ValidationError,
      
      // Auth schemas
      LoginRequest,
      LoginResponse,
      RegisterRequest,
      RegisterResponse,
      UserResponse,
      UserProfileResponse,
      UpdateUserRequest,
      TOTPSetupResponse,
      TOTPVerifyRequest,
      TOTPValidateRequest,
      TOTPDisableRequest,
      
      // Channel schemas
      ChannelResponse,
      ChannelMemberResponse,
      CreateChannelRequest,
      UpdateChannelRequest,
      AddChannelMemberRequest,
      UpdateChannelMemberRequest,
      
      // Message schemas
      ...messageSchemas
    },
    securitySchemes: {
      session: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sessionId',
        description: 'Session cookie for authentication'
      }
    }
  },
  security: [],  // Default is no security, individual paths specify their requirements
  paths: {
    ...authPaths,
    ...channelPaths,
    ...eventPaths,
    ...messagePaths,
    '/api/health': health
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication endpoints'
    },
    {
      name: 'Two-Factor Authentication',
      description: '2FA setup and verification endpoints'
    },
    {
      name: 'Channels',
      description: 'Channel management endpoints'
    },
    {
      name: 'Messages',
      description: 'Message and thread management endpoints'
    },
    {
      name: 'Events',
      description: 'Real-time event endpoints'
    }
  ]
} as const;

export default openApiConfig; 