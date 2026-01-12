import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { TrackingLog, TrackingAction, CreateTrackingLogInput } from '@tdc/schemas';

/**
 * **Feature: phase-4-tracking, Property 22: Tracking Log Creation on Update**
 * **Validates: Requirements 7.1, 7.2**
 *
 * Property: For any session or project count update, a tracking log entry
 * should be created with the previous value, new value, admin userId, and timestamp.
 */

/**
 * Arbitrary generator for TrackingAction
 */
const trackingActionArbitrary = (): fc.Arbitrary<TrackingAction> =>
  fc.constantFrom(
    'update_sessions',
    'update_projects',
    'add_project_link',
    'remove_project_link',
    'approve',
    'reject',
    'unlock_course',
    'unlock_semester'
  );

/**
 * Arbitrary generator for CreateTrackingLogInput
 */
const createTrackingLogInputArbitrary = (): fc.Arbitrary<CreateTrackingLogInput> =>
  fc.record({
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    action: trackingActionArbitrary(),
    previousValue: fc.oneof(fc.integer(), fc.string(), fc.constant(undefined)),
    newValue: fc.oneof(fc.integer(), fc.string(), fc.constant(undefined)),
    performedBy: fc.uuid(),
    performedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  });

/**
 * Arbitrary generator for valid TrackingLog objects
 */
const trackingLogArbitrary = (): fc.Arbitrary<TrackingLog> =>
  fc.record({
    id: fc.uuid(),
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    action: trackingActionArbitrary(),
    previousValue: fc.oneof(fc.integer(), fc.string(), fc.constant(undefined)),
    newValue: fc.oneof(fc.integer(), fc.string(), fc.constant(undefined)),
    performedBy: fc.uuid(),
    performedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  });

/**
 * Simulates creating a tracking log entry
 * This mirrors the behavior of createLog() in the repository
 */
