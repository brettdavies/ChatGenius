import { OpenAPIV3 } from 'openapi-types';

export const messagePaths: OpenAPIV3.PathsObject = {
  '/api/messages': {
    post: {
      summary: 'Create a new message',
      tags: ['Messages'],
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
        '201': {
          description: 'Message created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
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
          description: 'Not authorized to post in this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '404': {
          description: 'Parent message not found',
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
      summary: 'Get a message by ID',
      tags: ['Messages'],
      security: [{ session: [] }],
      responses: {
        '200': {
          description: 'Message found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' }
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
          description: 'Not authorized to view this message',
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
        }
      }
    },
    put: {
      summary: 'Update a message',
      tags: ['Messages'],
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
                  description: 'New message content'
                }
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
              schema: { $ref: '#/components/schemas/MessageResponse' }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
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
          description: 'Not authorized to edit this message',
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
        }
      }
    },
    delete: {
      summary: 'Delete a message',
      tags: ['Messages'],
      security: [{ session: [] }],
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
          description: 'Not authorized to delete this message',
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
      }
    ],
    get: {
      summary: 'Get messages in a channel',
      tags: ['Messages'],
      security: [{ session: [] }],
      parameters: [
        {
          name: 'before',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date-time',
            description: 'Get messages before this timestamp'
          }
        },
        {
          name: 'after',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date-time',
            description: 'Get messages after this timestamp'
          }
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50,
            description: 'Maximum number of messages to return'
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
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/MessageResponse'
                    }
                  }
                }
              }
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
          description: 'Not authorized to view this channel',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '404': {
          description: 'Channel not found',
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
      summary: 'Get messages in a thread',
      tags: ['Messages'],
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
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        '403': {
          description: 'Not authorized to view this thread',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
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
        '200': {
          description: 'Search results retrieved successfully',
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
                    description: 'Total number of messages matching the search'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid search parameters',
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
          description: 'Not authorized to search in specified channels',
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
      summary: 'Add a reaction to a message',
      tags: ['Messages'],
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
                  description: 'The emoji reaction to add',
                  minLength: 1,
                  maxLength: 8
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
              schema: {
                type: 'object',
                required: ['message', 'data'],
                properties: {
                  message: { 
                    type: 'string',
                    example: 'Reaction added successfully'
                  },
                  data: {
                    type: 'object',
                    required: ['messageId', 'userId', 'emoji'],
                    properties: {
                      messageId: {
                        type: 'string',
                        format: 'ulid'
                      },
                      userId: {
                        type: 'string',
                        format: 'ulid'
                      },
                      emoji: {
                        type: 'string',
                        description: 'The emoji that was added'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
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
      summary: 'Remove a reaction from a message',
      tags: ['Messages'],
      security: [{ session: [] }],
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