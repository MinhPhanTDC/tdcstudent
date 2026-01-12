import {
  ref,
  onValue,
  query,
  orderByChild,
  limitToLast,
  type Unsubscribe,
} from 'firebase/database';
import type { Result } from '@tdc/types';
import type { Activity, CreateActivityInput } from '@tdc/schemas';
import { getFirebaseRtdb } from '../config';
import {
  activityRepository,
  parseActivityData,
  sortActivitiesByTimestamp,
} from '../repositories/activity.repository';

/**
 * Activity Service Error Codes
 */
export const ActivityServiceErrorCode = {
  LOG_FAILED: 'ACTIVITY_LOG_FAILED',
  SUBSCRIBE_FAILED: 'ACTIVITY_SUBSCRIBE_FAILED',
  INVALID_INPUT: 'ACTIVITY_INVALID_INPUT',
} as const;

/**
 * Input for logging course completion activity
 * Requirements: 6.2
 */
export interface CourseCompletionActivityInput {
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
}

/**
 * Input for logging project submission activity
 * Requirements: 6.3
 */
export interface ProjectSubmissionActivityInput {
  userId: string;
  userName: string;
  projectId: string;
  projectTitle: string;
}

/**
 * Input for logging login activity
 * Requirements: 6.4
 */
export interface LoginActivityInput {
  userId: string;
  userName: string;
}

/**
 * Input for logging lab requirement completion activity
 */
export interface LabRequirementActivityInput {
  userId: string;
  userName: string;
  requirementId: string;
  requirementTitle: string;
}

/**
 * Create activity input from course completion data
 * Pure function for testing
 */
export function createCourseCompletionActivity(
  input: CourseCompletionActivityInput
): CreateActivityInput {
  return {
    type: 'course_completed',
    userId: input.userId,
    userName: input.userName,
    details: {
      courseId: input.courseId,
      courseTitle: input.courseTitle,
    },
  };
}

/**
 * Create activity input from project submission data
 * Pure function for testing
 */
export function createProjectSubmissionActivity(
  input: ProjectSubmissionActivityInput
): CreateActivityInput {
  return {
    type: 'project_submitted',
    userId: input.userId,
    userName: input.userName,
    details: {
      projectId: input.projectId,
      projectTitle: input.projectTitle,
    },
  };
}

/**
 * Create activity input from login data
 * Pure function for testing
 */
export function createLoginActivity(
  input: LoginActivityInput
): CreateActivityInput {
  return {
    type: 'login',
    userId: input.userId,
    userName: input.userName,
  };
}

/**
 * Create activity input from lab requirement completion data
 * Pure function for testing
 */
export function createLabRequirementActivity(
  input: LabRequirementActivityInput
): CreateActivityInput {
  return {
    type: 'lab_requirement_completed',
    userId: input.userId,
    userName: input.userName,
    details: {
      requirementId: input.requirementId,
      requirementTitle: input.requirementTitle,
    },
  };
}

/**
 * Activity Service for logging and subscribing to activities
 * Requirements: 6.2, 6.3, 6.4, 6.5
 */
class ActivityService {
  private readonly basePath = 'activityFeed';

  /**
   * Log a generic activity
   * Requirements: 6.2, 6.3, 6.4
   */
  async logActivity(input: CreateActivityInput): Promise<Result<Activity>> {
    return activityRepository.create(input);
  }

  /**
   * Log course completion activity
   * Requirements: 6.2
   */
  async logCourseCompletion(
    input: CourseCompletionActivityInput
  ): Promise<Result<Activity>> {
    const activityInput = createCourseCompletionActivity(input);
    return this.logActivity(activityInput);
  }

  /**
   * Log project submission activity
   * Requirements: 6.3
   */
  async logProjectSubmission(
    input: ProjectSubmissionActivityInput
  ): Promise<Result<Activity>> {
    const activityInput = createProjectSubmissionActivity(input);
    return this.logActivity(activityInput);
  }

  /**
   * Log login activity
   * Requirements: 6.4
   */
  async logLogin(input: LoginActivityInput): Promise<Result<Activity>> {
    const activityInput = createLoginActivity(input);
    return this.logActivity(activityInput);
  }

  /**
   * Log lab requirement completion activity
   */
  async logLabRequirementCompletion(
    input: LabRequirementActivityInput
  ): Promise<Result<Activity>> {
    const activityInput = createLabRequirementActivity(input);
    return this.logActivity(activityInput);
  }

  /**
   * Get recent activities (one-time fetch)
   * Requirements: 6.1
   */
  async getRecentActivities(limitCount: number = 20): Promise<Result<Activity[]>> {
    return activityRepository.findRecent(limitCount);
  }

  /**
   * Subscribe to realtime activity updates
   * Requirements: 6.5
   */
  subscribeToActivities(
    callback: (activities: Activity[]) => void,
    limitCount: number = 20
  ): Unsubscribe {
    const rtdb = getFirebaseRtdb();
    
    // If RTDB is not configured, return empty callback
    if (!rtdb) {
      console.warn('Realtime Database not configured, activity subscription disabled');
      callback([]);
      return () => {}; // No-op unsubscribe
    }
    
    const activityRef = ref(rtdb, this.basePath);

    // Query with ordering and limit
    const activitiesQuery = query(
      activityRef,
      orderByChild('timestamp'),
      limitToLast(limitCount)
    );

    return onValue(activitiesQuery, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
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
      callback(sortedActivities);
    });
  }
}

// Singleton export
export const activityService = new ActivityService();
