import { OpenAPIV3 } from 'openapi-types';

export const messagePaths: OpenAPIV3.PathsObject = {
  '/api/messages': {
    post: {
      tags: ['Messages'],
      summary: 'Create a new message',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['channelId', 'content'],
              properties: {
                channelId: {
                  type: 'string',
                  format: 'ulid',
                  description: 'ID of the channel to post the message in'
                },
                content: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 4000,
                  description: 'Message content'
                },
                threadId: {
                  type: 'string',
                  format: 'ulid',
                  description: 'ID of the parent message if this is a thread reply'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Message created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      message: { $ref: '#/components/schemas/MessageResponse' }
                    }
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
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Channel or thread not found',
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

  '/api/messages/{messageId}': {
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
    get: {
      tags: ['Messages'],
      summary: 'Get message by ID',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Message retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      message: { $ref: '#/components/schemas/MessageResponse' }
                    }
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
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Message not found',
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
    },
    put: {
      tags: ['Messages'],
      summary: 'Update message',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['content'],
              properties: {
                content: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 4000,
                  description: 'Updated message content'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Message updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      message: { $ref: '#/components/schemas/MessageResponse' }
                    }
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
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Message not found',
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
    },
    delete: {
      tags: ['Messages'],
      summary: 'Delete message',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Message deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: { type: 'object' },
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
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Message not found',
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

  '/api/messages/channel/{channelId}': {
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
          format: 'date-time',
          description: 'Get messages created before this timestamp'
        }
      },
      {
        name: 'after',
        in: 'query',
        schema: {
          type: 'string',
          format: 'date-time',
          description: 'Get messages created after this timestamp'
        }
      }
    ],
    get: {
      tags: ['Messages'],
      summary: 'Get messages in a channel',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Messages retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      messages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MessageResponse' }
                      },
                      total: { type: 'integer' }
                    }
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
          description: 'Insufficient permissions',
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

  '/api/messages/thread/{threadId}': {
    parameters: [
      {
        name: 'threadId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'ulid'
        }
      }
    ],
    get: {
      tags: ['Messages'],
      summary: 'Get messages in a thread',
      security: [{ session: [] }],
      parameters: [
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
        200: {
          description: 'Thread messages retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      messages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MessageResponse' }
                      },
                      total: { type: 'integer' }
                    }
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
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Thread not found',
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

  '/api/messages/search': {
    get: {
      tags: ['Messages'],
      summary: 'Search messages',
      security: [{ session: [] }],
      parameters: [
        {
          name: 'query',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            minLength: 1
          }
        },
        {
          name: 'channelIds',
          in: 'query',
          schema: {
            type: 'string',
            description: 'Comma-separated list of channel IDs'
          }
        },
        {
          name: 'userId',
          in: 'query',
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
          name: 'offset',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0
          }
        }
      ],
      responses: {
        200: {
          description: 'Search results retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      messages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MessageResponse' }
                      },
                      total: { type: 'integer' }
                    }
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
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
          description: 'Insufficient permissions',
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

  '/api/messages/{messageId}/reactions': {
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
    post: {
      tags: ['Messages'],
      summary: 'Add reaction to message',
      security: [{ session: [] }],
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
                  maxLength: 2,
                  description: 'Single emoji character'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Reaction added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      reaction: { $ref: '#/components/schemas/ReactionResponse' }
                    }
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
        400: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
        404: {
          description: 'Message not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        409: {
          description: 'Reaction already exists',
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

  '/api/messages/{messageId}/reactions/{emoji}': {
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
        },
        description: 'The emoji reaction to remove'
      }
    ],
    delete: {
      tags: ['Messages'],
      summary: 'Remove reaction from message',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Reaction removed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                  data: { type: 'object' },
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
        404: {
          description: 'Message or reaction not found',
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

export const messageSchemas: Record<string, OpenAPIV3.SchemaObject> = {
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
  },
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
        minLength: 1,
        maxLength: 2,
        description: 'Single emoji character',
        example: '👍'
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  }
}; 