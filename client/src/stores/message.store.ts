import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MessageState, MessageActions } from '../types/message-store.types';
import { searchMessages as searchMessagesApi } from '../services/message';

const initialState: MessageState = {
  messages: {},
  threads: {},
  activeThreadId: null,
  activeChannelId: null,
  searchQuery: '',
  searchResults: [],
  searchFilters: {
    channels: {
      include: [],
      exclude: []
    },
    users: {
      include: [],
      exclude: []
    },
    hasThread: false,
    excludeThread: false,
    dateRange: undefined
  },
  loading: false,
  error: null
};

export const useMessageStore = create<MessageState & MessageActions>()(
  devtools((set) => ({
    ...initialState,

    setMessages: (channelId, messages) =>
      set((state) => ({
        messages: { ...state.messages, [channelId]: messages },
      })),

    addMessage: (channelId, message) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: [...(state.messages[channelId] || []), message],
        },
      })),

    updateMessage: (channelId, messageId, content, isThreadMessage) =>
      set((state) => {
        if (isThreadMessage && state.activeThreadId) {
          return {
            threads: {
              ...state.threads,
              [state.activeThreadId]: state.threads[state.activeThreadId].map((m) =>
                m.id === messageId ? { ...m, content, edited: true } : m
              ),
            },
          };
        }
        return {
          messages: {
            ...state.messages,
            [channelId]: state.messages[channelId].map((m) =>
              m.id === messageId ? { ...m, content, edited: true } : m
            ),
          },
        };
      }),

    updateMessageReactions: (channelId, messageId, reactions, isThreadMessage) =>
      set((state) => {
        if (isThreadMessage && state.activeThreadId) {
          return {
            threads: {
              ...state.threads,
              [state.activeThreadId]: state.threads[state.activeThreadId].map((m) =>
                m.id === messageId ? { ...m, reactions } : m
              ),
            },
          };
        }
        return {
          messages: {
            ...state.messages,
            [channelId]: state.messages[channelId].map((m) =>
              m.id === messageId ? { ...m, reactions } : m
            ),
          },
        };
      }),

    deleteMessage: (channelId, messageId, isThreadMessage) =>
      set((state) => {
        if (isThreadMessage && state.activeThreadId) {
          return {
            threads: {
              ...state.threads,
              [state.activeThreadId]: state.threads[state.activeThreadId].filter(
                (m) => m.id !== messageId
              ),
            },
          };
        }
        return {
          messages: {
            ...state.messages,
            [channelId]: state.messages[channelId].filter((m) => m.id !== messageId),
          },
        };
      }),

    setThreadMessages: (threadId, messages) => {
      console.log('[MessageStore] Setting thread messages for threadId:', threadId, 'count:', messages.length);
      set((state) => ({
        threads: { ...state.threads, [threadId]: messages },
      }));
    },

    addThreadMessage: (threadId, message) => {
      console.log('[MessageStore] Adding message to thread:', threadId, 'message:', message.id);
      set((state) => ({
        threads: {
          ...state.threads,
          [threadId]: [...(state.threads[threadId] || []), message],
        },
      }));
    },

    setActiveThread: (threadId, channelId) => {
      console.log('[MessageStore] Setting active thread:', threadId, 'in channel:', channelId);
      set({ 
        activeThreadId: threadId,
        activeChannelId: channelId
      });
    },

    searchMessages: async (query: string) => {
      console.log('[MessageStore] Searching messages with query:', query);
      set({ loading: true, error: null });
      
      try {
        const options: { channelId?: string } = {};
        const state = useMessageStore.getState();
        
        // Add channel filters if specified
        if (state.searchFilters.channels.include.length > 0) {
          options.channelId = state.searchFilters.channels.include[0];
        }
        
        const { messages, total } = await searchMessagesApi(query, options.channelId);
        console.log('[MessageStore] Search results:', messages.length, 'Total:', total);
        set({ 
          searchQuery: query,
          searchResults: messages,
          loading: false 
        });
      } catch (error) {
        console.error('[MessageStore] Search error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to search messages',
          loading: false 
        });
      }
    },

    setSearchQuery: (query) =>
      set({ searchQuery: query }),

    clearSearch: () => {
      console.log('[MessageStore] Clearing search');
      set({ 
        searchQuery: '',
        searchResults: [],
        searchFilters: initialState.searchFilters
      });
    },

    setLoading: (loading) =>
      set({ loading }),

    setError: (error) =>
      set({ error }),

    reset: () => set(initialState),
  }), {
    name: 'message-store',
  })
); 