'use client';

import { cn } from '@tdc/ui';
import type { Notification, NotificationType } from '@tdc/schemas';

export interface NotificationItemProps {
  /** The notification to display */
  notification: Notification;
  /** Callback when notification is clicked to mark as read */
  onMarkAsRead: (id: string) => void;
}

/**
 * Get icon based on notification type
 * Requirements: 2.7, 2.8, 2.9
 */
function getNotificationIcon(type: NotificationType): JSX.Element {
  switch (type) {
    case 'course_completed':
    case 'lab_verification_approved':
      // Success - checkmark icon (Requirements: 2.7)
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'course_rejected':
    case 'lab_verification_rejected':
      // Warning - alert icon (Requirements: 2.8)
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case 'course_unlocked':
      // Info - unlock icon (Requirements: 2.9)
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
          />
        </svg>
      );
    case 'semester_unlocked':
      // Info - calendar icon
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    case 'lab_verification_pending':
      // Info - clock icon
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      // Default - bell icon
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      );
  }
}

/**
 * Get styling based on notification type
 * Requirements: 2.7, 2.8, 2.9
 */
function getNotificationStyles(type: NotificationType): {
  iconBg: string;
  iconColor: string;
} {
  switch (type) {
    case 'course_completed':
    case 'lab_verification_approved':
      // Success styling (Requirements: 2.7)
      return {
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
      };
    case 'course_rejected':
    case 'lab_verification_rejected':
      // Warning styling (Requirements: 2.8)
      return {
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
      };
    case 'course_unlocked':
    case 'semester_unlocked':
    case 'lab_verification_pending':
    default:
      // Info styling (Requirements: 2.9)
      return {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      };
  }
}

/**
 * Format date to Vietnamese locale
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * NotificationItem component - displays a single notification
 * Requirements: 2.7, 2.8, 2.9
 */
export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps): JSX.Element {
  const styles = getNotificationStyles(notification.type);
  const icon = getNotificationIcon(notification.type);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors',
        notification.isRead
          ? 'border-secondary-200 bg-white hover:bg-secondary-50'
          : 'border-primary-200 bg-primary-50 hover:bg-primary-100'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 rounded-lg p-2', styles.iconBg, styles.iconColor)}>
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'text-sm font-medium',
              notification.isRead ? 'text-secondary-700' : 'text-secondary-900'
            )}
          >
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="flex-shrink-0 rounded-full bg-primary-500 h-2 w-2" />
          )}
        </div>
        <p
          className={cn(
            'mt-1 text-sm',
            notification.isRead ? 'text-secondary-500' : 'text-secondary-600'
          )}
        >
          {notification.message}
        </p>
        <p className="mt-2 text-xs text-secondary-400">
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
