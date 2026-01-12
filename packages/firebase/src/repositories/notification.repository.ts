import { where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { type Result, success, failure, ErrorCode, AppError } from '@tdc/types';
import {
  NotificationSchema,
  type Notification,
  type CreateNotificationInput,
  type NotificationType,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Notification repository for student notifications
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications', NotificationSchema);
  }

  /**
   * Create a new notification
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async createNotification(data: CreateNotificationInput): Promise<Result<Notification>> {
    return this.create({
      ...data,
      isRead: false,
      readAt: null,
    });
  }

  /**
   * Find all notifications for a user
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async findByUser(userId: string): Promise<Result<Notification[]>> {
    return this.findAll([
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ]);
  }

  /**
   * Find unread notifications for a user
   */
  async findUnreadByUser(userId: string): Promise<Result<Notification[]>> {
    return this.findAll([
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
    ]);
  }

  /**
   * Find notifications by type for a user
   */
  async findByUserAndType(
    userId: string,
    type: NotificationType
  ): Promise<Result<Notification[]>> {
    return this.findAll([
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
    ]);
  }

  /**
   * Mark a notification as read
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async markAsRead(notificationId: string): Promise<Result<Notification>> {
    try {
      const existing = await this.findById(notificationId);

      if (!existing.success) {
        return failure(new AppError(ErrorCode.USER_NOT_FOUND, 'Notification not found'));
      }

      if (existing.data.isRead) {
        // Already read, return as is
        return existing;
      }

      const docRef = doc(getFirebaseDb(), this.collectionName, notificationId);
      await updateDoc(docRef, {
        isRead: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Return updated notification
      const updated = await this.findById(notificationId);
      if (!updated.success) {
        return failure(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to fetch updated notification'));
      }

      return updated;
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsReadByUser(userId: string): Promise<Result<number>> {
    try {
      const unreadResult = await this.findUnreadByUser(userId);

      if (!unreadResult.success) {
        return failure(unreadResult.error);
      }

      let count = 0;
      for (const notification of unreadResult.data) {
        const result = await this.markAsRead(notification.id);
        if (result.success) {
          count++;
        }
      }

      return success(count);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Count unread notifications for a user
   */
  async countUnreadByUser(userId: string): Promise<Result<number>> {
    const result = await this.findUnreadByUser(userId);

    if (!result.success) {
      return failure(result.error);
    }

    return success(result.data.length);
  }
}

// Singleton export
export const notificationRepository = new NotificationRepository();
