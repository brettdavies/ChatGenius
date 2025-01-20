import { OpenAPIV3 } from 'openapi-types';

export const channelPaths: OpenAPIV3.PathsObject = {
  '/api/channels/my': {
    get: {
      tags: ['Channels'],
      summary: 'Get user\'s channels',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'User channels retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channels retrieved successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNELS_RETRIEVED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      channels: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ChannelResponse' }
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

  '/api/channels': {
    post: {
      tags: ['Channels'],
      summary: 'Create a new channel',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateChannelRequest' }
          }
        }
      },
      responses: {
        201: {
          description: 'Channel created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channel created successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_CREATED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      channel: { $ref: '#/components/schemas/ChannelResponse' }
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
    get: {
      tags: ['Channels'],
      summary: 'Search channels',
      security: [{ session: [] }],
      parameters: [
        {
          name: 'name',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Channel name to search for'
        },
        {
          name: 'type',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['public', 'private', 'dm']
          },
          description: 'Channel type to filter by'
        },
        {
          name: 'userId',
          in: 'query',
          schema: {
            type: 'string',
            format: 'ulid'
          },
          description: 'Filter by channels the user is a member of'
        },
        {
          name: 'includeArchived',
          in: 'query',
          schema: {
            type: 'boolean',
            default: false
          },
          description: 'Include archived channels in results'
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
          description: 'Channels retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channels retrieved successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNELS_RETRIEVED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      channels: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ChannelResponse' }
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

  '/api/channels/{channelId}': {
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
      tags: ['Channels'],
      summary: 'Get channel by ID',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Channel retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channel retrieved successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_RETRIEVED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      channel: { $ref: '#/components/schemas/ChannelResponse' }
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
    },
    put: {
      tags: ['Channels'],
      summary: 'Update channel',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateChannelRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Channel updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channel updated successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_UPDATED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      channel: { $ref: '#/components/schemas/ChannelResponse' }
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
    },
    delete: {
      tags: ['Channels'],
      summary: 'Delete channel',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Channel deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channel deleted successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_DELETED'
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

  '/api/channels/{channelId}/archive': {
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
    post: {
      tags: ['Channels'],
      summary: 'Archive channel',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Channel archived successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channel archived successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_ARCHIVED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      channel: { $ref: '#/components/schemas/ChannelResponse' }
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

  '/api/channels/{channelId}/members': {
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
      tags: ['Channels'],
      summary: 'Get channel members',
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
          description: 'Channel members retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Channel members retrieved successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_MEMBERS_RETRIEVED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      members: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ChannelMemberResponse' }
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
    },
    post: {
      tags: ['Channels'],
      summary: 'Add channel member',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId'],
              properties: {
                userId: {
                  type: 'string',
                  format: 'ulid'
                },
                role: {
                  type: 'string',
                  enum: ['admin', 'member'],
                  default: 'member'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Member added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Member added successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_MEMBER_ADDED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      member: { $ref: '#/components/schemas/ChannelMemberResponse' }
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
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        409: {
          description: 'User is already a member',
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

  '/api/channels/{channelId}/members/{userId}': {
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
        name: 'userId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'ulid'
        }
      }
    ],
    put: {
      tags: ['Channels'],
      summary: 'Update channel member',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateChannelMemberRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Member updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code', 'data'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Member updated successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_MEMBER_UPDATED'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      member: { $ref: '#/components/schemas/ChannelMemberResponse' }
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
          description: 'Channel or member not found',
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
      tags: ['Channels'],
      summary: 'Remove channel member',
      security: [{ session: [] }],
      responses: {
        200: {
          description: 'Member removed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'code'],
                properties: {
                  message: {
                    type: 'string',
                    example: 'Member removed successfully'
                  },
                  code: {
                    type: 'string',
                    example: 'CHANNEL_MEMBER_REMOVED'
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
          description: 'Channel or member not found',
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
} as const; 