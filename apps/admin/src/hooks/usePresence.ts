'use client';

import { useState, useEffect, useCallback } from 'react';
import { presenceService, type OnlineCount } from '@tdc/firebase';

/**
 * Hook to subscribe to realtime online count updates
 * Requirements: 5.1, 5.4
 */
export function usePresence() {
  const [onlineCount, setOnlineCount] = useState<OnlineCount>({ admin: 0, student: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsConnected(true);
    setError(null);

    // Subscribe to realtime updates
    const unsubscribe = presenceService.subscribeToOnlineCount((count) => {
      setOnlineCount(count);
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);

  const refetch = useCallback(async () => {
    const result = await presenceService.getOnlineCount();
    if (result.success) {
      setOnlineCount(result.data);
    } else {
      setError(new Error(result.error.message));
    }
  }, []);

  return {
    onlineCount,
    isConnected,
    error,
    refetch,
  };
}
