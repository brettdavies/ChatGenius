import { ChannelAuthorization, channelAuth } from '../authorization';
import type { AuthResult } from '../authorization';

describe('Channel Authorization', () => {
  const userId = '01H5XZK6J3V2857AWC8C9M5DQ3';
  const channelId = '01H5XZK6J3V2857AWC8C9M5DQ4';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('channel operations', () => {
    it('should allow creating a channel', async () => {
      const result = await channelAuth.canCreateChannel(userId);
      expect(result.allowed).toBe(true);
    });

    it('should allow deleting a channel', async () => {
      const result = await channelAuth.canDeleteChannel(userId, channelId);
      expect(result.allowed).toBe(true);
    });

    it('should allow updating a channel', async () => {
      const result = await channelAuth.canUpdateChannel(userId, channelId);
      expect(result.allowed).toBe(true);
    });

    it('should allow archiving a channel', async () => {
      const result = await channelAuth.canArchiveChannel(userId, channelId);
      expect(result.allowed).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid user IDs', async () => {
      const result = await channelAuth.canCreateChannel('');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid user ID');
    });

    it('should handle invalid channel IDs', async () => {
      const result = await channelAuth.canDeleteChannel(userId, '');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid channel ID');
    });
  });
}); 