import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { ActivityType } from '@tdc/schemas';
import { sortActivitiesByTimestamp } from '../../repositories/activity.repository';
import {
  createCourseCompletionActivity,
  createProjectSubmissionActivity,
  createLoginActivity,
  createLabRequirementActivity,
} from '../activity.service';

/**
 * Feature: phase-6-lab-advanced, Property 10: Activity feed ordering
 * Validates: Requirements 6.1
 *
 * For any activity feed query with limit N, the returned activities SHALL be
 * the N most recent by timestamp in descending order.
 */
describe('Property 10: Activity feed ordering', () => {
  // Arbitrary for generating valid activity types
  const activityTypeArb = fc.constantFrom<ActivityType>(
    'course_completed',
    'project_submitted',
    'login',
    'lab_requirement_completed'
  );

  // Arbitrary for generating valid timestamps (avoiding NaN dates)
  const validTimestampArb = fc.integer({
    min: new Date('2020-01-01').getTime(),
    max: new Date('2030-12-31').getTime(),
  }).map((ts) => new Date(ts));

  // Arbitrary for generating valid activities
  const activityArb = fc.record({
    id: fc.uuid(),
    type: activityTypeArb,
    userId: fc.uuid(),
    userName: fc.string({ minLength: 1, maxLength: 50 }),
    details: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined }),
    timestamp: validTimestampArb,
  });

  // Arbitrary for generating arrays of activities
  const activitiesArb = fc.array(activityArb, { minLength: 0, maxLength: 50 });

  it('should sort activities by timestamp in descending order (most recent first)', () => {
    fc.assert(
      fc.property(activitiesArb, (activities) => {
        const sorted = sortActivitiesByTimestamp(activities);

        // Check that each activity is more recent than or equal to the next
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].timestamp.getTime()).toBeGreaterThanOrEqual(
            sorted[i + 1].timestamp.getTime()
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all activities after sorting (no data loss)', () => {
    fc.assert(
      fc.property(activitiesArb, (activities) => {
        const sorted = sortActivitiesByTimestamp(activities);

        // Same length
        expect(sorted.length).toBe(activities.length);

        // All original activities should be present
        const originalIds = new Set(activities.map((a) => a.id));
        const sortedIds = new Set(sorted.map((a) => a.id));

        expect(sortedIds.size).toBe(originalIds.size);
        for (const id of originalIds) {
          expect(sortedIds.has(id)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should not modify the original array', () => {
    fc.assert(
      fc.property(activitiesArb, (activities) => {
        const originalOrder = activities.map((a) => a.id);
        sortActivitiesByTimestamp(activities);
        const afterSortOrder = activities.map((a) => a.id);

        // Original array should be unchanged
        expect(afterSortOrder).toEqual(originalOrder);
      }),
      { numRuns: 100 }
    );
  });

  it('should return empty array for empty input', () => {
    const result = sortActivitiesByTimestamp([]);
    expect(result).toEqual([]);
  });

  it('should return single element array unchanged', () => {
    fc.assert(
      fc.property(activityArb, (activity) => {
        const result = sortActivitiesByTimestamp([activity]);
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(activity.id);
      }),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same input produces same output', () => {
    fc.assert(
      fc.property(activitiesArb, (activities) => {
        const result1 = sortActivitiesByTimestamp(activities);
        const result2 = sortActivitiesByTimestamp(activities);

        expect(result1.map((a) => a.id)).toEqual(result2.map((a) => a.id));
      }),
      { numRuns: 100 }
    );
  });

  it('should place most recent activity first', () => {
    fc.assert(
      fc.property(
        fc.array(activityArb, { minLength: 2, maxLength: 20 }),
        (activities) => {
          const sorted = sortActivitiesByTimestamp(activities);

          // Find the activity with the maximum timestamp
          const maxTimestamp = Math.max(
            ...activities.map((a) => a.timestamp.getTime())
          );

          // First element should have the maximum timestamp
          expect(sorted[0].timestamp.getTime()).toBe(maxTimestamp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should place oldest activity last', () => {
    fc.assert(
      fc.property(
        fc.array(activityArb, { minLength: 2, maxLength: 20 }),
        (activities) => {
          const sorted = sortActivitiesByTimestamp(activities);

          // Find the activity with the minimum timestamp
          const minTimestamp = Math.min(
            ...activities.map((a) => a.timestamp.getTime())
          );

          // Last element should have the minimum timestamp
          expect(sorted[sorted.length - 1].timestamp.getTime()).toBe(minTimestamp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle activities with same timestamp', () => {
    const fixedTimestamp = new Date('2024-01-15T10:00:00Z');

    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: activityTypeArb,
            userId: fc.uuid(),
            userName: fc.string({ minLength: 1, maxLength: 50 }),
            details: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined }),
            timestamp: fc.constant(fixedTimestamp),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (activities) => {
          const sorted = sortActivitiesByTimestamp(activities);

          // All should have the same timestamp
          for (const activity of sorted) {
            expect(activity.timestamp.getTime()).toBe(fixedTimestamp.getTime());
          }

          // Length should be preserved
          expect(sorted.length).toBe(activities.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Tests for activity creation helper functions
 */
describe('Activity creation helpers', () => {
  it('should create course completion activity with correct type', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          courseId: fc.uuid(),
          courseTitle: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        (input) => {
          const activity = createCourseCompletionActivity(input);

          expect(activity.type).toBe('course_completed');
          expect(activity.userId).toBe(input.userId);
          expect(activity.userName).toBe(input.userName);
          expect(activity.details?.courseId).toBe(input.courseId);
          expect(activity.details?.courseTitle).toBe(input.courseTitle);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create project submission activity with correct type', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          projectId: fc.uuid(),
          projectTitle: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        (input) => {
          const activity = createProjectSubmissionActivity(input);

          expect(activity.type).toBe('project_submitted');
          expect(activity.userId).toBe(input.userId);
          expect(activity.userName).toBe(input.userName);
          expect(activity.details?.projectId).toBe(input.projectId);
          expect(activity.details?.projectTitle).toBe(input.projectTitle);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create login activity with correct type', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          userName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (input) => {
          const activity = createLoginActivity(input);

          expect(activity.type).toBe('login');
          expect(activity.userId).toBe(input.userId);
          expect(activity.userName).toBe(input.userName);
          expect(activity.details).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create lab requirement activity with correct type', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          requirementId: fc.uuid(),
          requirementTitle: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        (input) => {
          const activity = createLabRequirementActivity(input);

          expect(activity.type).toBe('lab_requirement_completed');
          expect(activity.userId).toBe(input.userId);
          expect(activity.userName).toBe(input.userName);
          expect(activity.details?.requirementId).toBe(input.requirementId);
          expect(activity.details?.requirementTitle).toBe(input.requirementTitle);
        }
      ),
      { numRuns: 100 }
    );
  });
});
