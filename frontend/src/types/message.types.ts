export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  FILE = 'file'
}

export enum AttachmentType {
  IMAGE = 'image',
  FILE = 'file'
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  userId: string;
  channelId: string;
  threadId?: string;
  createdAt: Date;
  updatedAt?: Date;
  reactions?: MessageReaction[];
  attachments?: Attachment[];
  pending?: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  size?: number;
  createdAt: Date;
}

// Store types
export interface MessageState {
  messages: Record<string, Message[]>;
  drafts: Record<string, string>;
  loading: boolean;
  error: Error | null;
}

export interface MessageActions {
  sendMessage: (channelId: string, content: string) => Promise<void>;
  updateDraft: (channelId: string, content: string) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, update: Partial<Message>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setError: (error: Error | null) => void;
  setLoading: (status: boolean) => void;
} 