import { z } from 'zod';

// Channel type enum
export const ChannelType = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  DM: 'dm',
} as const;

export type ChannelType = typeof ChannelType[keyof typeof ChannelType];

// Utility function to get short ID from full ID
export const getShortId = (id: string): string => {
  return id.slice(-10);
};

// Base channel schema
export const channelSchema = z.object({
  id: z.string().length(26), // ULID length
  short_id: z.string().length(10),
  name: z.string().min(2).max(80),
  description: z.string().optional(),
  type: z.enum([ChannelType.PUBLIC, ChannelType.PRIVATE, ChannelType.DM]),
  creator_id: z.string().length(26),
  created_at: z.date(),
  updated_at: z.date(),
  archived_at: z.date().optional(),
  archived_by: z.string().length(26).optional(),
  deleted_at: z.date().optional(),
});

// Create channel request schema
export const createChannelSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  type: z.enum([ChannelType.PUBLIC, ChannelType.PRIVATE, ChannelType.DM]),
  description: z.string().optional(),
  members: z.array(z.string().length(26)).min(1),
}).refine(data => {
  // DM channels must have exactly 2 members
  if (data.type === ChannelType.DM) {
    return data.members.length === 2;
  }
  return true;
}, {
  message: "DM channels must have exactly 2 members"
});

// Channel response type
export type Channel = z.infer<typeof channelSchema>;

// Create channel request type
export type CreateChannelRequest = z.infer<typeof createChannelSchema>;

// Channel member role enum
export const ChannelMemberRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type ChannelMemberRole = typeof ChannelMemberRole[keyof typeof ChannelMemberRole];

// Channel member schema
export const channelMemberSchema = z.object({
  id: z.string().length(26),
  channel_id: z.string().length(26),
  user_id: z.string().length(26),
  role: z.enum([ChannelMemberRole.OWNER, ChannelMemberRole.ADMIN, ChannelMemberRole.MEMBER]),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional(),
});

export type ChannelMember = z.infer<typeof channelMemberSchema>;

// Error types
export type ChannelError = 
  | 'INVALID_NAME'
  | 'INVALID_TYPE'
  | 'INVALID_MEMBER_COUNT'
  | 'MEMBER_NOT_FOUND'
  | 'CHANNEL_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'ALREADY_ARCHIVED'; 