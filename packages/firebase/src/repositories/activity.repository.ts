import {
  ref,
  push,
  get,
  query,
  orderByChild,
  limitToLast,
  type DatabaseReference,
} from 'firebase/database';
import { type Result, success, failure, ErrorCode, AppError } from '@tdc/types';
import {
  ActivitySchema,
  CreateActivityInputSchema,
  type Activity,
  type CreateActivityInput,
} from '@tdc/schemas';
import { getFirebaseRtdb } from '../config';

/**
 * Activity Repository Error Codes
 */
export const ActivityRepositoryErrorCode = {
  CREATE_FAILED: 'ACTIVITY_CREATE_FAILED',
  FETCH_FAILED: 'ACTIVITY_FETCH_FAILED',
  INVALID_DATA: 'ACTIVITY_INVALID_DATA',
} as const;

/**
 * Parse activity data from Realtime Database
 * Handles timestamp conversion and validation
 */
export function parseActivityData(
  id: string,
  data: Record<string, unknown>
): Result<Activity> {
  const activityData = {
    id,
    ...data,
    // Convert server timestamp to Date
    timestamp: data.timestamp
      ? new Date(data.timestamp as number)
      : new Date(),
  };

  const parsed = ActivitySchema.safeParse(activityData);

  if (!parsed.success) {
    return failure(
      new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid activity data', {
        errors: parsed.error.flatten(),
      })
    );
  }

  return success(parsed.data);
}

/**
 * Sort activities by timestamp in descending order (most recent first)
 * Pure function for testing
 */
export function sortActivitiesByTimestamp(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

/**
 * Activity Repository for Realtime Database operations
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
class ActivityRepository {
  private readonly basePath = 'activityFeed';

  /**
   * Get reference to activity feed
   * Returns null if RTDB is not configured
   */
  private getActivityRef(): DatabaseReference | null {
    const rtdb = getFirebaseRtdb();
    if (!rtdb) {
      return null;
    }
    return ref(rtdb, this.basePath);
  }

  /**
   * Create a new activity entry
   * Requirements: 6.2, 6.3, 6.4
   */
  async create(input: CreateActivityInput): Promise<Result<Activity>> {
    try {
      const activityRef = this.getActivityRef();
      if (!activityRef) {
        return failure(
          new AppError(
            ErrorCode.DATABASE_ERROR,
            'Realtime Database not configured'
          )
        );
      }

      // Validate input
      const inputParsed = CreateActivityInputSchema.safeParse(input);
      if (!inputParsed.success) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid activity input', {
            errors: inputParsed.error.flatten(),
          })
        );
      }

      // Generate new reference with auto-generated ID
      const newActivityRef = push(activityRef);
      const id = newActivityRef.key;

      if (!id) {
        return failure(
          new AppError(
            ErrorCode.DATABASE_ERROR,
            'Failed to generate activity ID'
          )
        );
      }

      const now = Date.now();
      const activityData = {
        ...inputParsed.data,
        timestamp: now,
      };

      // Write to database using set on the push reference
      const { set } = await import('firebase/database');
      await set(newActivityRef, activityData);

      // Return the created activity
      const activity: Activity = {
        id,
        type: inputParsed.data.type,
        userId: inputParsed.data.userId,
        userName: inputParsed.data.userName,
        details: inputParsed.data.details,
        timestamp: new Date(now),
      };

      return success(activity);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to create activity: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  }

  /**
   * Find recent activities with limit
   * Requirements: 6.1
   */
  async findRecent(limitCount: number = 20): Promise<Result<Activity[]>> {
    try {
      const activityRef = this.getActivityRef();
      if (!activityRef) {
        return failure(
          new AppError(
            ErrorCode.DATABASE_ERROR,
            'Realtime Database not configured'
          )
        );
      }

      // Validate limit
      if (limitCount < 1 || limitCount > 100) {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Limit must be between 1 and 100'
          )
        );
      }

      // Query with ordering by timestamp and limit
      const activitiesQuery = query(
        activityRef,
        orderByChild('timestamp'),
        limitToLast(limitCount)
      );

      const snapshot = await get(activitiesQuery);

      if (!snapshot.exists()) {
        return success([]);
      }

      const activities: Activity[] = [];
      const data = snapshot.val() as Record<string, Record<string, unknown>>;

      // Parse each activity
      for (const [id, activityData] of Object.entries(data)) {
        const result = parseActivityData(id, activityData);
        if (result.success) {
          activities.push(result.data);
        }
      }

      // Sort by timestamp descending (most recent first)
      const sortedActivities = sortActivitiesByTimestamp(activities);

      return success(sortedActivities);
    } catch (error) {
      return failure(
        new AppError(
          ErrorCode.DATABASE_ERROR,
          `Failed to fetch activities: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  }
}

// Singleton export
export const activityRepository = new ActivityRepository();
