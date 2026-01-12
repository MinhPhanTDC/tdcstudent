import { type Result, failure, AppError, ErrorCode } from '@tdc/types';
import { type Notification, type NotificationType } from '@tdc/schemas';
import { notificationRepository } from '../repositories/notification.repository';

/**
 * Notification creation result
 */
export interface NotificationResult {
  notification: Notification;
}

/**
 * Completion notification input
 */
export interface CompletionNotificationInput {
  studentId: string;
  courseId: string;
  courseName: string;
}

/**
 * Rejection notification input
 */
export interface RejectionNotificationInput {
  studentId: string;
  courseId: string;
  courseName: string;
  rejectionReason: string;
}

/**
 * Course unlock notification input
 */
export interface CourseUnlockNotificationInput {
  studentId: string;
  courseId: string;
  courseName: string;
}

/**
 * Semester unlock notification input
 */
export interface SemesterUnlockNotificationInput {
  studentId: string;
  semesterId: string;
  semesterName: string;
}

/**
 * Create a completion notification
 * Requirements: 8.1
 * 
 * @param input - Completion notification input
 * @returns The created notification
 */
export function createCompletionNotificationData(
  input: CompletionNotificationInput
): {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
} {
  return {
    userId: input.studentId,
    type: 'course_completed',
    title: 'Chúc mừng! Bạn đã hoàn thành môn học',
    message: `Bạn đã hoàn thành môn học "${input.courseName}". Tiếp tục phát huy nhé!`,
    metadata: {
      courseId: input.courseId,
      courseName: input.courseName,
    },
  };
}

/**
 * Create a rejection notification
 * Requirements: 8.2
 * 
 * @param input - Rejection notification input
 * @returns The created notification data
 */
export function createRejectionNotificationData(
  input: RejectionNotificationInput
): {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
} {
  return {
    userId: input.studentId,
    type: 'course_rejected',
    title: 'Yêu cầu hoàn thành môn học bị từ chối',
    message: `Yêu cầu hoàn thành môn học "${input.courseName}" đã bị từ chối. Lý do: ${input.rejectionReason}`,
    metadata: {
      courseId: input.courseId,
      courseName: input.courseName,
      rejectionReason: input.rejectionReason,
    },
  };
}

/**
 * Create a course unlock notification
 * Requirements: 8.3
 * 
 * @param input - Course unlock notification input
 * @returns The created notification data
 */
export function createCourseUnlockNotificationData(
  input: CourseUnlockNotificationInput
): {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
} {
  return {
    userId: input.studentId,
    type: 'course_unlocked',
    title: 'Môn học mới đã mở khóa',
    message: `Chúc mừng! Bạn đã mở khóa môn học "${input.courseName}".`,
    metadata: {
      courseId: input.courseId,
      courseName: input.courseName,
    },
  };
}

/**
 * Create a semester unlock notification
 * Requirements: 8.4
 * 
 * @param input - Semester unlock notification input
 * @returns The created notification data
 */
export function createSemesterUnlockNotificationData(
  input: SemesterUnlockNotificationInput
): {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
} {
  return {
    userId: input.studentId,
    type: 'semester_unlocked',
    title: 'Học kỳ mới đã mở khóa',
    message: `Chúc mừng! Bạn đã hoàn thành học kỳ và mở khóa "${input.semesterName}".`,
    metadata: {
      semesterId: input.semesterId,
      semesterName: input.semesterName,
    },
  };
}

/**
 * Notification service for creating and managing notifications
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export const notificationService = {
  /**
   * Create a completion notification for a student
   * Requirements: 8.1
   * 
   * @param input - Completion notification input
   * @returns The created notification
   */
  async createCompletionNotification(
    input: CompletionNotificationInput
  ): Promise<Result<Notification>> {
    const data = createCompletionNotificationData(input);
    return notificationRepository.createNotification(data);
  },

  /**
   * Create a rejection notification for a student
   * Requirements: 8.2
   * 
   * @param input - Rejection notification input
   * @returns The created notification
   */
  async createRejectionNotification(
    input: RejectionNotificationInput
  ): Promise<Result<Notification>> {
    if (!input.rejectionReason || input.rejectionReason.trim().length === 0) {
      return failure(new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Lý do từ chối không được để trống'
      ));
    }

    const data = createRejectionNotificationData(input);
    return notificationRepository.createNotification(data);
  },

  /**
   * Create a course unlock notification for a student
   * Requirements: 8.3
   * 
   * @param input - Course unlock notification input
   * @returns The created notification
   */
  async createCourseUnlockNotification(
    input: CourseUnlockNotificationInput
  ): Promise<Result<Notification>> {
    const data = createCourseUnlockNotificationData(input);
    return notificationRepository.createNotification(data);
  },

  /**
   * Create a semester unlock notification for a student
   * Requirements: 8.4
   * 
   * @param input - Semester unlock notification input
   * @returns The created notification
   */
  async createSemesterUnlockNotification(
    input: SemesterUnlockNotificationInput
  ): Promise<Result<Notification>> {
    const data = createSemesterUnlockNotificationData(input);
    return notificationRepository.createNotification(data);
  },

  /**
   * Get all notifications for a user
   * 
   * @param userId - The user's ID
   * @returns List of notifications
   */
  async getNotificationsForUser(userId: string): Promise<Result<Notification[]>> {
    return notificationRepository.findByUser(userId);
  },

  /**
   * Get unread notifications for a user
   * 
   * @param userId - The user's ID
   * @returns List of unread notifications
   */
  async getUnreadNotificationsForUser(userId: string): Promise<Result<Notification[]>> {
    return notificationRepository.findUnreadByUser(userId);
  },

  /**
   * Mark a notification as read
   * 
   * @param notificationId - The notification's ID
   * @returns The updated notification
   */
  async markAsRead(notificationId: string): Promise<Result<Notification>> {
    return notificationRepository.markAsRead(notificationId);
  },

  /**
   * Mark all notifications as read for a user
   * 
   * @param userId - The user's ID
   * @returns Number of notifications marked as read
   */
  async markAllAsRead(userId: string): Promise<Result<number>> {
    return notificationRepository.markAllAsReadByUser(userId);
  },

  /**
   * Count unread notifications for a user
   * 
   * @param userId - The user's ID
   * @returns Number of unread notifications
   */
  async countUnread(userId: string): Promise<Result<number>> {
    return notificationRepository.countUnreadByUser(userId);
  },
};
