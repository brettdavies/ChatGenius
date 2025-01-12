import { Pool, PoolClient } from 'pg';

export interface DatabaseConfig {
  connectionString: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

export interface DatabaseConnection {
  pool: Pool;
  client?: PoolClient;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
} 