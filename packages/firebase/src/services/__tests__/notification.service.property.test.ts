import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  createCompletionNotificationData,
  createRejectionNotificationData,
  createCourseUnlockNotificationData,
  createSemesterUnlockNotificationData,
  type CompletionNotificationInput,
  type RejectionNotificationInput,
  type CourseUnlockNotificationInput,
  type SemesterUnlockNotificationInput,
} from '../notification.service';

/**
 * Arbitrary generator for completion notification input
 */
const completionInputArbitrary = (): fc.Arbitrary<CompletionNotificationInput> =>
  fc.record({
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    courseName: fc.string({ minLength: 1, maxLength: 100 }),
  });

/**
 * Arbitrary generator for rejection notification input
 */
const rejectionInputArbitrary = (): fc.Arbitrary<RejectionNotificationInput> =>
  fc.record({
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    courseName: fc.string({ minLength: 1, maxLength: 100 }),
    rejectionReason: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
  });

/**
 * Arbitrary generator for course unlock notification input
 */
const courseUnlockInputArbitrary = (): fc.Arbitrary<CourseUnlockNotificationInput> =>
  fc.record({
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    courseName: fc.string({ minLength: 1, maxLength: 100 }),
  });

/**
 * Arbitrary generator for semester unlock notification input
 */
const semesterUnlockInputArbitrary = (): fc.Arbitrary<SemesterUnlockNotificationInput> =>
  fc.record({
    studentId: fc.uuid(),
    semesterId: fc.uuid(),
    semesterName: fc.string({ minLength: 1, maxLength: 100 }),
  });

