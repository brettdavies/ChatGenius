/**
 * Authorization service interface for channel operations.
 * This is a temporary stub that will be replaced with proper RBAC implementation.
 */

/**
 * Channel operation types that can be authorized
 */
export type ChannelOperation = 
  | 'create'  // Create a new channel
  | 'delete'  // Delete a channel
  | 'update'  // Update channel settings
  | 'invite'  // Invite members
  | 'remove'  // Remove members
  | 'view';   // View channel content

/**
 * Authorization result with optional reason for denial
 */
export interface AuthResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Stub implementation of channel authorization.
 * Currently returns true for all operations.
 * Will be replaced by proper RBAC system (CORE-F-004).
 */
export class ChannelAuthorization {
  /**
   * Check if a user can perform an operation on a channel
   * @param userId - ULID of the user
   * @param operation - Type of operation being performed
   * @param channelId - ULID of the channel (optional, not needed for create)
   * @returns Promise<AuthResult> - Always returns {allowed: true} in stub
   */
  public async checkPermission(
    userId: string,
    operation: ChannelOperation,
    channelId?: string
  ): Promise<AuthResult> {
    // Log the check for debugging and future metrics
    console.log(`Auth check - User: ${userId}, Operation: ${operation}, Channel: ${channelId || 'N/A'}`);
    
    // Stub implementation always returns true
    return {
      allowed: true
    };
  }

  /**
   * Convenience method for channel creation authorization
   * @param userId - ULID of the user attempting to create a channel
   * @returns Promise<AuthResult> - Always returns {allowed: true} in stub
   */
  public async canCreateChannel(userId: string): Promise<AuthResult> {
    return this.checkPermission(userId, 'create');
  }

  /**
   * Convenience method for channel management authorization
   * @param userId - ULID of the user
   * @param channelId - ULID of the channel
   * @param operation - Type of operation being performed
   * @returns Promise<AuthResult> - Always returns {allowed: true} in stub
   */
  public async canManageChannel(
    userId: string,
    channelId: string,
    operation: Exclude<ChannelOperation, 'create'>
  ): Promise<AuthResult> {
    return this.checkPermission(userId, operation, channelId);
  }
}

// Export a singleton instance
export const channelAuth = new ChannelAuthorization(); 