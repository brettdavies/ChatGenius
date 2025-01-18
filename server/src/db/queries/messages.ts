import pool from '../pool.js';
import { ulid } from 'ulid';

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  threadId: string | null;
  isThreadMessage: boolean;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  replyCount: number;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reactions: Record<string, string[]>;
}

export interface MessageDB {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  thread_id: string | null;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  reply_count: string;
  user_username: string;
  user_avatar_url: string | null;
  reactions: Record<string, string[]>;
}

export interface CreateMessageInput {
  channelId: string;
  userId: string;
  content: string;
  threadId?: string;
}

export interface UpdateMessageInput {
  content: string;
}

function toMessage(message: MessageDB): Message {
  return {
    id: message.id,
    channelId: message.channel_id,
    userId: message.user_id,
    content: message.content,
    threadId: message.thread_id,
    isThreadMessage: message.thread_id !== null,
    edited: false,
    createdAt: message.created_at,
    updatedAt: message.updated_at,
    deletedAt: message.deleted_at,
    replyCount: parseInt(message.reply_count || '0', 10),
    user: {
      id: message.user_id,
      username: message.user_username,
      avatar_url: message.user_avatar_url
    },
    reactions: message.reactions || {}
  };
}

export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const { rows } = await pool.query<MessageDB>(
    `WITH new_message AS (
      INSERT INTO messages (id, channel_id, user_id, content, thread_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    )
    SELECT m.*, u.username as user_username, u.avatar_url as user_avatar_url,
           (SELECT COUNT(*) FROM messages replies WHERE replies.thread_id = m.id AND replies.deleted_at IS NULL) as reply_count
    FROM new_message m
    LEFT JOIN users u ON m.user_id = u.id`,
    [ulid(), input.channelId, input.userId, input.content, input.threadId]
  );
  return toMessage(rows[0]);
}

export async function getMessageById(messageId: string): Promise<Message | null> {
  const { rows } = await pool.query<MessageDB>(
    `SELECT m.*, u.username as user_username, u.avatar_url as user_avatar_url,
            (SELECT COUNT(*) FROM messages replies WHERE replies.thread_id = m.id AND replies.deleted_at IS NULL) as reply_count
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.id = $1 AND m.deleted_at IS NULL`,
    [messageId]
  );
  return rows.length > 0 ? toMessage(rows[0]) : null;
}

export async function updateMessage(messageId: string, input: UpdateMessageInput): Promise<Message | null> {
  const { rows } = await pool.query<MessageDB>(
    `WITH updated_message AS (
      UPDATE messages 
      SET content = $1, edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    )
    SELECT m.*, u.username as user_username, u.avatar_url as user_avatar_url,
           (SELECT COUNT(*) FROM messages replies WHERE replies.thread_id = m.id AND replies.deleted_at IS NULL) as reply_count
    FROM updated_message m
    LEFT JOIN users u ON m.user_id = u.id`,
    [input.content, messageId]
  );
  return rows.length > 0 ? toMessage(rows[0]) : null;
}

export async function softDeleteMessage(messageId: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE messages 
     SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [messageId]
  );
  return (result.rowCount ?? 0) > 0;
}

export interface GetMessagesOptions {
  channelId: string;
  limit?: number;
  before?: Date;
  after?: Date;
}

export async function getMessages(options: GetMessagesOptions): Promise<{ messages: Message[]; total: number }> {
  const params: any[] = [options.channelId];
  let whereClause = 'WHERE m.channel_id = $1 AND m.thread_id IS NULL AND m.deleted_at IS NULL';
  let paramIndex = 2;

  if (options.before) {
    whereClause += ` AND m.created_at < $${paramIndex}`;
    params.push(options.before);
    paramIndex++;
  }

  if (options.after) {
    whereClause += ` AND m.created_at > $${paramIndex}`;
    params.push(options.after);
    paramIndex++;
  }

  const limit = options.limit || 50;
  params.push(limit);

  const { rows: messages } = await pool.query<MessageDB>(
    `SELECT m.*, 
            u.username as user_username, 
            u.avatar_url as user_avatar_url,
            (SELECT COUNT(*) FROM messages replies WHERE replies.thread_id = m.id AND replies.deleted_at IS NULL) as reply_count
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     ${whereClause}
     ORDER BY m.created_at ASC 
     LIMIT $${paramIndex}`,
    params
  );

  const { rows: [{ count }] } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM messages m ${whereClause}`,
    params.slice(0, -1)
  );

  return {
    messages: messages.map(toMessage),
    total: parseInt(count, 10)
  };
}

export interface GetThreadMessagesOptions {
  threadId: string;
  limit?: number;
  before?: Date;
}

export async function getThreadMessages(options: GetThreadMessagesOptions): Promise<{ messages: Message[]; total: number }> {
  const params: any[] = [options.threadId];
  let whereClause = 'WHERE m.thread_id = $1 AND m.deleted_at IS NULL';
  let paramIndex = 2;

  if (options.before) {
    whereClause += ` AND m.created_at < $${paramIndex}`;
    params.push(options.before);
    paramIndex++;
  }

  const limit = options.limit || 50;
  params.push(limit);

  const { rows: messages } = await pool.query<MessageDB>(
    `SELECT m.*, u.username as user_username, u.avatar_url as user_avatar_url 
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     ${whereClause}
     ORDER BY m.created_at ASC 
     LIMIT $${paramIndex}`,
    params
  );

  const { rows: [{ count }] } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM messages m ${whereClause}`,
    params.slice(0, -1)
  );

  return {
    messages: messages.map(toMessage),
    total: parseInt(count, 10)
  };
}

export interface SearchMessagesOptions {
  query: string;
  channelIds?: string[];
  userId?: string;
  limit?: number;
  offset?: number;
}

export async function searchMessages(options: SearchMessagesOptions): Promise<{ messages: Message[]; total: number }> {
  const params: any[] = [`%${options.query}%`];
  let whereClause = 'WHERE m.content ILIKE $1 AND m.deleted_at IS NULL';
  let paramIndex = 2;

  if (options.channelIds?.length) {
    whereClause += ` AND m.channel_id = ANY($${paramIndex})`;
    params.push(options.channelIds);
    paramIndex++;
  }

  if (options.userId) {
    whereClause += ` AND m.user_id = $${paramIndex}`;
    params.push(options.userId);
    paramIndex++;
  }

  const limit = options.limit || 50;
  const offset = options.offset || 0;
  params.push(limit, offset);

  const { rows: messages } = await pool.query<MessageDB>(
    `SELECT m.*, 
            u.id as user_id,
            u.username as user_username,
            u.avatar_url as user_avatar_url,
            (SELECT COUNT(*) FROM messages replies WHERE replies.thread_id = m.id AND replies.deleted_at IS NULL) as reply_count
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     ${whereClause}
     ORDER BY m.created_at DESC 
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  const { rows: [{ count }] } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM messages m ${whereClause}`,
    params.slice(0, -2)
  );

  return {
    messages: messages.map(toMessage),
    total: parseInt(count, 10)
  };
} 