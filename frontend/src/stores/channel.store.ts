import { create } from 'zustand';
import { Channel } from '@/types/channel.types';

interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;
  loading: boolean;
  error: Error | null;
}

interface ChannelActions {
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  updateChannel: (channelId: string, update: Partial<Channel>) => void;
  deleteChannel: (channelId: string) => void;
  setActiveChannel: (channel: Channel | null) => void;
  setLoading: (status: boolean) => void;
  setError: (error: Error | null) => void;
}

const initialState: ChannelState = {
  channels: [],
  activeChannel: null,
  loading: false,
  error: null
};

export const useChannelStore = create<ChannelState & ChannelActions>((set) => ({
  ...initialState,

  setChannels: (channels) => set({ channels }),

  addChannel: (channel) =>
    set(state => ({
      channels: [...state.channels, channel]
    })),

  updateChannel: (channelId, update) =>
    set(state => ({
      channels: state.channels.map(channel =>
        channel.id === channelId ? { ...channel, ...update } : channel
      )
    })),

  deleteChannel: (channelId) =>
    set(state => ({
      channels: state.channels.filter(channel => channel.id !== channelId)
    })),

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error })
})); 