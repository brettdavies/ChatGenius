import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateChannelModal } from '../channels/CreateChannelModal';

export function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">ChatGenius</h1>
      </div>
      
      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase">Channels</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 rounded hover:bg-gray-700"
              title="Create Channel"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Channel list will go here */}
          <div className="space-y-1">
            {/* Channel items */}
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      <CreateChannelModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 