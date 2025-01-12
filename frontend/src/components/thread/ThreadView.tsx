import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavStore } from '../../stores/navStore';

export const ThreadView: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const toggleDetailPanel = useNavStore(state => state.toggleDetailPanel);

  // Use threadId to fetch thread data
  React.useEffect(() => {
    if (threadId) {
      // TODO: Fetch thread data
      console.warn('Thread fetching not implemented:', threadId);
    }
  }, [threadId]);

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Thread</h2>
        <button
          onClick={() => toggleDetailPanel()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Thread content will go here */}
        <p className="text-gray-500">Thread content for ID: {threadId}</p>
      </div>
    </div>
  );
}; 