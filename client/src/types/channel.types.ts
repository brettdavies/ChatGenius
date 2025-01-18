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