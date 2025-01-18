import { OpenAPIV3 } from 'openapi-types';

export const ChannelResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['id', 'name', 'type', 'createdBy', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      format: 'ulid',
      description: 'Channel ID',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 80,
      description: 'Channel name',
      example: 'general'
    },
    description: {
      type: 'string',
      nullable: true,
      description: 'Channel description',
      example: 'General discussion channel'
    },
    type: {
      type: 'string',
      enum: ['public', 'private', 'dm'],
      description: 'Channel type',
      example: 'public'
    },
    createdBy: {
      type: 'string',
      format: 'ulid',
      description: 'User ID who created the channel',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Channel creation timestamp',
      example: '2024-02-15T08:30:00Z'
    },
    archivedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'When channel was archived',
      example: null
    },
    archivedBy: {
      type: 'string',
      format: 'ulid',
      nullable: true,
      description: 'User ID who archived the channel',
      example: null
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
      example: '2024-02-15T08:30:00Z'
    },
    deletedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'Deletion timestamp',
      example: null
    }
  }
};

export const ChannelMemberResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['id', 'channelId', 'userId', 'role', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'string',
      format: 'ulid',
      description: 'Membership ID',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    channelId: {
      type: 'string',
      format: 'ulid',
      description: 'Channel ID',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    userId: {
      type: 'string',
      format: 'ulid',
      description: 'User ID',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    role: {
      type: 'string',
      enum: ['owner', 'admin', 'member'],
      description: 'Member role in channel',
      example: 'member'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Membership creation timestamp',
      example: '2024-02-15T08:30:00Z'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
      example: '2024-02-15T08:30:00Z'
    },
    deletedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      description: 'Deletion timestamp',
      example: null
    }
  }
};

export const CreateChannelRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['name', 'type'],
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 80,
      description: 'Channel name',
      example: 'general'
    },
    description: {
      type: 'string',
      description: 'Channel description',
      example: 'General discussion channel'
    },
    type: {
      type: 'string',
      enum: ['public', 'private', 'dm'],
      description: 'Channel type',
      example: 'public'
    }
  }
};

export const UpdateChannelRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 80,
      description: 'New channel name',
      example: 'general-discussion'
    },
    description: {
      type: 'string',
      description: 'New channel description',
      example: 'Updated general discussion channel'
    }
  }
};

export const AddChannelMemberRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: {
      type: 'string',
      format: 'ulid',
      description: 'User ID to add to channel',
      example: '01HGW1J4ZNVN1WRMZ048MVQH2X'
    },
    role: {
      type: 'string',
      enum: ['admin', 'member'],
      description: 'Member role in channel',
      default: 'member',
      example: 'member'
    }
  }
};

export const UpdateChannelMemberRequest: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['role'],
  properties: {
    role: {
      type: 'string',
      enum: ['admin', 'member'],
      description: 'New member role',
      example: 'admin'
    }
  }
};

export const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['message', 'code'],
  properties: {
    message: {
      type: 'string',
      description: 'Error message',
      example: 'Channel not found'
    },
    code: {
      type: 'string',
      description: 'Error code',
      example: 'CHANNEL_NOT_FOUND',
      enum: [
        'CHANNEL_NOT_FOUND',
        'INVALID_NAME',
        'CREATE_FAILED',
        'UPDATE_FAILED',
        'ARCHIVE_FAILED',
        'DELETE_FAILED',
        'NOT_MEMBER',
        'ALREADY_MEMBER',
        'CANNOT_REMOVE_OWNER',
        'CANNOT_MODIFY_OWNER',
        'INSUFFICIENT_PERMISSIONS'
      ]
    }
  }
};

// Keep the channelSchemas object for reference and reuse
export const channelSchemas = {
  ChannelResponse,
  ChannelMemberResponse,
  CreateChannelRequest,
  UpdateChannelRequest,
  AddChannelMemberRequest,
  UpdateChannelMemberRequest,
  ErrorResponse
}; 