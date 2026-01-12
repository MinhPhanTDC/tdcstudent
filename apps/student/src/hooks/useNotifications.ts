'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@tdc/firebase';
import type { Notification } from '@tdc/schemas';
import type { AppError } from '@tdc/types';
import { useAuth } from '@/contexts/AuthContext';

// Query keys factory
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

/**
 * Return type for useNotifications hook
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: AppError | null;
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

/**
 * Hook to manage notifications for the current user
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 *
 * @returns notifications, loading state, error, unread count, and mutation functions
 */
export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || '';

  // Fetch notifications for user (Requirements: 6.1, 6.2)
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async (): Promise<Notification[]> => {
      if (!userId) return [];

      const result = await notificationService.getNotificationsForUser(userId);
      if (!result.success) {
        throw result.error;
      }

      // Sort by createdAt descending (newest first)
      return result.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: !!userId,
  });

  // Compute unread count from notifications (Requirements: 6.3)
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark single notification as read mutation (Requirements: 6.4, 6.6)
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string): Promise<void> => {
      const result = await notificationService.markAsRead(notificationId);
      if (!result.success) {
        throw result.error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data (Requirements: 6.6)
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // Mark all notifications as read mutation (Requirements: 6.5)
  const markAllAsReadMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!userId) return;

      const result = await notificationService.markAllAsRead(userId);
      if (!result.success) {
        throw result.error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  return {
    notifications,
    isLoading,
    error: error as AppError | null,
    unreadCount,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    refetch,
  };
}
