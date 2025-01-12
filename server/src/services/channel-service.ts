import { Pool } from 'pg';
import { generateId } from '../utils/id';
import { eventService } from './event-service';
import { channelAuth } from '../utils/authorization';
import { transformDates } from '../utils/date';
import { UnauthorizedError } from '../utils/errors';
import { DatabaseConnection } from '../db/types';

export interface CreateChannelData {
  name: string;
  description?: string;
  isPrivate: boolean;
}

export interface UpdateChannelData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  archivedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export class ChannelService {
  // Validation constants
  private static readonly NAME_MIN_LENGTH = 2;
  private static readonly NAME_MAX_LENGTH = 80;
  private static readonly DESCRIPTION_MAX_LENGTH = 500;
  // Allow any Unicode letter/number/emoji, plus hyphens and underscores
  private static readonly NAME_PATTERN = /^[^\s!"#$%&'()*+,./:;<=>?@[\]^`{|}~]{2,80}$/u;

  constructor(private pool: Pool) {}

  /**
   * Creates a new channel and adds the creator as a member
   * @param userId The ID of the user creating the channel
   * @param data The channel data
   * @returns The ID of the created channel
   * @throws {Error} If validation fails or user is not authorized
   */
  async createChannel(userId: string, data: CreateChannelData): Promise<string> {
    // Check authorization first
    const authResult = await channelAuth.canCreateChannel(userId);
    if (!authResult.allowed) {
      throw new UnauthorizedError('Not authorized');
    }

    // Validate data
    this.validateChannelData(data);

    // Generate channel ID
    const channelId = generateId();

    // Start transaction
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create channel
      const result = await client.query(
        `INSERT INTO channels (id, name, description, is_private, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, name, description, is_private, created_at as "createdAt", updated_at as "updatedAt"`,
        [channelId, data.name.trim(), data.description || null, data.isPrivate || false]
      );

      // Add creator as member
      await client.query(
        `INSERT INTO channel_members (channel_id, user_id, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())`,
        [channelId, userId]
      );

      await client.query('COMMIT');

      // Transform dates and emit event
      const channel = transformDates(result.rows[0]);
      await eventService.notify('channels', {
        operation: 'INSERT',
        schema: 'public',
        table: 'channels',
        data: channel
      });

      return channelId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Gets a channel by ID
   * @param userId The ID of the user requesting the channel
   * @param channelId The ID of the channel to get
   * @returns The channel data
   * @throws {Error} If channel not found or user not authorized
   */
  async getChannel(userId: string, channelId: string): Promise<Channel> {
    const authResult = await channelAuth.canViewChannel(userId, channelId);
    if (!authResult.allowed) {
      throw new Error('Not authorized');
    }

    const result = await this.pool.query(
      `SELECT id, name, description, is_private as "isPrivate", 
              created_at as "createdAt", updated_at as "updatedAt",
              archived_at as "archivedAt", archived_by as "archivedBy",
              deleted_at as "deletedAt", deleted_by as "deletedBy"
       FROM channels
       WHERE id = $1 AND deleted_at IS NULL`,
      [channelId]
    );

    if (result.rows.length === 0) {
      throw new Error('Channel not found');
    }

    return transformDates(result.rows[0]);
  }

  /**
   * Lists all channels accessible to the user
   * @param userId The ID of the user requesting the list
   * @returns Array of channel data
   */
  async listChannels(userId: string): Promise<Channel[]> {
    const result = await this.pool.query(
      `SELECT c.id, c.name, c.description, c.is_private as "isPrivate",
              c.created_at as "createdAt", c.updated_at as "updatedAt",
              c.archived_at as "archivedAt", c.archived_by as "archivedBy",
              c.deleted_at as "deletedAt", c.deleted_by as "deletedBy"
       FROM channels c
       INNER JOIN channel_members cm ON c.id = cm.channel_id
       WHERE cm.user_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => transformDates(row));
  }

  /**
   * Validates channel data according to the feature specification
   * @param data The channel data to validate
   * @throws {Error} If validation fails
   */
  private validateChannelData(data: CreateChannelData): void {
    // Check if data is valid before proceeding
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid channel data');
    }

    // Validate name
    if (!data.name) {
      throw new Error('Channel name is required');
    }

    const name = data.name.trim();
    if (name.length < 2) {
      throw new Error('Channel name must be between 2 and 80 characters');
    }

    if (name.length > 80) {
      throw new Error('Channel name must be between 2 and 80 characters');
    }

    // Validate name format - exclude spaces and most special characters
    const invalidCharsPattern = /[\s!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/;
    if (invalidCharsPattern.test(name)) {
      throw new Error('Channel name can only contain letters, numbers, emojis, hyphens, and underscores');
    }

    // Validate description length if provided
    if (data.description && data.description.length > 500) {
      throw new Error('Channel description cannot exceed 500 characters');
    }
  }

  /**
   * Deletes a channel
   * @param userId The ID of the user deleting the channel
   * @param channelId The ID of the channel to delete
   * @throws {Error} If channel not found or user not authorized
   */
  async deleteChannel(userId: string, channelId: string): Promise<void> {
    // Check authorization first
    const authResult = await channelAuth.canDeleteChannel(userId, channelId);
    if (!authResult.allowed) {
      throw new UnauthorizedError('Not authorized to delete this channel');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Soft delete the channel
      const result = await client.query(
        `UPDATE channels 
         SET deleted_at = NOW(), deleted_by = $1
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id, name, description, is_private as "isPrivate",
                 created_at as "createdAt", updated_at as "updatedAt",
                 deleted_at as "deletedAt", deleted_by as "deletedBy"`,
        [userId, channelId]
      );

      if (result.rows.length === 0) {
        throw new Error('Channel not found or already deleted');
      }

      await client.query('COMMIT');

      // Transform dates and emit event
      const channel = transformDates(result.rows[0]);
      await eventService.notify('channels', {
        operation: 'DELETE',
        schema: 'public',
        table: 'channels',
        data: channel
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Archives or unarchives a channel
   * @param userId The ID of the user archiving the channel
   * @param channelId The ID of the channel to archive
   * @param archive Whether to archive (true) or unarchive (false)
   * @throws {Error} If channel not found or user not authorized
   */
  async archiveChannel(userId: string, channelId: string, archive: boolean): Promise<void> {
    // Check authorization first
    const authResult = await channelAuth.canArchiveChannel(userId, channelId);
    if (!authResult.allowed) {
      throw new UnauthorizedError('Not authorized to archive this channel');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Archive or unarchive the channel
      const result = await client.query(
        `UPDATE channels 
         SET archived_at = $1, archived_by = $2
         WHERE id = $3 AND deleted_at IS NULL
         RETURNING id, name, description, is_private as "isPrivate",
                 created_at as "createdAt", updated_at as "updatedAt",
                 archived_at as "archivedAt", archived_by as "archivedBy"`,
        [archive ? new Date() : null, archive ? userId : null, channelId]
      );

      if (result.rows.length === 0) {
        throw new Error('Channel not found or already deleted');
      }

      await client.query('COMMIT');

      // Transform dates and emit event
      const channel = transformDates(result.rows[0]);
      await eventService.notify('channels', {
        operation: 'UPDATE',
        schema: 'public',
        table: 'channels',
        data: channel
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Updates a channel
   * @param userId The ID of the user updating the channel
   * @param channelId The ID of the channel to update
   * @param data The updated channel data
   * @returns The updated channel
   * @throws {Error} If channel not found or user not authorized
   */
  async updateChannel(userId: string, channelId: string, data: UpdateChannelData): Promise<Channel> {
    // Check authorization first
    const authResult = await channelAuth.canUpdateChannel(userId, channelId);
    if (!authResult.allowed) {
      throw new UnauthorizedError('Not authorized to update this channel');
    }

    // Validate data if provided
    if (data.name) {
      this.validateChannelData({ name: data.name, isPrivate: false });
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Update the channel
      const result = await client.query(
        `UPDATE channels 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             is_private = COALESCE($3, is_private),
             updated_at = NOW()
         WHERE id = $4 AND deleted_at IS NULL AND archived_at IS NULL
         RETURNING id, name, description, is_private as "isPrivate",
                 created_at as "createdAt", updated_at as "updatedAt",
                 archived_at as "archivedAt", archived_by as "archivedBy"`,
        [data.name?.trim(), data.description, data.isPrivate, channelId]
      );

      if (result.rows.length === 0) {
        throw new Error('Channel not found or is archived/deleted');
      }

      await client.query('COMMIT');

      // Transform dates and emit event
      const channel = transformDates(result.rows[0]);
      await eventService.notify('channels', {
        operation: 'UPDATE',
        schema: 'public',
        table: 'channels',
        data: channel
      });

      return channel;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Create and export service
export const channelService = new ChannelService(new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})); 