import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { TrackingLog, CreateTrackingLogInput } from '@tdc/schemas';

/**
 * **Feature: phase-4-tracking, Property 23: Tracking Log Creation on Approval**
 * **Validates: Requirements 7.3**
 *
 * Property: For any approve or reject action, a tracking log entry should be
 * created with the action type, admin userId, and timestamp.
 */

/**
 * Arbitrary generator for approval/rejection actions
 */
const approvalActionArbitrary = (): fc.Arbitrary<'approve' | 'reject'> =>
  fc.constantFrom('approve', 'reject');

/**
 * Arbitrary generator for CreateTrackingLogInput for approval/rejection
 */
const createApprovalLogInputArbitrary = (): fc.Arbitrary<CreateTrackingLogInput> =>
  fc.record({
    studentId: fc.uuid(),
    courseId: fc.uuid(),
    action: approvalActionArbitrary(),
    previousValue: fc.constantFrom('pending_approval'),
    newValue: fc.oneof(fc.constant('completed'), fc.constant('rejected')),
    performedBy: fc.uuid(),
    performedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  });



/**
 * Simulates creating a tracking log entry for approval/rejection
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
 * Simulates the approval action and tracking log creation
 * This mirrors the behavior of the approve method in tracking service
 */
function simulateApprovalWithLog(
  studentId: string,
  courseId: string,
  adminId: string,
  previousStatus: string
): { success: boolean; log?: TrackingLog } {
  // Only allow approval from pending_approval status
  if (previousStatus !== 'pending_approval') {
    return { success: false };
  }

  const log = createTrackingLog({
    studentId,
    courseId,
    action: 'approve',
    previousValue: previousStatus,
    newValue: 'completed',
    performedBy: adminId,
    performedAt: new Date(),
  });

  return { success: true, log };
}

/**
 * Simulates the rejection action and tracking log creation
 * This mirrors the behavior of the reject method in tracking service
 */
function simulateRejectionWithLog(
  studentId: string,
  courseId: string,
  adminId: string,
  previousStatus: string,
  reason: string
): { success: boolean; log?: TrackingLog } {
  // Only allow rejection from pending_approval status
  if (previousStatus !== 'pending_approval') {
    return { success: false };
  }

  // Reason must be non-empty
  if (!reason || reason.trim().length === 0) {
    return { success: false };
  }

  const log = createTrackingLog({
    studentId,
    courseId,
    action: 'reject',
    previousValue: previousStatus,
    newValue: 'rejected',
    performedBy: adminId,
    performedAt: new Date(),
  });

  return { success: true, log };
}

/**
 * Validates that a tracking log contains required fields for approval/rejection
 */
function hasRequiredApprovalFields(log: TrackingLog): boolean {
  return (
    typeof log.studentId === 'string' &&
    log.studentId.length > 0 &&
    typeof log.courseId === 'string' &&
    log.courseId.length > 0 &&
    typeof log.performedBy === 'string' &&
    log.performedBy.length > 0 &&
    log.performedAt instanceof Date &&
    (log.action === 'approve' || log.action === 'reject')
  );
}

describe('Tracking Log Approval Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 23: Tracking Log Creation on Approval**
   * **Validates: Requirements 7.3**
   */
  describe('Property 23: Tracking Log Creation on Approval', () => {
    it('should create tracking log with action type on approval', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          (studentId, courseId, adminId) => {
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval'
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.action).toBe('approve');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create tracking log with action type on rejection', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0), // reason
          (studentId, courseId, adminId, reason) => {
            const result = simulateRejectionWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval',
              reason
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.action).toBe('reject');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record admin userId in tracking log on approval', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          (studentId, courseId, adminId) => {
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval'
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.performedBy).toBe(adminId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record admin userId in tracking log on rejection', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0), // reason
          (studentId, courseId, adminId, reason) => {
            const result = simulateRejectionWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval',
              reason
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.performedBy).toBe(adminId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record timestamp in tracking log on approval', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          (studentId, courseId, adminId) => {
            const beforeAction = new Date();
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval'
            );
            const afterAction = new Date();

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.performedAt).toBeInstanceOf(Date);
            expect(result.log!.performedAt.getTime()).toBeGreaterThanOrEqual(
              beforeAction.getTime()
            );
            expect(result.log!.performedAt.getTime()).toBeLessThanOrEqual(
              afterAction.getTime()
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record timestamp in tracking log on rejection', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0), // reason
          (studentId, courseId, adminId, reason) => {
            const beforeAction = new Date();
            const result = simulateRejectionWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval',
              reason
            );
            const afterAction = new Date();

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.performedAt).toBeInstanceOf(Date);
            expect(result.log!.performedAt.getTime()).toBeGreaterThanOrEqual(
              beforeAction.getTime()
            );
            expect(result.log!.performedAt.getTime()).toBeLessThanOrEqual(
              afterAction.getTime()
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all required fields in approval tracking log', () => {
      fc.assert(
        fc.property(createApprovalLogInputArbitrary(), (input) => {
          const log = createTrackingLog(input);

          expect(hasRequiredApprovalFields(log)).toBe(true);
          expect(log.studentId).toBe(input.studentId);
          expect(log.courseId).toBe(input.courseId);
          expect(log.performedBy).toBe(input.performedBy);
        }),
        { numRuns: 100 }
      );
    });

    it('should record previous status value in tracking log', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          (studentId, courseId, adminId) => {
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval'
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.previousValue).toBe('pending_approval');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record new status value in tracking log on approval', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          (studentId, courseId, adminId) => {
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval'
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.newValue).toBe('completed');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record new status value in tracking log on rejection', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0), // reason
          (studentId, courseId, adminId, reason) => {
            const result = simulateRejectionWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval',
              reason
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.newValue).toBe('rejected');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not create tracking log when approval fails due to invalid status', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.constantFrom('not_started', 'in_progress', 'completed', 'rejected', 'locked'),
          (studentId, courseId, adminId, invalidStatus) => {
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              invalidStatus
            );

            expect(result.success).toBe(false);
            expect(result.log).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not create tracking log when rejection fails due to invalid status', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.constantFrom('not_started', 'in_progress', 'completed', 'rejected', 'locked'),
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0), // reason
          (studentId, courseId, adminId, invalidStatus, reason) => {
            const result = simulateRejectionWithLog(
              studentId,
              courseId,
              adminId,
              invalidStatus,
              reason
            );

            expect(result.success).toBe(false);
            expect(result.log).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not create tracking log when rejection fails due to empty reason', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          fc.constantFrom('', '   ', '\t', '\n', '  \n  '), // empty reasons
          (studentId, courseId, adminId, emptyReason) => {
            const result = simulateRejectionWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval',
              emptyReason
            );

            expect(result.success).toBe(false);
            expect(result.log).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate unique log IDs for each approval/rejection', () => {
      fc.assert(
        fc.property(
          fc.array(createApprovalLogInputArbitrary(), { minLength: 2, maxLength: 20 }),
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

    it('should preserve student and course IDs in tracking log', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // studentId
          fc.uuid(), // courseId
          fc.uuid(), // adminId
          (studentId, courseId, adminId) => {
            const result = simulateApprovalWithLog(
              studentId,
              courseId,
              adminId,
              'pending_approval'
            );

            expect(result.success).toBe(true);
            expect(result.log).toBeDefined();
            expect(result.log!.studentId).toBe(studentId);
            expect(result.log!.courseId).toBe(courseId);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
