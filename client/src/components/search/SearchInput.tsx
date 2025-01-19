import { useState } from 'react';
import { useMessageStore } from '../../stores';
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const searchFilters = useMessageStore((state) => state.searchFilters);
  const searchMessages = useMessageStore((state) => state.searchMessages);
  const clearSearch = useMessageStore((state) => state.clearSearch);

  // Get active filters for display
  const getActiveFilters = () => {
    const filters: string[] = [];
    
    if (searchFilters.channels.include.length > 0) {
      filters.push(`channel:${searchFilters.channels.include.join(',')}`);
    }
    if (searchFilters.channels.exclude.length > 0) {
      filters.push(`-channel:${searchFilters.channels.exclude.join(',')}`);
    }
    if (searchFilters.users.include.length > 0) {
      filters.push(`user:@${searchFilters.users.include.join(',@')}`);
    }
    if (searchFilters.users.exclude.length > 0) {
      filters.push(`-user:@${searchFilters.users.exclude.join(',@')}`);
    }
    if (searchFilters.hasThread) {
      filters.push('has:thread');
    }
    if (searchFilters.excludeThread) {
      filters.push('-has:thread');
    }
    if (searchFilters.dateRange?.before) {
      filters.push(`before:${searchFilters.dateRange.before}`);
    }
    if (searchFilters.dateRange?.after) {
      filters.push(`after:${searchFilters.dateRange.after}`);
    }

    return filters;
  };

  const handleClear = () => {
    setQuery('');
    clearSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      searchMessages(query);
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          id="message-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search messages..."
          className="w-full rounded-md bg-gray-700 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-8 text-gray-400 hover:text-gray-300"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="absolute right-2 text-gray-400 hover:text-gray-300"
        >
          <QuestionMarkCircleIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Active Filters */}
      {getActiveFilters().length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {getActiveFilters().map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-md bg-gray-600 px-2 py-0.5 text-xs text-gray-200"
            >
              {filter}
            </span>
          ))}
        </div>
      )}

      {/* Search Help Tooltip */}
      {showHelp && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setShowHelp(false)}
          />
          <div className="absolute left-0 mt-2 w-80 rounded-md bg-gray-900 p-4 shadow-lg ring-1 ring-gray-700 z-[61]">
            <h3 className="mb-2 font-medium text-gray-200">Search Filters</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><code>channel:name</code> - Search in channel</p>
              <p><code>user:@name</code> - Search user's messages</p>
              <p><code>has:thread</code> - Messages with replies</p>
              <p><code>before:YYYYMMDD</code> - Before date</p>
              <p><code>after:YYYYMMDD</code> - After date</p>
              <p><code>-filter</code> - Exclude (e.g. -channel:name)</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 