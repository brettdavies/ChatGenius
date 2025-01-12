import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNavStore } from '../../stores/navStore';

export const NavigationPanel: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { activeChannel, setActiveChannel } = useNavStore();

  // Placeholder data - will be replaced with data from store
  const channels = [
    { id: 'general', name: 'general' },
    { id: 'random', name: 'random' }
  ];

  const handleChannelClick = (channelId: string) => {
    setActiveChannel(channelId);
    navigate(`/client/${workspaceId}/channel/${channelId}`);
  };

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Channels</h2>
      </div>
      <div className="p-2">
        {channels.map(channel => (
          <button
            key={channel.id}
            onClick={() => handleChannelClick(channel.id)}
            className={`w-full text-left p-2 rounded-md ${
              activeChannel === channel.id
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            # {channel.name}
          </button>
        ))}
      </div>
    </div>
  );
}; 