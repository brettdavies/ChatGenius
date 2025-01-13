import { MessageType } from '../message.types';

export interface ApiMessage {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  thread_id?: string;
  created_at: string;
  updated_at?: string;
  reactions?: ApiMessageReaction[];
  attachments?: ApiAttachment[];
  type: MessageType;
}

export interface ApiMessageReaction {
  emoji: string;
  count: number;
  user_ids: string[];
  created_at: string;
}

export interface ApiAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
  created_at: string;
}

export interface CreateMessageRequest {
  content: string;
  channel_id: string;
  thread_id?: string;
  attachments?: string[]; // Attachment IDs
}

export interface UpdateMessageRequest {
  content?: string;
  attachments?: string[]; // Attachment IDs
}

export interface AddReactionRequest {
  emoji: string;
} 