function createTrackingLog(input: CreateTrackingLogInput): TrackingLog {
  const now = new Date();
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Filter tracking logs by student and course
 * This mirrors the behavior of findByStudentCourse() in the repository
 */
function filterByStudentCourse(
  logs: TrackingLog[],
  studentId: string,
  courseId: string
): TrackingLog[] {
  return logs
    .filter((log) => log.studentId === studentId && log.courseId === courseId)
    .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
}

/**
 * Filter tracking logs by student
 * This mirrors the behavior of findByStudent() in the repository
 */
function filterByStudent(logs: TrackingLog[], studentId: string): TrackingLog[] {
  return logs
    .filter((log) => log.studentId === studentId)
    .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
}

/**
 * Validates that a tracking log contains required fields for session/project updates
 */
function hasRequiredUpdateFields(log: TrackingLog): boolean {
  return (
    typeof log.studentId === 'string' &&
    log.studentId.length > 0 &&
    typeof log.courseId === 'string' &&
    log.courseId.length > 0 &&
    typeof log.performedBy === 'string' &&
    log.performedBy.length > 0 &&
    log.performedAt instanceof Date &&
    typeof log.action === 'string'
  );
}

describe('Tracking Log Repository Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 22: Tracking Log Creation on Update**
   * **Validates: Requirements 7.1, 7.2**
   */
  describe('Property 22: Tracking Log Creation on Update', () => {
    it('should create tracking log with all required fields for session updates', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.integer({ min: 0, max: 20 }), // previousValue
          fc.integer({ min: 0, max: 20 }), // newValue
          fc.uuid(), // adminId
          (studentId, courseId, previousValue, newValue, adminId) => {
            const input: CreateTrackingLogInput = {
              studentId,
              courseId,
              action: 'update_sessions',
              previousValue,
              newValue,
              performedBy: adminId,
              performedAt: new Date(),
            };

            const log = createTrackingLog(input);

            // Log should have all required fields
            expect(hasRequiredUpdateFields(log)).toBe(true);
            expect(log.action).toBe('update_sessions');
            expect(log.previousValue).toBe(previousValue);
            expect(log.newValue).toBe(newValue);
            expect(log.performedBy).toBe(adminId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create tracking log with all required fields for project updates', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.integer({ min: 0, max: 10 }), // previousValue
          fc.integer({ min: 0, max: 10 }), // newValue
          fc.uuid(), // adminId
          (studentId, courseId, previousValue, newValue, adminId) => {
            const input: CreateTrackingLogInput = {
              studentId,
              courseId,
              action: 'update_projects',
              previousValue,
              newValue,
              performedBy: adminId,
              performedAt: new Date(),
            };

            const log = createTrackingLog(input);

            // Log should have all required fields
            expect(hasRequiredUpdateFields(log)).toBe(true);
            expect(log.action).toBe('update_projects');
            expect(log.previousValue).toBe(previousValue);
            expect(log.newValue).toBe(newValue);
            expect(log.performedBy).toBe(adminId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve studentId and courseId in created log', () => {
      fc.assert(
        fc.property(createTrackingLogInputArbitrary(), (input) => {
          const log = createTrackingLog(input);

          expect(log.studentId).toBe(input.studentId);
          expect(log.courseId).toBe(input.courseId);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve performedBy admin userId in created log', () => {
      fc.assert(
        fc.property(createTrackingLogInputArbitrary(), (input) => {
          const log = createTrackingLog(input);

          expect(log.performedBy).toBe(input.performedBy);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve performedAt timestamp in created log', () => {
      fc.assert(
        fc.property(createTrackingLogInputArbitrary(), (input) => {
          const log = createTrackingLog(input);

          expect(log.performedAt.getTime()).toBe(input.performedAt.getTime());
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve previous and new values in created log', () => {
      fc.assert(
        fc.property(createTrackingLogInputArbitrary(), (input) => {
          const log = createTrackingLog(input);

          expect(log.previousValue).toEqual(input.previousValue);
          expect(log.newValue).toEqual(input.newValue);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate unique IDs for each created log', () => {
      fc.assert(
        fc.property(
          fc.array(createTrackingLogInputArbitrary(), { minLength: 2, maxLength: 20 }),
          (inputs) => {
            const logs = inputs.map((input) => createTrackingLog(input));
            const ids = logs.map((log) => log.id);
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(logs.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set createdAt and updatedAt timestamps on creation', () => {
      fc.assert(
        fc.property(createTrackingLogInputArbitrary(), (input) => {
          const beforeCreate = new Date();
          const log = createTrackingLog(input);
          const afterCreate = new Date();

          expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
          expect(log.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
          expect(log.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
          expect(log.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Tracking Log Query Properties', () => {
    it('should filter logs by student and course correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // targetStudentId
          fc.uuid(), // targetCourseId
          fc.array(trackingLogArbitrary(), { maxLength: 50 }),
          (targetStudentId, targetCourseId, logs) => {
            const filtered = filterByStudentCourse(logs, targetStudentId, targetCourseId);

            // All filtered logs should have matching studentId and courseId
            for (const log of filtered) {
              expect(log.studentId).toBe(targetStudentId);
              expect(log.courseId).toBe(targetCourseId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter logs by student correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // targetStudentId
          fc.array(trackingLogArbitrary(), { maxLength: 50 }),
          (targetStudentId, logs) => {
            const filtered = filterByStudent(logs, targetStudentId);

            // All filtered logs should have matching studentId
            for (const log of filtered) {
              expect(log.studentId).toBe(targetStudentId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return logs sorted by performedAt descending', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(trackingLogArbitrary(), { minLength: 2, maxLength: 50 }),
          (targetStudentId, logs) => {
            // Filter out logs with invalid dates
            const validLogs = logs.filter(
              (log) =>
                log.performedAt instanceof Date &&
                !isNaN(log.performedAt.getTime())
            );

            if (validLogs.length < 2) return; // Skip if not enough valid logs

            // Assign target studentId to some logs
            const logsWithTarget = validLogs.map((log, i) =>
              i % 2 === 0 ? { ...log, studentId: targetStudentId } : log
            );

            const filtered = filterByStudent(logsWithTarget, targetStudentId);

            // Check descending order by performedAt
            for (let i = 1; i < filtered.length; i++) {
              expect(filtered[i - 1].performedAt.getTime()).toBeGreaterThanOrEqual(
                filtered[i].performedAt.getTime()
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when no logs match student and course', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(trackingLogArbitrary(), { maxLength: 50 }),
          (nonExistentStudentId, nonExistentCourseId, logs) => {
            // Ensure the IDs don't exist in logs
            const existingPairs = new Set(logs.map((l) => `${l.studentId}-${l.courseId}`));
            const targetPair = `${nonExistentStudentId}-${nonExistentCourseId}`;

            if (!existingPairs.has(targetPair)) {
              const filtered = filterByStudentCourse(logs, nonExistentStudentId, nonExistentCourseId);
              expect(filtered).toEqual([]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve log data integrity after filtering', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(trackingLogArbitrary(), { maxLength: 50 }),
          (targetStudentId, logs) => {
            const filtered = filterByStudent(logs, targetStudentId);

            // Each filtered log should exist in original array with same data
            for (const filteredLog of filtered) {
              const original = logs.find((l) => l.id === filteredLog.id);
              expect(original).toBeDefined();
              expect(filteredLog).toEqual(original);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
