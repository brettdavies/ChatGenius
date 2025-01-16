import { useEffect } from 'react';
import { useAuthStore, useChannelStore, useUserStore } from './stores';
import MainLayout from './components/layout/MainLayout';
import Channel from './components/channel/Channel';

// Mock data for development
const MOCK_USER = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  status: 'online' as const,
};

const MOCK_CHANNELS = [
  {
    id: '1',
    name: 'general',
    description: 'General discussion',
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'random',
    description: 'Random stuff',
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  const login = useAuthStore((state) => state.login);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setChannels = useChannelStore((state) => state.setChannels);
  const setOnlineUsers = useUserStore((state) => state.setOnlineUsers);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  // Initialize app with mock data
  useEffect(() => {
    // Simulate login
    login('mock-token');
    setCurrentUser(MOCK_USER);
    
    // Set mock channels
    setChannels(MOCK_CHANNELS);
    setActiveChannel(MOCK_CHANNELS[0].id); // Set first channel as active
    
    // Set mock online users
    setOnlineUsers([MOCK_USER.id]);
  }, [login, setCurrentUser, setChannels, setActiveChannel, setOnlineUsers]);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-white">
      <MainLayout>
        <Channel />
      </MainLayout>
    </div>
  );
} 