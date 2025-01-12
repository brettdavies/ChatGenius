import { Response } from 'express';

export enum ConnectionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed'
}

export interface SSEConnection {
  id: string;
  userId: string;
  response: Response;
  channels: Set<string>;
  status: ConnectionStatus;
  createdAt: Date;
}

export interface ConnectionStatusResponse {
  connected: boolean;
  userId?: string;
  channels: string[];
  connectedSince?: Date;
} 