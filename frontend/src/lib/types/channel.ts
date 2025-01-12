export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  archivedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreateChannelData {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateChannelData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface ArchiveChannelData {
  archived: boolean;
}

export type ChannelResponse = {
  data: Channel;
  error?: never;
} | {
  data?: never;
  error: string;
}

export type ChannelsResponse = {
  data: Channel[];
  error?: never;
} | {
  data?: never;
  error: string;
} 