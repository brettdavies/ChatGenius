import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Channel, ChannelState, ChannelActions } from '../types/store.types';

const initialState: ChannelState = {
  channels: [],
  activeChannelId: null,
  loading: false,
  error: null,
};

export const useChannelStore = create<ChannelState & ChannelActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setChannels: (channels) => 
        set({ channels, error: null }),

      addChannel: (channel) =>
        set((state) => ({
          channels: [...state.channels, channel],
          error: null,
        })),

      setActiveChannel: (channelId) =>
        set({ activeChannelId: channelId, error: null }),

      setLoading: (loading) =>
        set({ loading }),

      setError: (error) =>
        set({ error, loading: false }),

      reset: () => set(initialState),
    }),
    {
      name: 'channel-store',
    }
  )
); 