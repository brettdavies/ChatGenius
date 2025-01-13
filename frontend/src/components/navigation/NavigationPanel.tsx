import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useNavStore } from '@/stores/nav.store';
import { useChannelStore } from '@/stores/channel.store';
import { useApiGet } from "@/services/api.service";
import { Channel, ChannelType } from "@/types/channel.types";

interface ApiChannel {
  id: string;
  name: string;
  type: ChannelType;
  created_at: string;
  updated_at: string;
  members: {
    id: string;
    user_id: string;
    channel_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
  }[];
}

export const NavigationPanel: React.FC = () => {
  const navigate = useNavigate();
  const { activeChannel, setActiveChannel } = useNavStore();
  const { channels, setChannels } = useChannelStore();
  const [error, setError] = useState<string | null>(null);

  // Setup authenticated API call
  const { execute: loadChannels, isLoading, error: channelsError } = useApiGet<ApiChannel[]>('/channels');

  // Load channels
  useEffect(() => {
    loadChannels()
      .then(fetchedChannels => {
        if (!fetchedChannels) {
          setError('No channels found');
          return;
        }
        // Transform API response to store format
        const normalizedChannels: Channel[] = fetchedChannels.map(channel => ({
          id: channel.id,
          shortId: channel.id.slice(-10),
          name: channel.name,
          type: channel.type,
          createdAt: new Date(channel.created_at),
          updatedAt: new Date(channel.updated_at),
          members: channel.members.map(m => ({
            id: m.id,
            userId: m.user_id,
            channelId: m.channel_id,
            role: m.role,
            joinedAt: new Date(m.joined_at)
          }))
        }));
        setChannels(normalizedChannels);
        setError(null);
      })
      .catch(error => {
        console.error('Failed to load channels:', error);
        setError('Failed to load channels');
      });
  }, [loadChannels, setChannels]);

  const handleChannelClick = (channel: Channel) => {
    setActiveChannel(channel);
    navigate(`/${channel.shortId}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading channels...</div>
        </div>
      </div>
    );
  }

  if (error || channelsError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error || channelsError?.message || 'Failed to load channels'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Channels</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {channels.length === 0 ? (
          <div className="text-center text-gray-400 p-4">
            No channels available
          </div>
        ) : (
          channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelClick(channel)}
              className={`w-full text-left p-2 rounded-md ${
                activeChannel?.id === channel.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              # {channel.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}; 