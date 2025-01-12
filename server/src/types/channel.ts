export interface Channel {
  id: string;
  name: string;
  owner_id: string;
  is_private: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChannelData {
  name: string;
  is_private?: boolean;
  ownerId: string;
}

export interface UpdateChannelData {
  name?: string;
  is_private?: boolean;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: Date;
  updated_at: Date;
} 