export interface Message {
  id: string;
  /** Raw Markdown content of the message */
  content: string;
  userId: string;
  channelId: string;
  threadId?: string;
  parentId?: string;
  replyCount?: number;
  reactions?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  /** When the message was deleted, if it has been deleted */
  deletedAt?: string;
  mentions?: Array<{
    type: 'user' | 'channel';
    id: string;
    index: number;
    length: number;
  }>;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  isThreadMessage?: boolean;
  isThreadParent?: boolean;
  /** Whether the message has been edited */
  edited?: boolean;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
} 