export enum ChannelType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  DM = 'DM'
}

export interface ChannelMember {
  id: string;
  userId: string;
  channelId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Channel {
  id: string;
  shortId: string;
  name: string;
  type: ChannelType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members: ChannelMember[];
  unread_count?: number;
}

export interface CreateChannelRequest {
  name: string;
  type: ChannelType;
  description?: string;
  memberIds?: string[];
}

export interface UpdateChannelRequest {
  name?: string;
  description?: string;
  type?: ChannelType;
} 