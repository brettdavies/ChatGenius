import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message, MessageState, MessageActions } from '../types/store.types';

const initialState: MessageState = {
  messages: {},
  threads: {},
  activeThreadId: null,
  loading: false,
  error: null,
};

export const useMessageStore = create<MessageState & MessageActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setMessages: (channelId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: messages,
          },
          error: null,
        })),

      addMessage: (channelId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: [...(state.messages[channelId] || []), message],
          },
          error: null,
        })),

      setThreadMessages: (threadId, messages) =>
        set((state) => ({
          threads: {
            ...state.threads,
            [threadId]: messages,
          },
          error: null,
        })),

      addThreadMessage: (threadId, message) =>
        set((state) => {
          const updatedThreadMessages = [...(state.threads[threadId] || []), message];
          const channelMessages = state.messages[message.channelId] || [];
          
          // Update reply count on parent message in the channel
          const updatedChannelMessages = channelMessages.map(msg => 
            msg.id === threadId 
              ? { ...msg, replyCount: (updatedThreadMessages.length - 1) }
              : msg
          );

          return {
            messages: {
              ...state.messages,
              [message.channelId]: updatedChannelMessages,
            },
            threads: {
              ...state.threads,
              [threadId]: updatedThreadMessages,
            },
            error: null,
          };
        }),

      addReaction: (channelId, messageId, emoji, userId, isThreadMessage = false) =>
        set((state) => {
          const updateMessage = (message: Message) => {
            if (message.id !== messageId) return message;
            const currentReactions = message.reactions || {};
            const currentUsers = currentReactions[emoji] || [];
            if (currentUsers.includes(userId)) return message;
            
            return {
              ...message,
              reactions: {
                ...currentReactions,
                [emoji]: [...currentUsers, userId],
              },
            };
          };

          // Find the message in both channel and thread views
          const channelMessages = state.messages[channelId] || [];
          const threadId = messageId; // For parent messages
          const parentId = channelMessages.find(m => m.id === messageId)?.id || // For parent messages
                          channelMessages.find(m => m.id === state.activeThreadId)?.id; // For thread replies

          // Update in channel messages if it exists there
          const updatedChannelMessages = channelMessages.map(updateMessage);

          // Update in thread messages if it exists there
          const threadMessages = (parentId && state.threads[parentId]) || [];
          const updatedThreadMessages = threadMessages.map(updateMessage);

          return {
            ...state,
            messages: {
              ...state.messages,
              [channelId]: updatedChannelMessages,
            },
            threads: {
              ...state.threads,
              ...(parentId ? { [parentId]: updatedThreadMessages } : {}),
            },
          };
        }),

      removeReaction: (channelId, messageId, emoji, userId, isThreadMessage = false) =>
        set((state) => {
          const updateMessage = (message: Message) => {
            if (message.id !== messageId) return message;
            const currentReactions = message.reactions || {};
            const currentUsers = currentReactions[emoji] || [];
            if (!currentUsers.includes(userId)) return message;

            const updatedUsers = currentUsers.filter(id => id !== userId);
            const updatedReactions = { ...currentReactions };
            
            if (updatedUsers.length === 0) {
              delete updatedReactions[emoji];
            } else {
              updatedReactions[emoji] = updatedUsers;
            }

            return {
              ...message,
              reactions: updatedReactions,
            };
          };

          // Find the message in both channel and thread views
          const channelMessages = state.messages[channelId] || [];
          const threadId = messageId; // For parent messages
          const parentId = channelMessages.find(m => m.id === messageId)?.id || // For parent messages
                          channelMessages.find(m => m.id === state.activeThreadId)?.id; // For thread replies

          // Update in channel messages if it exists there
          const updatedChannelMessages = channelMessages.map(updateMessage);

          // Update in thread messages if it exists there
          const threadMessages = (parentId && state.threads[parentId]) || [];
          const updatedThreadMessages = threadMessages.map(updateMessage);

          return {
            ...state,
            messages: {
              ...state.messages,
              [channelId]: updatedChannelMessages,
            },
            threads: {
              ...state.threads,
              ...(parentId ? { [parentId]: updatedThreadMessages } : {}),
            },
          };
        }),

      setActiveThread: (threadId) =>
        set({ activeThreadId: threadId, error: null }),

      setLoading: (loading) =>
        set({ loading }),

      setError: (error) =>
        set({ error, loading: false }),

      reset: () => set(initialState),
    }),
    {
      name: 'message-store',
    }
  )
); 