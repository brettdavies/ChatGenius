import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message, MessageState, MessageActions, SearchFilters } from '../types/store.types';
import { threadMessages as sampleThreadMessages } from '../data/sample-messages';

const initialState: MessageState = {
  messages: {},
  threads: sampleThreadMessages,
  activeThreadId: null,
  searchQuery: '',
  searchResults: [],
  searchFilters: {
    channels: { include: [], exclude: [] },
    users: { include: [], exclude: [] },
    hasThread: undefined,
    excludeThread: undefined,
    dateRange: undefined,
  },
  loading: false,
  error: null,
};

export const useMessageStore = create<MessageState & MessageActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      deleteMessage: (channelId: string, messageId: string, isThreadMessage = false) =>
        set((state) => {
          // Find the message in both channel and thread views
          const channelMessages = state.messages[channelId] || [];
          const threadId = messageId; // For parent messages
          const parentId = channelMessages.find(m => m.id === messageId)?.id || // For parent messages
                          channelMessages.find(m => m.id === state.activeThreadId)?.id; // For thread replies

          const markMessageAsDeleted = (message: Message) => {
            if (message.id !== messageId) return message;
            return {
              ...message,
              deletedAt: new Date().toISOString(),
            };
          };

          // Mark message as deleted in channel messages
          const updatedChannelMessages = channelMessages.map(markMessageAsDeleted);

          // If it's a thread reply, mark as deleted in thread
          const updatedThreads = { ...state.threads };
          if (parentId) {
            const threadMessages = state.threads[parentId] || [];
            const updatedThreadMessages = threadMessages.map(markMessageAsDeleted);
            updatedThreads[parentId] = updatedThreadMessages;
          }

          return {
            ...state,
            messages: {
              ...state.messages,
              [channelId]: updatedChannelMessages,
            },
            threads: updatedThreads,
          };
        }),

      updateMessage: (channelId: string, messageId: string, content: string, isThreadMessage = false) =>
        set((state) => {
          const updateMessageContent = (message: Message) => {
            if (message.id !== messageId) return message;
            return {
              ...message,
              content,
              updatedAt: new Date().toISOString(),
            };
          };

          // Find the message in both channel and thread views
          const channelMessages = state.messages[channelId] || [];
          const threadId = messageId; // For parent messages
          const parentId = channelMessages.find(m => m.id === messageId)?.id || // For parent messages
                          channelMessages.find(m => m.id === state.activeThreadId)?.id; // For thread replies

          // Update in channel messages if it exists there
          const updatedChannelMessages = channelMessages.map(updateMessageContent);

          // Update in thread messages if it exists there
          const threadMessages = (parentId && state.threads[parentId]) || [];
          const updatedThreadMessages = threadMessages.map(updateMessageContent);

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

      addReaction: (channelId: string, messageId: string, emoji: string, userId: string, isThreadMessage = false) =>
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

      removeReaction: (channelId: string, messageId: string, emoji: string, userId: string, isThreadMessage = false) =>
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

      searchMessages: (query: string) =>
        set((state) => {
          // Parse search filters from query
          const { filters, searchTerms } = parseSearchQuery(query);
          const searchText = searchTerms.join(' ');

          // Get all messages and apply filters
          const allMessages = Object.values(state.messages)
            .flat()
            .filter(message => !message.deletedAt); // Exclude deleted messages

          const filteredMessages = allMessages.filter(message => {
            // Apply channel filters
            if (filters.channels.include.length > 0 &&
                !filters.channels.include.includes(message.channelId)) {
              return false;
            }
            if (filters.channels.exclude.includes(message.channelId)) {
              return false;
            }

            // Apply user filters
            if (filters.users.include.length > 0 &&
                !filters.users.include.includes(message.userId)) {
              return false;
            }
            if (filters.users.exclude.includes(message.userId)) {
              return false;
            }

            // Apply thread filters
            if (filters.hasThread && !message.replyCount) {
              return false;
            }
            if (filters.excludeThread && message.replyCount) {
              return false;
            }

            // Apply date filters
            const messageDate = new Date(message.createdAt);
            if (filters.dateRange?.before) {
              const beforeDate = new Date(filters.dateRange.before);
              if (messageDate > beforeDate) {
                return false;
              }
            }
            if (filters.dateRange?.after) {
              const afterDate = new Date(filters.dateRange.after);
              if (messageDate < afterDate) {
                return false;
              }
            }

            // Apply text search if there are search terms
            if (searchText) {
              const content = message.content.toLowerCase();
              return searchTerms.every(term => content.includes(term.toLowerCase()));
            }

            return true;
          });

          return {
            searchQuery: query,
            searchResults: filteredMessages,
            searchFilters: filters,
            error: null,
          };
        }),

      clearSearch: () =>
        set({
          searchQuery: '',
          searchResults: [],
          searchFilters: initialState.searchFilters,
          error: null,
        }),
    }),
    {
      name: 'message-store',
    }
  )
);

// Helper function to parse search query and extract filters
function parseSearchQuery(query: string): { filters: SearchFilters, searchTerms: string[] } {
  const filters: SearchFilters = {
    channels: { include: [], exclude: [] },
    users: { include: [], exclude: [] },
    hasThread: undefined,
    excludeThread: undefined,
    dateRange: undefined,
  };

  const searchTerms: string[] = [];
  const terms = query.split(' ');

  terms.forEach(term => {
    // Channel filter
    if (term.startsWith('channel:')) {
      const channel = term.slice(8);
      filters.channels.include.push(channel);
    }
    else if (term.startsWith('-channel:')) {
      const channel = term.slice(9);
      filters.channels.exclude.push(channel);
    }
    // User filter
    else if (term.startsWith('user:@')) {
      const user = term.slice(6);
      filters.users.include.push(user);
    }
    else if (term.startsWith('-user:@')) {
      const user = term.slice(7);
      filters.users.exclude.push(user);
    }
    // Thread filter
    else if (term === 'has:thread') {
      filters.hasThread = true;
    }
    else if (term === '-has:thread') {
      filters.excludeThread = true;
    }
    // Date filters
    else if (term.startsWith('before:')) {
      const date = term.slice(7);
      filters.dateRange = {
        ...filters.dateRange,
        before: date,
      };
    }
    else if (term.startsWith('after:')) {
      const date = term.slice(6);
      filters.dateRange = {
        ...filters.dateRange,
        after: date,
      };
    }
    // Regular search term
    else {
      searchTerms.push(term);
    }
  });

  return { filters, searchTerms };
} 