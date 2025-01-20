export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: 'public' | 'private' | 'dm';
  createdBy: string;
  createdAt: string;
  archivedAt: string | null;
  archivedBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ChannelMember {
  id: string;
  channelId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
} 