import { pool } from '@config/database.js';
import { ulid } from 'ulid';

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: 'public' | 'private' | 'dm';
  createdBy: string;
  createdAt: Date;
  archivedAt: Date | null;
  archivedBy: string | null;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ChannelDB {
  id: string;
  name: string;
  description: string | null;
  type: 'public' | 'private' | 'dm';
  created_by: string;
  created_at: Date;
  archived_at: Date | null;
  archived_by: string | null;
  updated_at: Date;
  deleted_at: Date | null;
}

export function toChannel(dbChannel: ChannelDB): Channel {
  return {
    id: dbChannel.id,
    name: dbChannel.name,
    description: dbChannel.description,
    type: dbChannel.type,
    createdBy: dbChannel.created_by,
    createdAt: dbChannel.created_at,
    archivedAt: dbChannel.archived_at,
    archivedBy: dbChannel.archived_by,
    updatedAt: dbChannel.updated_at,
    deletedAt: dbChannel.deleted_at
  };
}

export async function createChannel(
  data: {
    name: string;
    description?: string;
    type: 'public' | 'private' | 'dm';
    createdBy: string;
  }
): Promise<Channel> {
  const id = ulid();
  const result = await pool.query<ChannelDB>(
    `INSERT INTO channels (id, name, description, type, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, data.name, data.description || null, data.type, data.createdBy]
  );

  return toChannel(result.rows[0]);
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const result = await pool.query<ChannelDB>(
    `SELECT * FROM channels 
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  return result.rows[0] ? toChannel(result.rows[0]) : null;
}

export async function updateChannel(
  id: string,
  updates: Partial<Pick<Channel, 'name' | 'description'>>
): Promise<Channel | null> {
  const fields = Object.keys(updates);
  if (fields.length === 0) return null;

  const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
  const values = fields.map(field => updates[field as keyof typeof updates]);

  const result = await pool.query<ChannelDB>(
    `UPDATE channels 
     SET ${setClause} 
     WHERE id = $1 AND deleted_at IS NULL AND archived_at IS NULL
     RETURNING *`,
    [id, ...values]
  );

  return result.rows[0] ? toChannel(result.rows[0]) : null;
}

export async function archiveChannel(id: string, archivedBy: string): Promise<Channel | null> {
  const result = await pool.query<ChannelDB>(
    `UPDATE channels 
     SET archived_at = CURRENT_TIMESTAMP, archived_by = $2
     WHERE id = $1 AND deleted_at IS NULL AND archived_at IS NULL
     RETURNING *`,
    [id, archivedBy]
  );

  return result.rows[0] ? toChannel(result.rows[0]) : null;
}

export async function softDeleteChannel(id: string): Promise<boolean> {
  const result = await pool.query<ChannelDB>(
    `UPDATE channels 
     SET deleted_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  );
  
  return (result.rowCount ?? 0) > 0;
}

export interface ChannelSearchParams {
  name?: string;
  type?: 'public' | 'private' | 'dm';
  userId?: string;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchChannels(
  params: ChannelSearchParams
): Promise<{ channels: Channel[]; total: number }> {
  const conditions: string[] = ['deleted_at IS NULL'];
  const values: (string | number | boolean)[] = [];
  let paramCount = 0;

  if (params.name) {
    paramCount++;
    conditions.push(`name ILIKE $${paramCount}`);
    values.push(`%${params.name}%`);
  }

  if (params.type) {
    paramCount++;
    conditions.push(`type = $${paramCount}`);
    values.push(params.type);
  }

  if (!params.includeArchived) {
    conditions.push('archived_at IS NULL');
  }

  // If userId is provided, only return channels where the user is a member
  if (params.userId) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM channel_members 
        WHERE channel_members.channel_id = channels.id 
        AND channel_members.user_id = $${++paramCount}
        AND channel_members.deleted_at IS NULL
      )`);
    values.push(params.userId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM channels ${whereClause}`,
    values
  );
  
  // Get paginated results
  const limit = params.limit || 10;
  const offset = params.offset || 0;
  
  const result = await pool.query<ChannelDB>(
    `SELECT * FROM channels 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT $${paramCount + 1} 
     OFFSET $${paramCount + 2}`,
    [...values, limit, offset]
  );

  return {
    channels: result.rows.map(toChannel),
    total: parseInt(countResult.rows[0].total)
  };
}

export interface ChannelMember {
  id: string;
  channelId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface ChannelMemberDB {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

function toChannelMember(dbMember: ChannelMemberDB): ChannelMember {
  return {
    id: dbMember.id,
    channelId: dbMember.channel_id,
    userId: dbMember.user_id,
    role: dbMember.role,
    createdAt: dbMember.created_at,
    updatedAt: dbMember.updated_at,
    deletedAt: dbMember.deleted_at
  };
}

export async function addChannelMember(
  channelId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<ChannelMember> {
  const id = ulid();
  const result = await pool.query<ChannelMemberDB>(
    `INSERT INTO channel_members (id, channel_id, user_id, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, channelId, userId, role]
  );

  return toChannelMember(result.rows[0]);
}

export async function removeChannelMember(
  channelId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query<ChannelMemberDB>(
    `UPDATE channel_members 
     SET deleted_at = CURRENT_TIMESTAMP 
     WHERE channel_id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING *`,
    [channelId, userId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function getChannelMembers(
  channelId: string,
  params: { limit?: number; offset?: number } = {}
): Promise<{ members: ChannelMember[]; total: number }> {
  const countResult = await pool.query(
    `SELECT COUNT(*) as total 
     FROM channel_members 
     WHERE channel_id = $1 AND deleted_at IS NULL`,
    [channelId]
  );

  const limit = params.limit || 10;
  const offset = params.offset || 0;

  const result = await pool.query<ChannelMemberDB>(
    `SELECT * FROM channel_members 
     WHERE channel_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [channelId, limit, offset]
  );

  return {
    members: result.rows.map(toChannelMember),
    total: parseInt(countResult.rows[0].total)
  };
}

export async function getChannelMember(
  channelId: string,
  userId: string
): Promise<ChannelMember | null> {
  const result = await pool.query<ChannelMemberDB>(
    `SELECT * FROM channel_members 
     WHERE channel_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [channelId, userId]
  );

  return result.rows[0] ? toChannelMember(result.rows[0]) : null;
}

export async function updateChannelMember(
  channelId: string,
  userId: string,
  updates: { role: 'owner' | 'admin' | 'member' }
): Promise<ChannelMember | null> {
  const result = await pool.query<ChannelMemberDB>(
    `UPDATE channel_members 
     SET role = $3
     WHERE channel_id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING *`,
    [channelId, userId, updates.role]
  );

  return result.rows[0] ? toChannelMember(result.rows[0]) : null;
} 