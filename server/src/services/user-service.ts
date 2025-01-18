import { ulid } from 'ulid';
import bcrypt from 'bcryptjs';
import { User } from '../auth/types.js';
import { UserRole } from '../constants/auth.constants.js';
import { upsertUser, findUserByEmail, findUserById, softDeleteUser, findUsersByIds } from '../db/queries/users.js';
import { TOTPService } from '../services/totp-service.js';
import { ChannelService } from '../services/channel-service.js';
import { searchChannels, addChannelMember } from '../db/queries/channels.js';
import { getAvatarUrl } from '../utils/avatar.js';

export class UserError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export class UserService {
  private channelService = new ChannelService();

  /**
   * Ensures the general channel exists, creates it if it doesn't
   * @returns The general channel ID
   */
  private async ensureGeneralChannel(userId: string): Promise<string> {
    const { channels } = await searchChannels({
      name: 'general',
      type: 'public'
    });

    if (channels.length > 0) {
      return channels[0].id;
    }

    const channel = await this.channelService.createChannel({
      name: 'general',
      description: 'Welcome to ChatGenius! This is the general channel for all users.',
      type: 'public',
      createdBy: userId
    });

    return channel.id;
  }

  /**
   * Creates a new user account and adds them to the general channel
   * @param input - User registration data
   * @param input.email - User's email address (must be unique)
   * @param input.password - User's password (will be hashed)
   * @param input.username - User's display name
   * @param input.role - User's role (defaults to 'user')
   * @throws {UserError} If email is already taken or user creation fails
   * @returns The created user object
   */
  async createUser(input: {
    email: string;
    password: string;
    username: string;
    role?: UserRole;
  }): Promise<User> {
    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
      throw new UserError('EMAIL_TAKEN', 'Email is already taken');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const avatarUrl = await getAvatarUrl(input.email, input.username);

    const user = await upsertUser(ulid(), {
      email: input.email,
      password: hashedPassword,
      username: input.username,
      role: input.role || 'user',
      avatarUrl
    }, true);

    if (!user) {
      throw new UserError('CREATE_FAILED', 'Failed to create user');
    }

    try {
      // Add user to general channel
      const generalChannelId = await this.ensureGeneralChannel(user.id);
      await addChannelMember(generalChannelId, user.id, 'member');
    } catch (error) {
      console.error('Failed to add user to general channel:', error);
      // Don't fail user creation if adding to general channel fails
    }

    return user;
  }

  /**
   * Updates an existing user's profile
   * @param id - User's ID (ULID)
   * @param updates - Fields to update
   * @param updates.email - New email address (optional)
   * @param updates.password - New password (optional, will be hashed)
   * @param updates.username - New username (optional)
   * @param updates.role - New role (optional)
   * @param updates.totpSecret - New TOTP secret (optional)
   * @param updates.totpEnabled - New TOTP enabled status (optional)
   * @param updates.backupCodes - New backup codes (optional)
   * @param updates.totpVerifiedAt - New TOTP verified at timestamp (optional)
   * @throws {UserError} If user not found, email taken, or update fails
   * @returns The updated user object
   */
  async updateUser(id: string, updates: {
    email?: string;
    password?: string;
    username?: string;
    role?: UserRole;
    totpSecret?: string;
    totpEnabled?: boolean;
    backupCodes?: string[];
    totpVerifiedAt?: Date;
  }): Promise<User> {
    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      throw new UserError('USER_NOT_FOUND', 'User not found');
    }

    // If email is being updated, check it's not taken
    if (updates.email && updates.email !== existingUser.email) {
      const emailTaken = await findUserByEmail(updates.email);
      if (emailTaken) {
        throw new UserError('EMAIL_TAKEN', 'Email is already taken');
      }
    }

    // Hash new password if provided
    const updateData = { ...updates };
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await upsertUser(id, updateData);
    if (!user) {
      throw new UserError('UPDATE_FAILED', 'Failed to update user');
    }

    return user;
  }

  /**
   * Retrieves a user by their ID
   * @param id - User's ID (ULID)
   * @throws {UserError} If user not found
   * @returns The user object
   */
  async getUserById(id: string): Promise<User> {
    const user = await findUserById(id);
    if (!user) {
      throw new UserError('USER_NOT_FOUND', 'User not found');
    }
    return user;
  }

  /**
   * Retrieves a user by their email address
   * @param email - User's email address
   * @throws {UserError} If user not found
   * @returns The user object
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new UserError('USER_NOT_FOUND', 'User not found');
    }
    return user;
  }

  /**
   * Verifies a user's password
   * @param userId - User's ID (ULID)
   * @param password - Password to verify
   * @throws {UserError} If user not found or password invalid
   */
  async verifyPassword(userId: string, password: string): Promise<void> {
    const user = await this.getUserById(userId);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UserError('INVALID_PASSWORD', 'Invalid password');
    }
  }

  /**
   * Soft deletes a user account
   * @param id - User's ID (ULID)
   * @throws {UserError} If user not found or deletion fails
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      throw new UserError('USER_NOT_FOUND', 'User not found');
    }

    // Soft delete the user
    const deleted = await softDeleteUser(id);
    if (!deleted) {
      throw new UserError('DELETE_FAILED', 'Failed to delete user');
    }
  }

  /**
   * Retrieves multiple users by their IDs
   * @param ids - Array of user IDs (ULIDs)
   * @returns Array of found user objects (missing users are omitted)
   */
  async getUsersByIds(ids: string[]): Promise<User[]> {
    return findUsersByIds(ids);
  }

  /**
   * Verifies and enables TOTP for a user
   * @param userId - User's ID
   * @param token - TOTP token for verification
   * @throws {UserError} If user not found, token invalid, or update fails
   * @returns The updated user object
   */
  async verifyAndEnableTOTP(userId: string, token: string): Promise<User> {
    // Check if user exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      throw new UserError('USER_NOT_FOUND', 'User not found');
    }

    // Check if TOTP is already enabled
    if (existingUser.totpEnabled) {
      throw new UserError('TOTP_ALREADY_ENABLED', '2FA is already enabled');
    }

    // Check if TOTP secret exists
    if (!existingUser.totpSecret) {
      throw new UserError('TOTP_NOT_SETUP', '2FA setup not initiated');
    }

    // Validate the token
    const totpService = new TOTPService();
    const isValid = totpService.validateToken(existingUser.totpSecret, token);
    if (!isValid) {
      throw new UserError('INVALID_TOKEN', 'Invalid TOTP token');
    }

    // Update user with verified TOTP
    const updateData = {
      totpEnabled: true,
      totpVerifiedAt: new Date()
    };

    const user = await upsertUser(userId, updateData);
    if (!user) {
      throw new UserError('UPDATE_FAILED', 'Failed to update user');
    }

    return user;
  }
} 