import {
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp,
  get,
  type Unsubscribe,
  type DatabaseReference,
} from 'firebase/database';
import { getFirebaseRtdb } from '../config';
import type { Result } from '@tdc/types';
import { AppError, ErrorCode } from '@tdc/types';

/**
 * User role type for presence tracking
 */
export type PresenceRole = 'admin' | 'student';

/**
 * User presence state
 */
export type PresenceState = 'online' | 'offline';

/**
 * User presence data structure
 */
export interface UserPresence {
  state: PresenceState;
  lastSeen: number;
  role: PresenceRole;
}

/**
 * Online count by role
 */
export interface OnlineCount {
  admin: number;
  student: number;
}

/**
 * Presence error codes
 */
export const PresenceErrorCode = {
  CONNECTION_FAILED: 'PRESENCE_CONNECTION_FAILED',
  SETUP_FAILED: 'PRESENCE_SETUP_FAILED',
  INVALID_USER: 'PRESENCE_INVALID_USER',
} as const;

/**
 * Calculate online count from presence records
 * Pure function for testing
 */
export function calculateOnlineCount(
  presenceRecords: Record<string, UserPresence>
): OnlineCount {
  const result: OnlineCount = { admin: 0, student: 0 };

  for (const presence of Object.values(presenceRecords)) {
    if (presence.state === 'online') {
      if (presence.role === 'admin') {
        result.admin++;
      } else if (presence.role === 'student') {
        result.student++;
      }
    }
  }

  return result;
}


/**
 * Presence service for tracking online users
 */
class PresenceService {
  private statusRef: DatabaseReference | null = null;
  private connectedRef: DatabaseReference | null = null;
  private unsubscribeConnection: Unsubscribe | null = null;

  /**
   * Setup presence tracking for a user
   * Uses .info/connected and onDisconnect for reliable presence
   */
  async setupPresence(
    userId: string,
    role: PresenceRole
  ): Promise<Result<void>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: new AppError(
            ErrorCode.VALIDATION_ERROR,
            'User ID is required for presence setup'
          ),
        };
      }

      const rtdb = getFirebaseRtdb();
      
      // If RTDB is not configured, skip presence setup
      if (!rtdb) {
        console.warn('Realtime Database not configured, presence tracking disabled');
        return { success: true, data: undefined };
      }
      
      this.statusRef = ref(rtdb, `status/${userId}`);
      this.connectedRef = ref(rtdb, '.info/connected');

      const onlineData: UserPresence = {
        state: 'online',
        lastSeen: Date.now(),
        role,
      };

      const offlineData: UserPresence = {
        state: 'offline',
        lastSeen: Date.now(),
        role,
      };

      // Listen to connection state
      this.unsubscribeConnection = onValue(this.connectedRef, async (snapshot) => {
        if (snapshot.val() === false) {
          return;
        }

        // Set up onDisconnect handler
        if (this.statusRef) {
          await onDisconnect(this.statusRef).set({
            ...offlineData,
            lastSeen: serverTimestamp(),
          });

          // Set online status
          await set(this.statusRef, {
            ...onlineData,
            lastSeen: serverTimestamp(),
          });
        }
      });

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to setup presence: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Cleanup presence tracking (call on logout)
   */
  async cleanupPresence(userId: string): Promise<Result<void>> {
    try {
      if (this.unsubscribeConnection) {
        this.unsubscribeConnection();
        this.unsubscribeConnection = null;
      }

      const rtdb = getFirebaseRtdb();
      
      // If RTDB is not configured, skip cleanup
      if (!rtdb) {
        return { success: true, data: undefined };
      }

      if (this.statusRef) {
        const userStatusRef = ref(rtdb, `status/${userId}`);
        
        // Get current data to preserve role
        const snapshot = await get(userStatusRef);
        const currentData = snapshot.val() as UserPresence | null;
        
        await set(userStatusRef, {
          state: 'offline',
          lastSeen: serverTimestamp(),
          role: currentData?.role || 'student',
        });
        
        this.statusRef = null;
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to cleanup presence: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Get current online count (one-time fetch)
   */
  async getOnlineCount(): Promise<Result<OnlineCount>> {
    try {
      const rtdb = getFirebaseRtdb();
      
      // If RTDB is not configured, return zero counts
      if (!rtdb) {
        return { success: true, data: { admin: 0, student: 0 } };
      }
      
      const statusRef = ref(rtdb, 'status');
      const snapshot = await get(statusRef);

      if (!snapshot.exists()) {
        return { success: true, data: { admin: 0, student: 0 } };
      }

      const presenceRecords = snapshot.val() as Record<string, UserPresence>;
      const count = calculateOnlineCount(presenceRecords);

      return { success: true, data: count };
    } catch (error) {
      return {
        success: false,
        error: new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to get online count: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Subscribe to realtime online count updates
   */
  subscribeToOnlineCount(
    callback: (count: OnlineCount) => void
  ): Unsubscribe {
    const rtdb = getFirebaseRtdb();
    
    // If RTDB is not configured, return empty callback
    if (!rtdb) {
      console.warn('Realtime Database not configured, online count subscription disabled');
      callback({ admin: 0, student: 0 });
      return () => {}; // No-op unsubscribe
    }
    
    const statusRef = ref(rtdb, 'status');

    return onValue(statusRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback({ admin: 0, student: 0 });
        return;
      }

      const presenceRecords = snapshot.val() as Record<string, UserPresence>;
      const count = calculateOnlineCount(presenceRecords);
      callback(count);
    });
  }
}

// Singleton export
export const presenceService = new PresenceService();