describe('Notification Service Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 24: Notification on Completion**
   * **Validates: Requirements 8.1**
   *
   * For any progress status change to completed, a notification should be
   * created for the student.
   */
  describe('Property 24: Notification on Completion', () => {
    it('should create notification with correct type for completion', () => {
      fc.assert(
        fc.property(completionInputArbitrary(), (input) => {
          const data = createCompletionNotificationData(input);
          expect(data.type).toBe('course_completed');
        }),
        { numRuns: 100 }
      );
    });

    it('should create notification for the correct student', () => {
      fc.assert(
        fc.property(completionInputArbitrary(), (input) => {
          const data = createCompletionNotificationData(input);
          expect(data.userId).toBe(input.studentId);
        }),
        { numRuns: 100 }
      );
    });

    it('should include course information in metadata', () => {
      fc.assert(
        fc.property(completionInputArbitrary(), (input) => {
          const data = createCompletionNotificationData(input);
          expect(data.metadata.courseId).toBe(input.courseId);
          expect(data.metadata.courseName).toBe(input.courseName);
        }),
        { numRuns: 100 }
      );
    });

    it('should include course name in message', () => {
      fc.assert(
        fc.property(completionInputArbitrary(), (input) => {
          const data = createCompletionNotificationData(input);
          expect(data.message).toContain(input.courseName);
        }),
        { numRuns: 100 }
      );
    });

    it('should have non-empty title and message', () => {
      fc.assert(
        fc.property(completionInputArbitrary(), (input) => {
          const data = createCompletionNotificationData(input);
          expect(data.title.length).toBeGreaterThan(0);
          expect(data.message.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 25: Notification on Rejection**
   * **Validates: Requirements 8.2**
   *
   * For any progress status change to rejected, a notification should be
   * created for the student containing the rejection reason.
   */
  describe('Property 25: Notification on Rejection', () => {
    it('should create notification with correct type for rejection', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const data = createRejectionNotificationData(input);
          expect(data.type).toBe('course_rejected');
        }),
        { numRuns: 100 }
      );
    });

    it('should create notification for the correct student', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const data = createRejectionNotificationData(input);
          expect(data.userId).toBe(input.studentId);
        }),
        { numRuns: 100 }
      );
    });

    it('should include rejection reason in metadata', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const data = createRejectionNotificationData(input);
          expect(data.metadata.rejectionReason).toBe(input.rejectionReason);
        }),
        { numRuns: 100 }
      );
    });

    it('should include rejection reason in message', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const data = createRejectionNotificationData(input);
          expect(data.message).toContain(input.rejectionReason);
        }),
        { numRuns: 100 }
      );
    });

    it('should include course information in metadata', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const data = createRejectionNotificationData(input);
          expect(data.metadata.courseId).toBe(input.courseId);
          expect(data.metadata.courseName).toBe(input.courseName);
        }),
        { numRuns: 100 }
      );
    });

    it('should include course name in message', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const data = createRejectionNotificationData(input);
          expect(data.message).toContain(input.courseName);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 26: Notification on Unlock**
   * **Validates: Requirements 8.3, 8.4**
   *
   * For any course or semester unlock, a notification should be created for
   * the student informing them of the newly available content.
   */
  describe('Property 26: Notification on Unlock', () => {
    describe('Course Unlock Notifications', () => {
      it('should create notification with correct type for course unlock', () => {
        fc.assert(
          fc.property(courseUnlockInputArbitrary(), (input) => {
            const data = createCourseUnlockNotificationData(input);
            expect(data.type).toBe('course_unlocked');
          }),
          { numRuns: 100 }
        );
      });

      it('should create notification for the correct student', () => {
        fc.assert(
          fc.property(courseUnlockInputArbitrary(), (input) => {
            const data = createCourseUnlockNotificationData(input);
            expect(data.userId).toBe(input.studentId);
          }),
          { numRuns: 100 }
        );
      });

      it('should include course information in metadata', () => {
        fc.assert(
          fc.property(courseUnlockInputArbitrary(), (input) => {
            const data = createCourseUnlockNotificationData(input);
            expect(data.metadata.courseId).toBe(input.courseId);
            expect(data.metadata.courseName).toBe(input.courseName);
          }),
          { numRuns: 100 }
        );
      });

      it('should include course name in message', () => {
        fc.assert(
          fc.property(courseUnlockInputArbitrary(), (input) => {
            const data = createCourseUnlockNotificationData(input);
            expect(data.message).toContain(input.courseName);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Semester Unlock Notifications', () => {
      it('should create notification with correct type for semester unlock', () => {
        fc.assert(
          fc.property(semesterUnlockInputArbitrary(), (input) => {
            const data = createSemesterUnlockNotificationData(input);
            expect(data.type).toBe('semester_unlocked');
          }),
          { numRuns: 100 }
        );
      });

      it('should create notification for the correct student', () => {
        fc.assert(
          fc.property(semesterUnlockInputArbitrary(), (input) => {
            const data = createSemesterUnlockNotificationData(input);
            expect(data.userId).toBe(input.studentId);
          }),
          { numRuns: 100 }
        );
      });

      it('should include semester information in metadata', () => {
        fc.assert(
          fc.property(semesterUnlockInputArbitrary(), (input) => {
            const data = createSemesterUnlockNotificationData(input);
            expect(data.metadata.semesterId).toBe(input.semesterId);
            expect(data.metadata.semesterName).toBe(input.semesterName);
          }),
          { numRuns: 100 }
        );
      });

      it('should include semester name in message', () => {
        fc.assert(
          fc.property(semesterUnlockInputArbitrary(), (input) => {
            const data = createSemesterUnlockNotificationData(input);
            expect(data.message).toContain(input.semesterName);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('General Notification Properties', () => {
      it('should have non-empty title and message for all notification types', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              completionInputArbitrary().map((input) => createCompletionNotificationData(input)),
              rejectionInputArbitrary().map((input) => createRejectionNotificationData(input)),
              courseUnlockInputArbitrary().map((input) => createCourseUnlockNotificationData(input)),
              semesterUnlockInputArbitrary().map((input) => createSemesterUnlockNotificationData(input))
            ),
            (data) => {
              expect(data.title.length).toBeGreaterThan(0);
              expect(data.message.length).toBeGreaterThan(0);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have valid notification type for all notifications', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              completionInputArbitrary().map((input) => createCompletionNotificationData(input)),
              rejectionInputArbitrary().map((input) => createRejectionNotificationData(input)),
              courseUnlockInputArbitrary().map((input) => createCourseUnlockNotificationData(input)),
              semesterUnlockInputArbitrary().map((input) => createSemesterUnlockNotificationData(input))
            ),
            (data) => {
              const validTypes = ['course_completed', 'course_rejected', 'course_unlocked', 'semester_unlocked'];
              expect(validTypes).toContain(data.type);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have valid userId for all notifications', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              completionInputArbitrary().map((input) => createCompletionNotificationData(input)),
              rejectionInputArbitrary().map((input) => createRejectionNotificationData(input)),
              courseUnlockInputArbitrary().map((input) => createCourseUnlockNotificationData(input)),
              semesterUnlockInputArbitrary().map((input) => createSemesterUnlockNotificationData(input))
            ),
            (data) => {
              expect(data.userId).toBeDefined();
              expect(data.userId.length).toBeGreaterThan(0);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
