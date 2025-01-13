import { Channel } from '@/types/channel.types';
import { Message } from '@/types/message.types';
import { api } from '@/lib/api';

class ChannelService {
  async getChannels(): Promise<Channel[]> {
    const response = await api.get('/channels');
    return response.data;
  }

  async getChannelByShortId(shortId: string): Promise<Channel | null> {
    const response = await api.get(`/channels/${shortId}`);
    return response.data;
  }

  async getChannelMessages(channelId: string): Promise<Message[]> {
    const response = await api.get(`/channels/${channelId}/messages`);
    return response.data;
  }
}

export const channelService = new ChannelService(); 