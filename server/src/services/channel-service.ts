import { Pool } from 'pg';
import { generateId } from '../utils/id';
import { logger } from '../utils/logger';
import { pool } from '../config/database';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm';
  created_by: string;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date;
  archived_by?: string;
}

export interface CreateChannelData {
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm';
}

export class ChannelService {
  constructor(private pool: Pool) {}

  async createChannel(userId: string, data: CreateChannelData): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Generate channel ID
      const channelId = generateId();
      
      // Generate member ID
      const memberId = generateId();

      // Create channel
      await client.query(
        `INSERT INTO channels (id, name, description, type, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [channelId, data.name, data.description, data.type, userId]
      );

      // Add creator as member with owner role
      await client.query(
        `INSERT INTO channel_members (id, channel_id, user_id, role)
         VALUES ($1, $2, $3, $4)`,
        [memberId, channelId, userId, 'owner']
      );

      await client.query('COMMIT');
      return channelId;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating channel:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async listChannels(userId: string): Promise<Channel[]> {
    const result = await this.pool.query<Channel>(
      `SELECT c.*
       FROM channels c
       JOIN channel_members cm ON c.id = cm.channel_id
       WHERE cm.user_id = $1
         AND c.archived_at IS NULL
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

// Export singleton instance
export const channelService = new ChannelService(pool); 