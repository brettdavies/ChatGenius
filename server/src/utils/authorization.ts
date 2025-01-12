import { Pool } from 'pg';
import { pool } from '../config/database';

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
  | 'view'    // View channel content
  | 'archive'; // Archive channel

/**
 * Authorization result with optional reason for denial
 */
export interface AuthResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Channel authorization interface
 */
export interface ChannelAuthorization {
  checkPermission(userId: string, operation: ChannelOperation, channelId?: string): Promise<AuthResult>;
  canCreateChannel(userId: string): Promise<AuthResult>;
  canManageChannel(userId: string, channelId: string, operation: Exclude<ChannelOperation, 'create'>): Promise<AuthResult>;
  canViewChannel(userId: string, channelId?: string): Promise<AuthResult>;
  canDeleteChannel(userId: string, channelId: string): Promise<AuthResult>;
  canArchiveChannel(userId: string, channelId: string): Promise<AuthResult>;
  canUpdateChannel(userId: string, channelId: string): Promise<AuthResult>;
}

/**
 * Stub implementation of channel authorization
 * This will be replaced with proper RBAC implementation
 */
export class ChannelAuthorizationStub implements ChannelAuthorization {
  constructor(private pool: Pool) {}

  public async checkPermission(
    userId: string,
    operation: ChannelOperation,
    channelId?: string
  ): Promise<AuthResult> {
    switch (operation) {
      case 'create':
        return this.canCreateChannel(userId);
      case 'delete':
        return channelId ? this.canDeleteChannel(userId, channelId) : { allowed: false, reason: 'Channel ID required' };
      case 'archive':
        return channelId ? this.canArchiveChannel(userId, channelId) : { allowed: false, reason: 'Channel ID required' };
      case 'update':
      case 'invite':
      case 'remove':
        return channelId ? this.canManageChannel(userId, channelId, operation) : { allowed: false, reason: 'Channel ID required' };
      case 'view':
        return this.canViewChannel(userId, channelId);
      default:
        return { allowed: false, reason: 'Unknown operation' };
    }
  }

  public async canCreateChannel(userId: string): Promise<AuthResult> {
    // For now, all authenticated users can create channels
    return { allowed: true };
  }

  public async canManageChannel(
    userId: string,
    channelId: string,
    operation: Exclude<ChannelOperation, 'create'>
  ): Promise<AuthResult> {
    // For now, all authenticated users can manage channels they can view
    const viewResult = await this.canViewChannel(userId, channelId);
    return viewResult;
  }

  public async canViewChannel(userId: string, channelId?: string): Promise<AuthResult> {
    // For now, all authenticated users can view all channels
    return { allowed: true };
  }

  public async canDeleteChannel(userId: string, channelId: string): Promise<AuthResult> {
    // Check if user is channel owner or admin
    const result = await this.pool.query(
      'SELECT owner_id FROM channels WHERE id = $1',
      [channelId]
    );

    if (result.rows.length === 0) {
      return { allowed: false, reason: 'Channel not found' };
    }

    const isOwner = result.rows[0].owner_id === userId;
    return {
      allowed: isOwner,
      reason: isOwner ? undefined : 'Only channel owner can delete channel'
    };
  }

  public async canArchiveChannel(userId: string, channelId: string): Promise<AuthResult> {
    // Check if user is channel owner or admin
    const result = await this.pool.query(
      'SELECT owner_id FROM channels WHERE id = $1',
      [channelId]
    );

    if (result.rows.length === 0) {
      return { allowed: false, reason: 'Channel not found' };
    }

    const isOwner = result.rows[0].owner_id === userId;
    return {
      allowed: isOwner,
      reason: isOwner ? undefined : 'Only channel owner can archive channel'
    };
  }

  public async canUpdateChannel(userId: string, channelId: string): Promise<AuthResult> {
    // Check if user is channel owner or admin
    const result = await this.pool.query(
      'SELECT owner_id FROM channels WHERE id = $1',
      [channelId]
    );

    if (result.rows.length === 0) {
      return { allowed: false, reason: 'Channel not found' };
    }

    const isOwner = result.rows[0].owner_id === userId;
    return {
      allowed: isOwner,
      reason: isOwner ? undefined : 'Only channel owner can update channel'
    };
  }
}

// Export singleton instance
export const channelAuth = new ChannelAuthorizationStub(pool); 