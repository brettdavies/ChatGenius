import { create } from 'zustand';

interface Message {
  id: string;
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

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

interface MessageState {
  messages: Record<string, Message[]>;
  drafts: Record<string, string>;
  loading: boolean;
  error: Error | null;
}

interface MessageActions {
  sendMessage: (channelId: string, content: string) => Promise<void>;
  updateDraft: (channelId: string, content: string) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, update: Partial<Message>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setError: (error: Error | null) => void;
  setLoading: (status: boolean) => void;
}

const initialState: MessageState = {
  messages: {},
  drafts: {},
  loading: false,
  error: null
};

export const useMessageStore = create<MessageState & MessageActions>((set, get) => ({
  ...initialState,

  sendMessage: async (channelId, content) => {
    try {
      set({ loading: true, error: null });
      
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        content,
        channelId,
        userId: 'current-user', // TODO: Get from auth store
        createdAt: new Date(),
        pending: true
      };

      get().addMessage(channelId, tempMessage);

      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // TODO: Replace temp message with real one from API
      set(state => ({
        messages: {
          ...state.messages,
          [channelId]: state.messages[channelId].map(msg =>
            msg.id === tempId ? { ...msg, pending: false } : msg
          )
        },
        drafts: {
          ...state.drafts,
          [channelId]: ''
        }
      }));
    } catch (error) {
      set({ error: error as Error });
      
      // Remove temp message on error
      set(state => ({
        messages: {
          ...state.messages,
          [channelId]: state.messages[channelId].filter(msg => msg.id !== tempId)
        }
      }));
    } finally {
      set({ loading: false });
    }
  },

  updateDraft: (channelId, content) => 
    set(state => ({
      drafts: { ...state.drafts, [channelId]: content }
    })),

  setMessages: (channelId, messages) =>
    set(state => ({
      messages: { ...state.messages, [channelId]: messages }
    })),

  addMessage: (channelId, message) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), message]
      }
    })),

  updateMessage: (channelId, messageId, update) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: state.messages[channelId].map(msg =>
          msg.id === messageId ? { ...msg, ...update } : msg
        )
      }
    })),

  deleteMessage: (channelId, messageId) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: state.messages[channelId].filter(msg => msg.id !== messageId)
      }
    })),

  setError: (error) => set({ error }),
  
  setLoading: (status) => set({ loading: status })
})); 