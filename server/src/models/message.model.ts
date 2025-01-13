import { ulid } from 'ulid';
import { db } from '@/db';
import { logger } from '@/utils/logger';

interface CreateMessageParams {
  channelId: string;
  userId: string;
  content: string;
  threadId?: string;
}

export class MessageModel {
  /**
   * Create a new message
   */
  async create(params: CreateMessageParams) {
    const { channelId, userId, content, threadId } = params;
    const id = ulid();

    logger.info(`Creating message ${id} in channel ${channelId}`);

    const result = await db.query(
      `INSERT INTO messages (id, channel_id, user_id, content, thread_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, channelId, userId, content, threadId]
    );

    return result.rows[0];
  }

  /**
   * Find messages by channel ID
   */
  async findByChannelId(channelId: string) {
    logger.info(`Finding messages for channel ${channelId}`);

    const result = await db.query(
      `SELECT m.*, 
              u.full_name as user_name,
              u.username,
              u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.channel_id = $1
         AND m.deleted_at IS NULL
         AND m.thread_id IS NULL
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [channelId]
    );

    return result.rows;
  }

  /**
   * Find a message by ID
   */
  async findById(id: string) {
    logger.info(`Finding message ${id}`);

    const result = await db.query(
      `SELECT m.*, 
              u.full_name as user_name,
              u.username,
              u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = $1
         AND m.deleted_at IS NULL`,
      [id]
    );

    return result.rows[0];
  }

  /**
   * Find thread messages
   */
  async findThreadMessages(threadId: string) {
    logger.info(`Finding messages for thread ${threadId}`);

    const result = await db.query(
      `SELECT m.*, 
              u.full_name as user_name,
              u.username,
              u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.thread_id = $1
         AND m.deleted_at IS NULL
       ORDER BY m.created_at ASC`,
      [threadId]
    );

    return result.rows;
  }
} 