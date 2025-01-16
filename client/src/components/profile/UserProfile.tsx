import { useAuthStore } from '../../stores';
import type { User } from '../../types/store.types';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
              <span className="text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-gray-800 ${
              user.status === 'online'
                ? 'bg-green-400'
                : user.status === 'away'
                ? 'bg-yellow-400'
                : 'bg-gray-400'
            }`}
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{user.name}</p>
          {user.customStatus && (
            <p className="text-xs text-gray-400">{user.customStatus}</p>
          )}
        </div>
      </div>
      <button
        onClick={logout}
        className="text-sm text-gray-400 hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
} 