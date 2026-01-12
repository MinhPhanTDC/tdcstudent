'use client';

import { EmptyState, Skeleton } from '@tdc/ui';
import type { Notification } from '@tdc/schemas';
import { NotificationItem } from './NotificationItem';

export interface NotificationListProps {
  /** List of notifications to display */
  notifications: Notification[];
  /** Callback when a notification is marked as read */
  onMarkAsRead: (id: string) => void;
  /** Whether notifications are loading */
  isLoading?: boolean;
}

/**
 * Skeleton loading state for notification list
 * Requirements: 2.11
 */
function NotificationListSkeleton(): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-lg border border-secondary-200 bg-white p-4"
        >
          {/* Icon skeleton */}
          <Skeleton width={40} height={40} rounded="lg" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} rounded="sm" />
            <Skeleton width="100%" height={14} rounded="sm" />
            <Skeleton width="30%" height={12} rounded="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state for notification list
 * Requirements: 2.10
 */
function NotificationListEmpty(): JSX.Element {
  return (
    <EmptyState
      icon={
        <svg
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      }
      title="Bạn chưa có thông báo nào"
      description="Các thông báo về khóa học và tiến độ học tập sẽ xuất hiện ở đây"
    />
  );
}

/**
 * NotificationList component - renders a list of notifications
 * Requirements: 2.5, 2.10, 2.11
 */
export function NotificationList({
  notifications,
  onMarkAsRead,
  isLoading = false,
}: NotificationListProps): JSX.Element {
  // Show skeleton loading state (Requirements: 2.11)
  if (isLoading) {
    return <NotificationListSkeleton />;
  }

  // Show empty state (Requirements: 2.10)
  if (notifications.length === 0) {
    return <NotificationListEmpty />;
  }

  // Render notification list sorted by date descending (Requirements: 2.5)
  // Note: Sorting is handled by useNotifications hook, but we ensure order here
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
