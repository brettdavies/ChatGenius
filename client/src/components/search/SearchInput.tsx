import { useState, useEffect } from 'react';
import { useMessageStore } from '../../stores';
import { MagnifyingGlassIcon, XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchMessages = useMessageStore((state) => state.searchMessages);
  const clearSearch = useMessageStore((state) => state.clearSearch);
  const searchFilters = useMessageStore((state) => state.searchFilters);

  useEffect(() => {
    if (debouncedQuery) {
      searchMessages(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery, searchMessages, clearSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('message-search');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape to clear search when focused
      if (e.key === 'Escape' && isFocused) {
        e.preventDefault();
        handleClear();
        const searchInput = document.getElementById('message-search');
        if (searchInput) {
          searchInput.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

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

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        id="message-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-10 pr-20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6"
        placeholder="Search messages... (⌘K)"
      />
      <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
        {query && (
          <button
            onClick={handleClear}
            className="hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
        )}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="hover:text-gray-300"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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