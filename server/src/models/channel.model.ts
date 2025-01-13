import { pool } from '@/db/pool';
import { Channel } from '@/types/channel';
import { ulid } from 'ulid';

export class ChannelModel {
  async create(name: string, creatorId: string): Promise<Channel> {
    const id = ulid();
    const shortId = id.slice(-10);
    const query = `
      INSERT INTO channels (id, short_id, name, creator_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const values = [id, shortId, name, creatorId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByShortId(shortId: string): Promise<Channel | null> {
    const query = `
      SELECT * FROM channels
      WHERE short_id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [shortId]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<Channel | null> {
    const query = `
      SELECT * FROM channels
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Channel[]> {
    const query = `
      SELECT * FROM channels
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async archive(id: string): Promise<Channel | null> {
    const query = `
      UPDATE channels
      SET archived_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<Channel | null> {
    const query = `
      UPDATE channels
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
} 