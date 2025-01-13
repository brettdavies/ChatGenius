import { create } from 'zustand';
import { Message } from '@/types/message.types';

interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  drafts: Record<string, string>; // channelId -> draft content
  loading: boolean;
  error: Error | null;
}

interface MessageActions {
  sendMessage: (channelId: string, message: Message) => void;
  updateDraft: (channelId: string, content: string) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, update: Partial<Message>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setLoading: (status: boolean) => void;
  setError: (error: Error | null) => void;
}

const initialState: MessageState = {
  messages: {},
  drafts: {},
  loading: false,
  error: null
};

export const useMessageStore = create<MessageState & MessageActions>((set) => ({
  ...initialState,

  sendMessage: (channelId: string, message: Message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), message]
      },
      drafts: {
        ...state.drafts,
        [channelId]: '' // Clear draft after sending
      }
    }));
  },

  updateDraft: (channelId: string, content: string) =>
    set(state => ({
      drafts: {
        ...state.drafts,
        [channelId]: content
      }
    })),

  setMessages: (channelId: string, messages: Message[]) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: messages
      }
    })),

  addMessage: (channelId: string, message: Message) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), message]
      }
    })),

  updateMessage: (channelId: string, messageId: string, update: Partial<Message>) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: state.messages[channelId]?.map(msg =>
          msg.id === messageId ? { ...msg, ...update } : msg
        ) || []
      }
    })),

  deleteMessage: (channelId: string, messageId: string) =>
    set(state => ({
      messages: {
        ...state.messages,
        [channelId]: state.messages[channelId]?.filter(msg => msg.id !== messageId) || []
      }
    })),

  setLoading: (status: boolean) => set({ loading: status }),
  setError: (error: Error | null) => set({ error })
})); 