import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavStore } from '../../stores/navStore';

export const ProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const toggleDetailPanel = useNavStore(state => state.toggleDetailPanel);

  // Placeholder user data - will be replaced with data from userStore
  const user = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://via.placeholder.com/100',
    status: 'online',
    title: 'Software Engineer',
    timezone: 'UTC-8'
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Profile</h2>
        <button
          onClick={() => toggleDetailPanel()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          Close
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full"
          />
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <div className="text-sm text-gray-500">{user.email}</div>
          
          <div className="w-full max-w-md space-y-4 mt-6">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500">Status</span>
              <span className="font-medium">{user.status}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500">Title</span>
              <span className="font-medium">{user.title}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500">Timezone</span>
              <span className="font-medium">{user.timezone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 