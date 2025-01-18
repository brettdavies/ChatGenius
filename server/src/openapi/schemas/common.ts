import { OpenAPIV3 } from 'openapi-types';

// Define all possible error codes
export const ErrorCodes = {
  // Channel errors
  CHANNEL_NOT_FOUND: 'CHANNEL_NOT_FOUND',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_CHANNEL_TYPE: 'INVALID_CHANNEL_TYPE',
  INVALID_CHANNEL_NAME: 'INVALID_CHANNEL_NAME',
  INVALID_CHANNEL_DESCRIPTION: 'INVALID_CHANNEL_DESCRIPTION',
  CREATE_FAILED: 'CREATE_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  ARCHIVE_FAILED: 'ARCHIVE_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  MEMBER_ADD_FAILED: 'MEMBER_ADD_FAILED',
  MEMBER_LIMIT_EXCEEDED: 'MEMBER_LIMIT_EXCEEDED',
  NOT_MEMBER: 'NOT_MEMBER',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',
  CANNOT_MODIFY_OWNER: 'CANNOT_MODIFY_OWNER',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Auth errors
  SESSION_INVALID: 'SESSION_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_ERROR: 'SESSION_ERROR',
  SESSION_CLEANUP_FAILED: 'SESSION_CLEANUP_FAILED',
  SESSION_STORE_ERROR: 'SESSION_STORE_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PROFILE_ERROR: 'PROFILE_ERROR',
  LOGOUT_ERROR: 'LOGOUT_ERROR',
  
  // TOTP errors
  TOTP_NOT_ENABLED: 'TOTP_NOT_ENABLED',
  TOTP_ALREADY_ENABLED: 'TOTP_ALREADY_ENABLED',
  TOTP_NOT_SETUP: 'TOTP_NOT_SETUP',
  TOTP_SETUP_ERROR: 'TOTP_SETUP_ERROR',
  TOTP_VERIFY_ERROR: 'TOTP_VERIFY_ERROR',
  TOTP_VALIDATE_ERROR: 'TOTP_VALIDATE_ERROR',
  INVALID_TOTP_TOKEN: 'INVALID_TOTP_TOKEN',
  TOKEN_NOT_VERIFIED: 'TOKEN_NOT_VERIFIED',
  TOTP_GENERATION_FAILED: 'TOTP_GENERATION_FAILED',
  TOTP_VALIDATION_FAILED: 'TOTP_VALIDATION_FAILED',
  INVALID_TOTP_INPUT: 'INVALID_TOTP_INPUT',
  BACKUP_CODE_GENERATION_FAILED: 'BACKUP_CODE_GENERATION_FAILED',
  INVALID_BACKUP_CODE_INPUT: 'INVALID_BACKUP_CODE_INPUT',
  
  // Message errors
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  INVALID_CONTENT: 'INVALID_CONTENT',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  PARENT_MESSAGE_NOT_FOUND: 'PARENT_MESSAGE_NOT_FOUND',
  INVALID_THREAD_DEPTH: 'INVALID_THREAD_DEPTH',
  NOT_MESSAGE_OWNER: 'NOT_MESSAGE_OWNER',
  THREAD_NOT_FOUND: 'THREAD_NOT_FOUND',
  INVALID_QUERY: 'INVALID_QUERY',
  INVALID_LIMIT: 'INVALID_LIMIT',
  INVALID_OFFSET: 'INVALID_OFFSET',
  INVALID_EMOJI: 'INVALID_EMOJI',
  REACTION_EXISTS: 'REACTION_EXISTS',
  REACTION_NOT_FOUND: 'REACTION_NOT_FOUND',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Event errors
  EVENT_SUBSCRIPTION_FAILED: 'EVENT_SUBSCRIPTION_FAILED',
  TYPING_START_FAILED: 'TYPING_START_FAILED',
  TYPING_STOP_FAILED: 'TYPING_STOP_FAILED',
  PRESENCE_UPDATE_FAILED: 'PRESENCE_UPDATE_FAILED',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  FETCH_ERROR: 'FETCH_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['message', 'code'],
  properties: {
    message: {
      type: 'string',
      description: 'Human-readable error message'
    },
    code: {
      type: 'string',
      enum: Object.values(ErrorCodes),
      description: 'Machine-readable error code'
    },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['message', 'code'],
        properties: {
          message: {
            type: 'string',
            description: 'Specific error message'
          },
          code: {
            type: 'string',
            enum: Object.values(ErrorCodes),
            description: 'Specific error code'
          },
          path: {
            type: 'string',
            description: 'Path to the field that caused the error'
          }
        }
      },
      description: 'Detailed validation errors when applicable'
    }
  },
  example: {
    message: 'Channel not found',
    code: ErrorCodes.CHANNEL_NOT_FOUND
  }
};

export const ValidationError: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['message', 'errors'],
  properties: {
    message: {
      type: 'string',
      description: 'Summary error message'
    },
    code: {
      type: 'string',
      enum: Object.values(ErrorCodes),
      description: 'Error code'
    },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['path', 'message'],
        properties: {
          path: {
            type: 'string',
            description: 'Path to the field that failed validation'
          },
          message: {
            type: 'string',
            description: 'Validation error message'
          },
          code: {
            type: 'string',
            enum: Object.values(ErrorCodes),
            description: 'Specific validation error code'
          }
        }
      },
      description: 'List of validation errors'
    }
  },
  example: {
    message: 'Validation failed',
    code: ErrorCodes.INVALID_REQUEST,
    errors: [
      {
        path: 'name',
        message: 'Channel name must be between 2 and 80 characters',
        code: ErrorCodes.INVALID_CHANNEL_NAME
      }
    ]
  }
}; 