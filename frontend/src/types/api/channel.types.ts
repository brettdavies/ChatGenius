import { ChannelType } from '../channel.types';

export interface ApiChannel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  created_at: string;
  updated_at: string;
  members: string[];
}

export interface CreateChannelRequest {
  name?: string;
  type: ChannelType;
  description?: string;
  member_ids: string[];
}

export interface UpdateChannelRequest {
  name?: string;
  description?: string;
  type?: ChannelType;
}

// API Message types
export interface ApiMessage {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  updatedAt?: string;
} 