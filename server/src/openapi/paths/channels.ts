import { OpenAPIV3 } from 'openapi-types';
import {
  ChannelResponse,
  ChannelMemberResponse,
  CreateChannelRequest,
  UpdateChannelRequest,
  AddChannelMemberRequest,
  UpdateChannelMemberRequest,
  ErrorResponse
} from '../schemas/channels.js';

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
                properties: {
                  channels: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ChannelResponse'
                    }
                  },
                  total: {
                    type: 'number'
                  },
                  message: {
                    type: 'string'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
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
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
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
            schema: CreateChannelRequest
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
                properties: {
                  channel: {
                    $ref: '#/components/schemas/ChannelResponse'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: ErrorResponse
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
        429: {
          description: 'Too many requests. Please try again later.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Too many channel creation attempts. Please try again later.'
                  },
                  code: {
                    type: 'string',
                    example: 'RATE_LIMIT_EXCEEDED'
                  }
                }
              }
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
            type: 'string',
            description: 'Channel name to search for'
          }
        },
        {
          name: 'type',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['public', 'private', 'dm'],
            description: 'Channel type to filter by'
          }
        },
        {
          name: 'userId',
          in: 'query',
          schema: {
            type: 'string',
            format: 'ulid',
            description: 'Filter by channels where user is a member'
          }
        },
        {
          name: 'includeArchived',
          in: 'query',
          schema: {
            type: 'boolean',
            description: 'Whether to include archived channels',
            default: false
          }
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Number of channels to return'
          }
        },
        {
          name: 'offset',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0,
            description: 'Number of channels to skip'
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
                properties: {
                  channels: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ChannelResponse'
                    }
                  },
                  total: {
                    type: 'integer',
                    description: 'Total number of channels matching the query'
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
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
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
                properties: {
                  channel: {
                    $ref: '#/components/schemas/ChannelResponse'
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
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
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
            schema: UpdateChannelRequest
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
                properties: {
                  channel: {
                    $ref: '#/components/schemas/ChannelResponse'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: ErrorResponse
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
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
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
        204: {
          description: 'Channel deleted successfully'
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        },
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
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
                properties: {
                  channel: {
                    $ref: '#/components/schemas/ChannelResponse'
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
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
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
      tags: ['Channel Members'],
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
            default: 10,
            description: 'Number of members to return'
          }
        },
        {
          name: 'offset',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0,
            description: 'Number of members to skip'
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
                properties: {
                  members: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/ChannelMemberResponse'
                    }
                  },
                  total: {
                    type: 'integer',
                    description: 'Total number of members'
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
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    },
    post: {
      tags: ['Channel Members'],
      summary: 'Add channel member',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: AddChannelMemberRequest
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
                properties: {
                  member: {
                    $ref: '#/components/schemas/ChannelMemberResponse'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request data or user already a member',
          content: {
            'application/json': {
              schema: ErrorResponse
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
        404: {
          description: 'Channel not found',
          content: {
            'application/json': {
              schema: ErrorResponse
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
      tags: ['Channel Members'],
      summary: 'Update channel member',
      security: [{ session: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: UpdateChannelMemberRequest
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
                properties: {
                  member: {
                    $ref: '#/components/schemas/ChannelMemberResponse'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request data or insufficient permissions',
          content: {
            'application/json': {
              schema: ErrorResponse
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
        404: {
          description: 'Channel or member not found',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    },
    delete: {
      tags: ['Channel Members'],
      summary: 'Remove channel member',
      security: [{ session: [] }],
      responses: {
        204: {
          description: 'Member removed successfully'
        },
        400: {
          description: 'Cannot remove owner or insufficient permissions',
          content: {
            'application/json': {
              schema: ErrorResponse
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
        404: {
          description: 'Channel or member not found',
          content: {
            'application/json': {
              schema: ErrorResponse
            }
          }
        }
      }
    }
  }
} as const; 