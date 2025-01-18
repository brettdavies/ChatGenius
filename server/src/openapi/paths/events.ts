import { OpenAPIV3 } from 'openapi-types';
import { ErrorResponse } from '../schemas/common.ts';

export const eventPaths: OpenAPIV3.PathsObject = {
  '/api/events/channels/{channelId}/events': {
    get: {
      tags: ['Events'],
      summary: 'Subscribe to channel events',
      description: 'Creates an SSE connection to receive real-time channel events',
      security: [{ session: [] }],
      parameters: [
        {
          name: 'channelId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        }
      ],
      responses: {
        200: {
          description: 'SSE connection established',
          content: {
            'text/event-stream': {
              schema: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: [
                      'channel.created',
                      'channel.updated',
                      'channel.archived',
                      'channel.deleted',
                      'channel.member_joined',
                      'channel.member_left',
                      'channel.member_updated',
                      'channel.typing_started',
                      'channel.typing_stopped',
                      'channel.presence_changed'
                    ]
                  },
                  channelId: {
                    type: 'string',
                    format: 'ulid'
                  },
                  userId: {
                    type: 'string',
                    format: 'ulid'
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time'
                  },
                  data: {
                    type: 'object',
                    nullable: true
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        403: {
          description: 'Not authorized to access this channel',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  },
  '/api/events/channels/{channelId}/typing/start': {
    post: {
      tags: ['Events'],
      summary: 'Start typing indicator',
      security: [{ session: [] }],
      parameters: [
        {
          name: 'channelId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        }
      ],
      responses: {
        204: {
          description: 'Typing indicator started'
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  },
  '/api/events/channels/{channelId}/typing/stop': {
    post: {
      tags: ['Events'],
      summary: 'Stop typing indicator',
      security: [{ session: [] }],
      parameters: [
        {
          name: 'channelId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        }
      ],
      responses: {
        204: {
          description: 'Typing indicator stopped'
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  },
  '/api/events/channels/{channelId}/presence': {
    post: {
      tags: ['Events'],
      summary: 'Update presence status',
      security: [{ session: [] }],
      parameters: [
        {
          name: 'channelId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['isOnline'],
              properties: {
                isOnline: {
                  type: 'boolean'
                }
              }
            }
          }
        }
      },
      responses: {
        204: {
          description: 'Presence status updated'
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        429: {
          description: 'Too many requests',
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