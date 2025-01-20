import { OpenAPIV3 } from 'openapi-types';

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
                required: ['type', 'channelId', 'userId', 'timestamp'],
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
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        403: {
          description: 'Not authorized to access this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
        200: {
          description: 'Typing indicator started',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Typing indicator started'
                  },
                  code: {
                    type: 'string',
                    example: 'TYPING_STARTED'
                  },
                  errors: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ErrorResponse' }
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
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        403: {
          description: 'Not authorized to access this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
        200: {
          description: 'Typing indicator stopped',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Typing indicator stopped'
                  },
                  code: {
                    type: 'string',
                    example: 'TYPING_STOPPED'
                  },
                  errors: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ErrorResponse' }
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
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        403: {
          description: 'Not authorized to access this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
                  type: 'boolean',
                  description: 'Whether the user is online in the channel'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Presence status updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Presence status updated'
                  },
                  code: {
                    type: 'string',
                    example: 'PRESENCE_UPDATED'
                  },
                  errors: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ErrorResponse' }
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
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        403: {
          description: 'Not authorized to access this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        429: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  }
}; 