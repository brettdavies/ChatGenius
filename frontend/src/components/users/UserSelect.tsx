import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { User } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import { authenticatedApi } from '@/lib/api/authenticatedClient';

interface UserSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxUsers?: number;
}

export function UserSelect({ value, onChange, maxUsers }: UserSelectProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // Setup authenticated API call
  const { execute: fetchUsers, isLoading } = authenticatedApi.useGet<User[]>(
    '/users',
    undefined,
    {
      onError: (err) => console.error('Failed to load users:', err)
    }
  );

  useEffect(() => {
    fetchUsers().then(fetchedUsers => {
      if (fetchedUsers) {
        setUsers(fetchedUsers);
      }
    });
  }, [fetchUsers]);

  const selectedUsers = users.filter(user => value.includes(user.id));
  const filteredUsers = query === ''
    ? users
    : users.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (user: User) => {
    if (value.includes(user.id)) {
      onChange(value.filter(id => id !== user.id));
    } else if (!maxUsers || value.length < maxUsers) {
      onChange([...value, user.id]);
    }
  };

  return (
    <div className="relative mt-1">
      <Combobox value={selectedUsers} onChange={handleSelect} multiple>
        <div className="relative">
          <Combobox.Input
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(users: User[]) => 
              users.map(user => user.name).join(', ')
            }
            placeholder="Search users..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {isLoading ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              Loading...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Combobox.Option
                key={user.id}
                value={user}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ active, selected }) => (
                  <div className="flex items-center">
                    <Avatar src={user.avatar_url} name={user.name} size="sm" />
                    <span className={`ml-3 truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {user.name}
                    </span>
                    {selected && (
                      <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                        active ? 'text-white' : 'text-indigo-600'
                      }`}>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>

      {selectedUsers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <span
              key={user.id}
              className="inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2 pr-0.5 text-sm font-medium text-indigo-700"
            >
              {user.name}
              <button
                type="button"
                onClick={() => handleSelect(user)}
                className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
              >
                <span className="sr-only">Remove {user.name}</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 