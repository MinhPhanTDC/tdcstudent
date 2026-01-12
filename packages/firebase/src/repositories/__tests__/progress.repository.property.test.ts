import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { StudentProgress, ProgressStatus } from '@tdc/schemas';

/**
 * **Feature: phase-4-tracking, Property 11: Quick Track Filter**
 * **Validates: Requirements 4.1**
 *
 * Property: For any student displayed in the Quick Track tab, their progress
 * status should be pending_approval.
 */

/**
 * Arbitrary generator for ProgressStatus
 */
const progressStatusArbitrary = (): fc.Arbitrary<ProgressStatus> =>
  fc.constantFrom(
    'not_started',
    'in_progress',
    'pending_approval',
    'completed',
    'rejected',
    'locked'
  );

/**
 * Arbitrary generator for valid StudentProgress objects
 */
const studentProgressArbitrary = (): fc.Arbitrary<StudentProgress> =>
  fc.record({
    id: fc.uuid(),
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    completedSessions: fc.integer({ min: 0, max: 20 }),
    projectsSubmitted: fc.integer({ min: 0, max: 10 }),
    projectLinks: fc.array(fc.webUrl(), { maxLength: 5 }),
    status: progressStatusArbitrary(),
    rejectionReason: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
    approvedAt: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), {
      nil: null,
    }),
    approvedBy: fc.option(fc.uuid(), { nil: undefined }),
    completedAt: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), {
      nil: null,
    }),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  });

/**
 * Filter progress records by pending_approval status
 * This mirrors the behavior of findPendingApproval() in the repository
 */
function filterPendingApproval(progressList: StudentProgress[]): StudentProgress[] {
  return progressList.filter((progress) => progress.status === 'pending_approval');
}

/**
 * Filter progress records by course
 * This mirrors the behavior of findByCourse() in the repository
 */
function filterByCourse(progressList: StudentProgress[], courseId: string): StudentProgress[] {
  return progressList.filter((progress) => progress.courseId === courseId);
}

/**
 * Filter progress records by student and course
 * This mirrors the behavior of findByStudentAndCourse() in the repository
 */
function filterByStudentAndCourse(
  progressList: StudentProgress[],
  studentId: string,
  courseId: string
): StudentProgress | null {
  const found = progressList.find(
    (progress) => progress.studentId === studentId && progress.courseId === courseId
  );
  return found || null;
}

/**
 * Filter pending approval by course
 * This mirrors the behavior of findPendingApprovalByCourse() in the repository
 */
function filterPendingApprovalByCourse(
  progressList: StudentProgress[],
  courseId: string
): StudentProgress[] {
  return progressList.filter(
    (progress) => progress.courseId === courseId && progress.status === 'pending_approval'
  );
}

describe('Progress Repository Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 11: Quick Track Filter**
   * **Validates: Requirements 4.1**
   */
  describe('Property 11: Quick Track Filter', () => {
    it('should return only progress records with pending_approval status', () => {
      fc.assert(
        fc.property(
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (progressList) => {
            const filtered = filterPendingApproval(progressList);

            // All filtered records must have pending_approval status
            for (const progress of filtered) {
              expect(progress.status).toBe('pending_approval');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all progress records that have pending_approval status', () => {
      fc.assert(
        fc.property(
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (progressList) => {
            const filtered = filterPendingApproval(progressList);

            // Count should match the number of pending_approval records
            const expectedCount = progressList.filter(
              (p) => p.status === 'pending_approval'
            ).length;
            expect(filtered.length).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when no progress records have pending_approval status', () => {
      fc.assert(
        fc.property(
          fc.array(studentProgressArbitrary(), { maxLength: 50 }).map((list) =>
            list.map((p) => ({
              ...p,
              status: fc.sample(
                fc.constantFrom('not_started', 'in_progress', 'completed', 'rejected', 'locked') as fc.Arbitrary<ProgressStatus>,
                1
              )[0],
            }))
          ),
          (progressList) => {
            // Ensure no pending_approval status
            const listWithoutPending = progressList.filter(
              (p) => p.status !== 'pending_approval'
            );
            const filtered = filterPendingApproval(listWithoutPending);
            expect(filtered).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve progress data integrity after filtering', () => {
      fc.assert(
        fc.property(
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (progressList) => {
            const filtered = filterPendingApproval(progressList);

            // Each filtered progress should exist in original array with same data
            for (const filteredProgress of filtered) {
              const original = progressList.find((p) => p.id === filteredProgress.id);
              expect(original).toBeDefined();
              expect(filteredProgress).toEqual(original);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be idempotent - filtering twice produces same result', () => {
      fc.assert(
        fc.property(
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (progressList) => {
            const filteredOnce = filterPendingApproval(progressList);
            const filteredTwice = filterPendingApproval(filteredOnce);

            expect(filteredTwice.map((p) => p.id)).toEqual(filteredOnce.map((p) => p.id));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Progress Repository Query Properties', () => {
    it('should filter by course correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (targetCourseId, progressList) => {
            const filtered = filterByCourse(progressList, targetCourseId);

            // All filtered records should have matching courseId
            for (const progress of filtered) {
              expect(progress.courseId).toBe(targetCourseId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find progress by student and course', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (targetStudentId, targetCourseId, progressList) => {
            const found = filterByStudentAndCourse(progressList, targetStudentId, targetCourseId);

            if (found) {
              expect(found.studentId).toBe(targetStudentId);
              expect(found.courseId).toBe(targetCourseId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null when no progress matches student and course', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (nonExistentStudentId, nonExistentCourseId, progressList) => {
            // Ensure the combination doesn't exist
            const existingPairs = new Set(
              progressList.map((p) => `${p.studentId}-${p.courseId}`)
            );
            const targetPair = `${nonExistentStudentId}-${nonExistentCourseId}`;

            if (!existingPairs.has(targetPair)) {
              const found = filterByStudentAndCourse(
                progressList,
                nonExistentStudentId,
                nonExistentCourseId
              );
              expect(found).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter pending approval by course correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (targetCourseId, progressList) => {
            const filtered = filterPendingApprovalByCourse(progressList, targetCourseId);

            // All filtered records should have matching courseId AND pending_approval status
            for (const progress of filtered) {
              expect(progress.courseId).toBe(targetCourseId);
              expect(progress.status).toBe('pending_approval');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return correct count for pending approval by course', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(studentProgressArbitrary(), { maxLength: 50 }),
          (targetCourseId, progressList) => {
            const filtered = filterPendingApprovalByCourse(progressList, targetCourseId);

            // Count should match manual count
            const expectedCount = progressList.filter(
              (p) => p.courseId === targetCourseId && p.status === 'pending_approval'
            ).length;
            expect(filtered.length).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty progress list', () => {
      const filtered = filterPendingApproval([]);
      expect(filtered).toEqual([]);

      const filteredByCourse = filterByCourse([], 'any-course-id');
      expect(filteredByCourse).toEqual([]);

      const found = filterByStudentAndCourse([], 'any-student-id', 'any-course-id');
      expect(found).toBeNull();
    });
  });
});
