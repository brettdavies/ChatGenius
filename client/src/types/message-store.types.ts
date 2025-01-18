import { Message } from './message.types';
import { SearchFilters } from './search.types';

export interface MessageState {
  messages: Record<string, Message[]>;
  threads: Record<string, Message[]>;
  activeThreadId: string | null;
  activeChannelId: string | null;
  searchQuery: string;
  searchResults: Message[];
  searchFilters: SearchFilters;
  loading: boolean;
  error: string | null;
}

export interface MessageActions {
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, content: string, isThreadMessage: boolean) => void;
  deleteMessage: (channelId: string, messageId: string, isThreadMessage: boolean) => void;
  setThreadMessages: (threadId: string, messages: Message[]) => void;
  addThreadMessage: (threadId: string, message: Message) => void;
  setActiveThread: (threadId: string | null, channelId: string | null) => void;
  searchMessages: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} 