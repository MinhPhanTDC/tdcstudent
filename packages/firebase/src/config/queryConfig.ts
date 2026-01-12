/**
 * TanStack Query Configuration
 *
 * Centralized configuration for TanStack Query caching strategies.
 * This ensures consistent caching behavior across all apps.
 */

import type { QueryClientConfig } from '@tanstack/react-query';

/**
 * Default query configuration for standard data fetching
 * - staleTime: 5 minutes - data is considered fresh for 5 minutes
 * - gcTime (cacheTime): 30 minutes - unused data is garbage collected after 30 minutes
 * - retry: 3 attempts with exponential backoff
 */
export const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  retry: 3,
  retryDelay: (attemptIndex: number): number =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * Realtime query configuration for data that needs frequent updates
 * - staleTime: 0 - data is always considered stale
 * - gcTime: 5 minutes - shorter cache for realtime data
 * - refetchOnWindowFocus: true - refetch when user returns to tab
 */
export const realtimeQueryConfig = {
  staleTime: 0,
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

/**
 * Static query configuration for rarely changing data
 * - staleTime: 30 minutes - data is fresh for longer
 * - gcTime: 60 minutes - keep in cache longer
 * - refetchOnWindowFocus: false - don't refetch on focus
 */
export const staticQueryConfig = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000, // 60 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

/**
 * Mutation configuration defaults
 * - retry: 1 - only retry once for mutations
 * - retryDelay: 1 second
 */
export const defaultMutationConfig = {
  retry: 1,
  retryDelay: 1000,
};

/**
 * Create a QueryClient configuration object
 * Use this to create a new QueryClient with consistent defaults
 */
export function createQueryClientConfig(): QueryClientConfig {
  return {
    defaultOptions: {
      queries: {
        staleTime: defaultQueryConfig.staleTime,
        gcTime: defaultQueryConfig.gcTime,
        retry: defaultQueryConfig.retry,
        retryDelay: defaultQueryConfig.retryDelay,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: defaultMutationConfig.retry,
        retryDelay: defaultMutationConfig.retryDelay,
      },
    },
  };
}

/**
 * Query key factories for consistent cache key management
 */
export const queryKeys = {
  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Student queries
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
    progress: (studentId: string) =>
      [...queryKeys.students.detail(studentId), 'progress'] as const,
  },

  // Course queries
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.courses.lists(), filters] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
  },

  // Semester queries
  semesters: {
    all: ['semesters'] as const,
    lists: () => [...queryKeys.semesters.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.semesters.lists(), filters] as const,
    details: () => [...queryKeys.semesters.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.semesters.details(), id] as const,
    courses: (semesterId: string) =>
      [...queryKeys.semesters.detail(semesterId), 'courses'] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (userId: string) =>
      [...queryKeys.notifications.lists(), userId] as const,
    unread: (userId: string) =>
      [...queryKeys.notifications.list(userId), 'unread'] as const,
  },

  // Activity queries
  activities: {
    all: ['activities'] as const,
    lists: () => [...queryKeys.activities.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.activities.lists(), filters] as const,
  },

  // Media queries
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.media.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.media.all, 'detail', id] as const,
  },
};

/**
 * Cache invalidation helpers
 */
export const invalidationPatterns = {
  /** Invalidate all student-related queries */
  students: queryKeys.students.all,
  /** Invalidate all course-related queries */
  courses: queryKeys.courses.all,
  /** Invalidate all semester-related queries */
  semesters: queryKeys.semesters.all,
  /** Invalidate all notification-related queries */
  notifications: queryKeys.notifications.all,
  /** Invalidate all activity-related queries */
  activities: queryKeys.activities.all,
  /** Invalidate all media-related queries */
  media: queryKeys.media.all,
};
