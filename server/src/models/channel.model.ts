import { pool } from '@/db/pool';
import { Channel } from '@/types/channel';
import { ulid } from 'ulid';

interface ChannelMember {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member';
  joined_at: Date;
}

export class ChannelModel {
  async create(name: string, type: string, createdBy: string): Promise<Channel> {
    const id = ulid();

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create the channel
      const createChannelQuery = `
        INSERT INTO channels (id, name, type, created_by, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `;
      const channelResult = await client.query(createChannelQuery, [id, name, type, createdBy]);
      const channel = channelResult.rows[0];

      // Add creator as a member with 'owner' role
      const addMemberQuery = `
        INSERT INTO channel_members (id, channel_id, user_id, role, created_at)
        VALUES ($1, $2, $3, 'owner', NOW())
      `;
      await client.query(addMemberQuery, [ulid(), id, createdBy]);

      await client.query('COMMIT');
      return this.addShortId(channel);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByShortId(shortId: string): Promise<Channel | null> {
    console.log(`[ChannelModel] Finding channel by short ID: ${shortId}`);
    // Get all channels and find the one with matching shortId
    const channels = await this.findAll();
    const channel = channels.find(c => this.generateShortId(c.id) === shortId);
    console.log(`[ChannelModel] findByShortId result:`, channel);
    return channel ? this.addShortId(channel) : null;
  }

  async findById(id: string): Promise<Channel | null> {
    console.log(`[ChannelModel] Finding channel by ID: ${id}`);
    const query = `
      SELECT * FROM channels
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    const channel = result.rows[0];
    console.log(`[ChannelModel] findById result:`, channel);
    return channel ? this.addShortId(channel) : null;
  }

  async findAll(): Promise<Channel[]> {
    const query = `
      SELECT * FROM channels
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(channel => this.addShortId(channel));
  }

  async archive(id: string, archivedBy: string): Promise<Channel | null> {
    const query = `
      UPDATE channels
      SET archived_at = NOW(), 
          archived_by = $2
      WHERE id = $1 
        AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id, archivedBy]);
    const channel = result.rows[0];
    return channel ? this.addShortId(channel) : null;
  }

  async delete(id: string): Promise<Channel | null> {
    const query = `
      UPDATE channels
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    const channel = result.rows[0];
    return channel ? this.addShortId(channel) : null;
  }

  private generateShortId(id: string): string {
    // Take the last 10 characters of the ULID
    return id.slice(-10);
  }

  private addShortId(channel: any): Channel {
    return {
      ...channel,
      shortId: this.generateShortId(channel.id)
    };
  }

  /**
   * Check if a user is a member of a channel
   */
  async isUserMember(channelId: string, userId: string): Promise<boolean> {
    console.log(`[ChannelModel] Checking if user ${userId} is member of channel ${channelId}`);
    
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT 1 FROM channel_members 
        WHERE channel_id = $1 AND user_id = $2
      )`,
      [channelId, userId]
    );

    return result.rows[0].exists;
  }

  /**
   * Find all channels a user is a member of
   */
  async findUserChannels(userId: string): Promise<Channel[]> {
    console.log(`[ChannelModel] Finding channels for user ID: ${userId}`);
    
    const query = `
      SELECT c.* 
      FROM channels c
      JOIN channel_members cm ON c.id = cm.channel_id
      WHERE cm.user_id = $1 
        AND c.deleted_at IS NULL
        AND cm.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `;
    console.log(`[ChannelModel] Executing query:`, query);
    console.log(`[ChannelModel] With parameters:`, [userId]);
    
    const result = await pool.query(query, [userId]);
    console.log(`[ChannelModel] Query result:`, result.rows);
    
    return result.rows.map(channel => this.addShortId(channel));
  }

  /**
   * Find all public channels
   */
  async findPublicChannels(): Promise<Channel[]> {
    const query = `
      SELECT * FROM channels
      WHERE type = 'public'
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(channel => this.addShortId(channel));
  }

  /**
   * Get all members of a channel with their user details
   */
  async getChannelMembers(channelId: string): Promise<ChannelMember[]> {
    console.log(`[ChannelModel] Getting members for channel: ${channelId}`);
    
    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.username,
        u.email,
        u.avatar_url,
        cm.role,
        cm.created_at as joined_at
      FROM channel_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.channel_id = $1
        AND cm.deleted_at IS NULL
      ORDER BY cm.created_at ASC
    `;
    
    const result = await pool.query(query, [channelId]);
    return result.rows;
  }
} 