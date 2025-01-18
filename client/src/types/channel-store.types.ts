import { Channel } from './channel.types';

export interface ChannelState {
  channels: Channel[];
  activeChannelId: string | null;
  loading: boolean;
  error: string | null;
}

export interface ChannelActions {
  fetchUserChannels: () => Promise<void>;
  setChannels: (channels: Channel[]) => void;
  setActiveChannel: (channelId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} 