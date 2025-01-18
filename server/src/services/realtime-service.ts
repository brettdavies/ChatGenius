import { ErrorCodes } from '../openapi/schemas/common.js';

export enum ChannelEventType {
  CHANNEL_CREATED = 'CHANNEL_CREATED',
  CHANNEL_UPDATED = 'CHANNEL_UPDATED',
  CHANNEL_ARCHIVED = 'CHANNEL_ARCHIVED',
  CHANNEL_DELETED = 'CHANNEL_DELETED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_LEFT = 'MEMBER_LEFT',
  MEMBER_UPDATED = 'MEMBER_UPDATED',
  MESSAGE_CREATED = 'MESSAGE_CREATED',
  MESSAGE_UPDATED = 'MESSAGE_UPDATED',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  THREAD_MESSAGE_CREATED = 'THREAD_MESSAGE_CREATED',
  REACTION_ADDED = 'REACTION_ADDED',
  REACTION_REMOVED = 'REACTION_REMOVED',
  TYPING_STARTED = 'TYPING_STARTED',
  TYPING_STOPPED = 'TYPING_STOPPED',
  PRESENCE_CHANGED = 'PRESENCE_CHANGED'
}

export interface ChannelEvent {
  type: ChannelEventType;
  channelId: string;
  userId: string;
  timestamp: Date;
  data?: any;
}

export interface ChannelSubscription {
  channelId: string;
  userId: string;
  res: any;
}

export class RealtimeError extends Error {
  constructor(public code: typeof ErrorCodes[keyof typeof ErrorCodes], message: string) {
    super(message);
    this.name = 'RealtimeError';
  }
}

export class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, ChannelSubscription[]>;
  private typingUsers: Map<string, Set<string>>;

  private constructor() {
    this.subscriptions = new Map();
    this.typingUsers = new Map();
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  async emit(event: ChannelEvent): Promise<void> {
    try {
      if (!event.channelId || !event.userId) {
        throw new RealtimeError(
          ErrorCodes.INVALID_REQUEST,
          'Channel ID and user ID are required'
        );
      }

      const subs = this.subscriptions.get(event.channelId) || [];
      const eventData = {
        ...event,
        timestamp: event.timestamp.toISOString()
      };

      subs.forEach(sub => {
        try {
          sub.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
        } catch (error) {
          console.error('[RealtimeService] Failed to emit event to subscriber:', error);
          // Don't throw here to avoid breaking other subscribers
        }
      });
    } catch (error) {
      console.error('[RealtimeService] Failed to emit event:', error);
      throw new RealtimeError(
        ErrorCodes.EVENT_SUBSCRIPTION_FAILED,
        'Failed to emit event'
      );
    }
  }

  async subscribe(channelId: string, userId: string, res: any): Promise<void> {
    try {
      if (!channelId || !userId || !res) {
        throw new RealtimeError(
          ErrorCodes.INVALID_REQUEST,
          'Channel ID, user ID, and response object are required'
        );
      }

      const subs = this.subscriptions.get(channelId) || [];
      subs.push({ channelId, userId, res });
      this.subscriptions.set(channelId, subs);
    } catch (error) {
      console.error('[RealtimeService] Failed to subscribe:', error);
      throw new RealtimeError(
        ErrorCodes.EVENT_SUBSCRIPTION_FAILED,
        'Failed to subscribe to channel events'
      );
    }
  }

  async unsubscribe(channelId: string, userId: string): Promise<void> {
    try {
      if (!channelId || !userId) {
        throw new RealtimeError(
          ErrorCodes.INVALID_REQUEST,
          'Channel ID and user ID are required'
        );
      }

      const subs = this.subscriptions.get(channelId) || [];
      const filtered = subs.filter(sub => sub.userId !== userId);
      if (filtered.length > 0) {
        this.subscriptions.set(channelId, filtered);
      } else {
        this.subscriptions.delete(channelId);
      }
    } catch (error) {
      console.error('[RealtimeService] Failed to unsubscribe:', error);
      throw new RealtimeError(
        ErrorCodes.EVENT_SUBSCRIPTION_FAILED,
        'Failed to unsubscribe from channel events'
      );
    }
  }

  async startTyping(channelId: string, userId: string): Promise<void> {
    try {
      if (!channelId || !userId) {
        throw new RealtimeError(
          ErrorCodes.INVALID_REQUEST,
          'Channel ID and user ID are required'
        );
      }

      const typingSet = this.typingUsers.get(channelId) || new Set();
      if (!typingSet.has(userId)) {
        typingSet.add(userId);
        this.typingUsers.set(channelId, typingSet);
        await this.emit({
          type: ChannelEventType.TYPING_STARTED,
          channelId,
          userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('[RealtimeService] Failed to start typing:', error);
      throw new RealtimeError(
        ErrorCodes.TYPING_START_FAILED,
        'Failed to start typing indicator'
      );
    }
  }

  async stopTyping(channelId: string, userId: string): Promise<void> {
    try {
      if (!channelId || !userId) {
        throw new RealtimeError(
          ErrorCodes.INVALID_REQUEST,
          'Channel ID and user ID are required'
        );
      }

      const typingSet = this.typingUsers.get(channelId);
      if (typingSet?.has(userId)) {
        typingSet.delete(userId);
        if (typingSet.size === 0) {
          this.typingUsers.delete(channelId);
        }
        await this.emit({
          type: ChannelEventType.TYPING_STOPPED,
          channelId,
          userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('[RealtimeService] Failed to stop typing:', error);
      throw new RealtimeError(
        ErrorCodes.TYPING_STOP_FAILED,
        'Failed to stop typing indicator'
      );
    }
  }

  async updatePresence(channelId: string, userId: string, isOnline: boolean): Promise<void> {
    try {
      if (!channelId || !userId) {
        throw new RealtimeError(
          ErrorCodes.INVALID_REQUEST,
          'Channel ID and user ID are required'
        );
      }

      await this.emit({
        type: ChannelEventType.PRESENCE_CHANGED,
        channelId,
        userId,
        timestamp: new Date(),
        data: { isOnline }
      });
    } catch (error) {
      console.error('[RealtimeService] Failed to update presence:', error);
      throw new RealtimeError(
        ErrorCodes.PRESENCE_UPDATE_FAILED,
        'Failed to update presence status'
      );
    }
  }
} 