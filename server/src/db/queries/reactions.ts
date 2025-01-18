import pool from '../pool.js';
import { ulid } from 'ulid';

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface ReactionDB {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: Date;
}

export interface CreateReactionInput {
  messageId: string;
  userId: string;
  emoji: string;
}

function toReaction(reaction: ReactionDB): Reaction {
  return {
    id: reaction.id,
    messageId: reaction.message_id,
    userId: reaction.user_id,
    emoji: reaction.emoji,
    createdAt: reaction.created_at
  };
}

export async function addReaction(input: CreateReactionInput): Promise<Reaction> {
  const { rows } = await pool.query<ReactionDB>(
    `INSERT INTO reactions (id, message_id, user_id, emoji)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [ulid(), input.messageId, input.userId, input.emoji]
  );
  return toReaction(rows[0]);
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM reactions 
     WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
    [messageId, userId, emoji]
  );
  return rowCount > 0;
}

export async function getReactionsByMessageId(messageId: string): Promise<Reaction[]> {
  const { rows } = await pool.query<ReactionDB>(
    `SELECT * FROM reactions WHERE message_id = $1`,
    [messageId]
  );
  return rows.map(toReaction);
}

export async function getReactionsByMessageIds(messageIds: string[]): Promise<{ [messageId: string]: Reaction[] }> {
  if (!messageIds.length) return {};

  const { rows } = await pool.query<ReactionDB>(
    `SELECT * FROM reactions WHERE message_id = ANY($1)`,
    [messageIds]
  );

  return rows.reduce((acc, reaction) => {
    const reactionObj = toReaction(reaction);
    const messageId = reactionObj.messageId;
    if (!acc[messageId]) {
      acc[messageId] = [];
    }
    acc[messageId].push(reactionObj);
    return acc;
  }, {} as { [messageId: string]: Reaction[] });
}

export async function getReactionsByUserId(userId: string): Promise<Reaction[]> {
  const { rows } = await pool.query<ReactionDB>(
    `SELECT * FROM reactions WHERE user_id = $1`,
    [userId]
  );
  return rows.map(toReaction);
}

export async function hasUserReacted(messageId: string, userId: string, emoji: string): Promise<boolean> {
  const { rows } = await pool.query<ReactionDB>(
    `SELECT * FROM reactions 
     WHERE message_id = $1 AND user_id = $2 AND emoji = $3 
     LIMIT 1`,
    [messageId, userId, emoji]
  );
  return rows.length > 0;
} 