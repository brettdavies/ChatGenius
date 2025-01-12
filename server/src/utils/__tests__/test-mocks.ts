import { User } from '../../types/user';
import { Channel } from '../../types/channel';
import { DatabaseEvent } from '../../types/events';
import { AuthenticatedRequest } from '../../middleware/auth';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
});

export const createMockAuthRequest = (overrides: Partial<AuthenticatedRequest> = {}): Partial<AuthenticatedRequest> => ({
  auth: {
    payload: {
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  },
  user: createMockUser(),
  ...overrides
});

export const createMockChannel = (overrides: Partial<Channel> = {}): Channel => ({
  id: 'test-channel-id',
  name: 'Test Channel',
  owner_id: 'test-user-id',
  is_private: false,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
});

export const createMockDatabaseEvent = <T>(
  eventType: string,
  data: T
): DatabaseEvent<T> => ({
  channel: 'test-channel',
  operation: 'INSERT',
  schema: 'public',
  table: 'test_table',
  data
}); 