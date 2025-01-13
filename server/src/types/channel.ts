import { z } from 'zod';
import { LENGTH_LIMITS, REGEX_PATTERNS, VALIDATION_RULES } from '@/constants';

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DM = 'dm'
}

export enum ChannelMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export const channelMemberSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  channel_id: z.string(),
  role: z.nativeEnum(ChannelMemberRole),
  joined_at: z.date()
});

export const channelSchema = z.object({
  id: z.string(),
  short_id: z.string(),
  name: z.string()
    .min(LENGTH_LIMITS.CHANNEL_NAME.MIN, VALIDATION_RULES.CHANNEL_NAME.MESSAGE)
    .max(LENGTH_LIMITS.CHANNEL_NAME.MAX, VALIDATION_RULES.CHANNEL_NAME.MESSAGE)
    .regex(REGEX_PATTERNS.CHANNEL_NAME, VALIDATION_RULES.CHANNEL_NAME.MESSAGE),
  description: z.string().max(LENGTH_LIMITS.BIO.MAX).optional(),
  type: z.nativeEnum(ChannelType),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  archived_at: z.date().optional(),
  archived_by: z.string().optional(),
  deleted_at: z.date().optional(),
  members: z.array(channelMemberSchema).optional()
});

export const createChannelSchema = channelSchema.pick({
  name: true,
  description: true,
  type: true
}).extend({
  members: z.array(z.string()).min(1).superRefine((members, ctx) => {
    const type = ctx.path[0] === 'type' ? ctx.path[1] : undefined;
    if (type === ChannelType.DM && members.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DM channels must have exactly 2 members'
      });
    }
  })
});

export type Channel = z.infer<typeof channelSchema>;
export type ChannelMember = z.infer<typeof channelMemberSchema>;
export type CreateChannelRequest = z.infer<typeof createChannelSchema>;

export class ChannelNotFoundError extends Error {
  constructor(message = 'Channel not found') {
    super(message);
    this.name = 'ChannelNotFoundError';
  }
}

export class ChannelAccessError extends Error {
  constructor(message = 'You do not have access to this channel') {
    super(message);
    this.name = 'ChannelAccessError';
  }
}

export class ChannelValidationError extends Error {
  constructor(message = 'Invalid channel data') {
    super(message);
    this.name = 'ChannelValidationError';
  }
} 