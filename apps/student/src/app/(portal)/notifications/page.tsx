'use client';

import { Card, Button, EmptyState } from '@tdc/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from '@/components/features/notifications';

/**
 * Notifications page - displays all notifications for the student
 * Requirements: 2.3, 2.4
 */
export default function NotificationsPage(): JSX.Element {
  // Fetch notifications using useNotifications hook (Requirements: 2.4)
  const {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Thông báo</h1>
        <Card>
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
            title="Không thể tải thông báo"
            description="Đã xảy ra lỗi khi tải thông báo. Vui lòng thử lại sau."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with mark all as read button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-secondary-500">
              Bạn có {unreadCount} thông báo chưa đọc
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Notification list (Requirements: 2.3) */}
      <Card>
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
