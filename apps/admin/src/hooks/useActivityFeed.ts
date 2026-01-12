'use client';

import { useState, useEffect, useCallback } from 'react';
import { activityService } from '@tdc/firebase';
import type { Activity } from '@tdc/schemas';

/**
 * Default limit for activity feed
 */
const DEFAULT_LIMIT = 20;

/**
 * Hook to subscribe to realtime activity feed updates
 * Requirements: 6.1, 6.5
 */
export function useActivityFeed(limit: number = DEFAULT_LIMIT) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Subscribe to realtime updates
    const unsubscribe = activityService.subscribeToActivities(
      (newActivities) => {
        setActivities(newActivities);
        setIsLoading(false);
      },
      limit
    );

    return () => {
      unsubscribe();
    };
  }, [limit]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const result = await activityService.getRecentActivities(limit);
    if (result.success) {
      setActivities(result.data);
      setError(null);
    } else {
      setError(new Error(result.error.message));
    }
    setIsLoading(false);
  }, [limit]);

  return {
    activities,
    isLoading,
    error,
    refetch,
  };
}
