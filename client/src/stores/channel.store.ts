import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Channel } from '../types/channel.types';
import type { ChannelState, ChannelActions } from '../types/channel-store.types';
import { getMyChannels } from '../services/channel';

const initialState: ChannelState = {
  channels: [],
  activeChannelId: null,
  loading: false,
  error: null,
};

export const useChannelStore = create<ChannelState & ChannelActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchUserChannels: async () => {
        console.log('[ChannelStore] Fetching user channels');
        set({ loading: true, error: null });
        try {
          console.log('[ChannelStore] Calling getMyChannels service');
          const data = await getMyChannels();
          console.log('[ChannelStore] Fetched channels:', {
            count: data.length,
            channels: data,
            stack: new Error().stack
          });
          
          // Set channels
          set({ channels: data, loading: false });
          
          // If we have channels and no active channel, set the first one as active
          const state = get();
          if (data.length > 0 && !state.activeChannelId) {
            console.log('[ChannelStore] Setting first channel as active:', data[0].id);
            set({ activeChannelId: data[0].id });
          }
        } catch (error) {
          console.error('[ChannelStore] Error fetching channels:', {
            error,
            stack: error instanceof Error ? error.stack : undefined
          });
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch channels',
            loading: false 
          });
        }
      },

      setChannels: (channels: Channel[]) => {
        console.log('[ChannelStore] Setting channels:', {
          count: channels.length,
          channels,
          stack: new Error().stack
        });
        set({ channels, error: null });
      },

      setActiveChannel: (channelId: string) => {
        console.log('[ChannelStore] Setting active channel:', {
          channelId,
          previousActiveId: get().activeChannelId,
          stack: new Error().stack
        });
        set({ activeChannelId: channelId, error: null });
      },

      setLoading: (loading: boolean) => {
        console.log('[ChannelStore] Setting loading state:', {
          loading,
          stack: new Error().stack
        });
        set({ loading });
      },

      setError: (error: string | null) => {
        console.log('[ChannelStore] Setting error state:', {
          error,
          stack: new Error().stack
        });
        set({ error, loading: false });
      },

      reset: () => {
        console.log('[ChannelStore] Resetting store to initial state');
        set(initialState);
      }
    })
  )
); 