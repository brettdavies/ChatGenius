import { ulid } from 'ulid';
import bcrypt from 'bcryptjs';
import { User } from '../auth/types.js';
import { UserRole } from '../constants/auth.constants.js';
import { upsertUser, findUserByEmail, findUserById, softDeleteUser } from '../db/queries/users.js';

export class UserError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export class UserService {
  /**
   * Creates a new user account
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
    const user = await upsertUser(ulid(), {
      email: input.email,
      password: hashedPassword,
      username: input.username,
      role: input.role || 'user'
    }, true);

    if (!user) {
      throw new UserError('CREATE_FAILED', 'Failed to create user');
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
   * @throws {UserError} If user not found, email taken, or update fails
   * @returns The updated user object
   */
  async updateUser(id: string, updates: {
    email?: string;
    password?: string;
    username?: string;
    role?: UserRole;
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
} 