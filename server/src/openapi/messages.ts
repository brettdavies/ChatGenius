import { OpenAPIV3 } from 'openapi-types';
import { ErrorResponse } from './common.js';

export const messagePaths: OpenAPIV3.PathsObject = {
  '/api/messages': {
    post: {
      summary: 'Create a new message',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['channelId', 'content'],
              properties: {
                channelId: { type: 'string', format: 'ulid' },
                content: { type: 'string', minLength: 1, maxLength: 4000 },
                threadId: { type: 'string', format: 'ulid' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Message created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Message' }
            }
          }
        },
        '400': {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '403': {
          description: 'Not authorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded (30 messages per minute)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/api/messages/{messageId}': {
    get: {
      summary: 'Get a message by ID',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'messageId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Message found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' }
            }
          }
        },
        '404': {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    put: {
      summary: 'Update a message',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'messageId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'ulid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['content'],
              properties: {
                content: { type: 'string', minLength: 1, maxLength: 4000 }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Message updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Message' }
            }
          }
        },
        '400': {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '403': {
          description: 'Not message owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '404': {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded (30 updates per minute)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Delete a message',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'messageId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'ulid' }
        }
      ],
      responses: {
        '204': {
          description: 'Message deleted successfully'
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '403': {
          description: 'Not message owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '404': {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded (20 deletes per minute)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/api/messages/channel/{channelId}': {
    get: {
      summary: 'Get messages in a channel',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'channelId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50
          }
        },
        {
          name: 'before',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date-time'
          }
        },
        {
          name: 'after',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date-time'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Messages retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages', 'total'],
                properties: {
                  messages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MessageResponse' }
                  },
                  total: {
                    type: 'integer',
                    description: 'Total number of messages in the channel'
                  }
                }
              }
            }
          }
        },
        '403': {
          description: 'Not authorized to view this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/api/messages/thread/{threadId}': {
    get: {
      summary: 'Get messages in a thread',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'threadId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50
          }
        },
        {
          name: 'before',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date-time'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Thread messages retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages', 'total'],
                properties: {
                  messages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MessageResponse' }
                  },
                  total: {
                    type: 'integer',
                    description: 'Total number of messages in the thread'
                  }
                }
              }
            }
          }
        },
        '404': {
          description: 'Thread not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/api/messages/search': {
    get: {
      summary: 'Search messages',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'query',
          in: 'query',
          required: true,
          schema: { type: 'string', minLength: 1 }
        },
        {
          name: 'channelIds',
          in: 'query',
          schema: { type: 'string' }
        },
        {
          name: 'userId',
          in: 'query',
          schema: { type: 'string' }
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'string', pattern: '^[0-9]+$' }
        },
        {
          name: 'offset',
          in: 'query',
          schema: { type: 'string', pattern: '^[0-9]+$' }
        }
      ],
      responses: {
        '200': {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Message' }
                  },
                  total: { type: 'number' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded (30 searches per minute)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/api/messages/{messageId}/reactions': {
    post: {
      summary: 'Add a reaction to a message',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'messageId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'ulid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['emoji'],
              properties: {
                emoji: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 32,
                  pattern: '^[\u{1F300}-\u{1F9FF}]$'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Reaction added successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Reaction' }
            }
          }
        },
        '400': {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '404': {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '409': {
          description: 'Reaction already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded (60 reactions per minute)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Remove a reaction from a message',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'messageId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'ulid' }
        },
        {
          name: 'emoji',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            minLength: 1,
            maxLength: 32,
            pattern: '^[\u{1F300}-\u{1F9FF}]$'
          }
        }
      ],
      responses: {
        '204': {
          description: 'Reaction removed successfully'
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '404': {
          description: 'Message or reaction not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded (60 reactions per minute)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/api/messages/{messageId}/reactions/{emoji}': {
    delete: {
      summary: 'Remove a reaction from a message',
      tags: ['Messages'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'messageId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'ulid'
          }
        },
        {
          name: 'emoji',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '204': {
          description: 'Reaction removed successfully'
        },
        '404': {
          description: 'Message or reaction not found',
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

export const messageSchemas = {
  MessageResponse: {
    type: 'object',
    required: ['id', 'channelId', 'userId', 'content', 'edited', 'createdAt', 'updatedAt'],
    properties: {
      id: {
        type: 'string',
        format: 'ulid',
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      channelId: {
        type: 'string',
        format: 'ulid',
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      userId: {
        type: 'string',
        format: 'ulid',
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      content: {
        type: 'string',
        example: 'Hello everyone! 👋'
      },
      threadId: {
        type: 'string',
        format: 'ulid',
        nullable: true,
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      edited: {
        type: 'boolean',
        example: false
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time'
      },
      deletedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true
      }
    }
  } as OpenAPIV3.SchemaObject,
  ReactionResponse: {
    type: 'object',
    required: ['id', 'messageId', 'userId', 'emoji', 'createdAt'],
    properties: {
      id: {
        type: 'string',
        format: 'ulid',
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      messageId: {
        type: 'string',
        format: 'ulid',
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      userId: {
        type: 'string',
        format: 'ulid',
        example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
      },
      emoji: {
        type: 'string',
        example: '👍'
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  } as OpenAPIV3.SchemaObject
}; 