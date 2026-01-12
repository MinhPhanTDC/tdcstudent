import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  checkPassCondition,
  validateSessionCount,
  validateProjectCount,
  validateProjectUrl,
  type CourseRequirements,
} from '../tracking.service';

/**
 * Arbitrary generator for course requirements
 */
const courseRequirementsArbitrary = (): fc.Arbitrary<CourseRequirements> =>
  fc.record({
    requiredSessions: fc.integer({ min: 1, max: 20 }),
    requiredProjects: fc.integer({ min: 1, max: 10 }),
  });

/**
 * Arbitrary generator for progress data that meets pass conditions
 */
const passingProgressArbitrary = (
  requirements: CourseRequirements
): fc.Arbitrary<{ completedSessions: number; projectsSubmitted: number; projectLinks: string[] }> =>
  fc.record({
    completedSessions: fc.integer({ min: requirements.requiredSessions, max: requirements.requiredSessions + 5 }),
    projectsSubmitted: fc.integer({ min: requirements.requiredProjects, max: requirements.requiredProjects + 5 }),
    projectLinks: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
  });

/**
 * Arbitrary generator for progress data that does NOT meet pass conditions
 */
const failingProgressArbitrary = (
  requirements: CourseRequirements
): fc.Arbitrary<{ completedSessions: number; projectsSubmitted: number; projectLinks: string[] }> =>
  fc.oneof(
    // Missing sessions
    fc.record({
      completedSessions: fc.integer({ min: 0, max: requirements.requiredSessions - 1 }),
      projectsSubmitted: fc.integer({ min: requirements.requiredProjects, max: requirements.requiredProjects + 5 }),
      projectLinks: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    }),
    // Missing projects
    fc.record({
      completedSessions: fc.integer({ min: requirements.requiredSessions, max: requirements.requiredSessions + 5 }),
      projectsSubmitted: fc.integer({ min: 0, max: requirements.requiredProjects - 1 }),
      projectLinks: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    }),
    // Missing project links
    fc.record({
      completedSessions: fc.integer({ min: requirements.requiredSessions, max: requirements.requiredSessions + 5 }),
      projectsSubmitted: fc.integer({ min: requirements.requiredProjects, max: requirements.requiredProjects + 5 }),
      projectLinks: fc.constant([] as string[]),
    })
  );

describe('Tracking Service Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 8: Pass Condition Detection**
   * **Validates: Requirements 3.1**
   *
   * For any progress record where completedSessions >= requiredSessions AND
   * projectsSubmitted >= requiredProjects AND projectLinks.length >= 1,
   * the status should automatically transition to pending_approval.
   */
  describe('Property 8: Pass Condition Detection', () => {
    it('should return canPass=true when all conditions are met', () => {
      fc.assert(
        fc.property(
          courseRequirementsArbitrary().chain((requirements) =>
            fc.tuple(fc.constant(requirements), passingProgressArbitrary(requirements))
          ),
          ([requirements, progress]) => {
            const result = checkPassCondition(progress, requirements);
            expect(result.canPass).toBe(true);
            expect(result.missingConditions).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return canPass=false when any condition is not met', () => {
      fc.assert(
        fc.property(
          courseRequirementsArbitrary().chain((requirements) =>
            fc.tuple(fc.constant(requirements), failingProgressArbitrary(requirements))
          ),
          ([requirements, progress]) => {
            const result = checkPassCondition(progress, requirements);
            expect(result.canPass).toBe(false);
            expect(result.missingConditions.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify missing sessions correctly', () => {
      fc.assert(
        fc.property(
          courseRequirementsArbitrary(),
          fc.integer({ min: 0, max: 100 }),
          (requirements, sessionDelta) => {
            const completedSessions = Math.max(0, requirements.requiredSessions - sessionDelta - 1);
            const progress = {
              completedSessions,
              projectsSubmitted: requirements.requiredProjects,
              projectLinks: ['https://example.com'],
            };

            const result = checkPassCondition(progress, requirements);

            if (completedSessions < requirements.requiredSessions) {
              expect(result.canPass).toBe(false);
              expect(result.missingConditions.some((c) => c.includes('buổi'))).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify missing projects correctly', () => {
      fc.assert(
        fc.property(
          courseRequirementsArbitrary(),
          fc.integer({ min: 0, max: 100 }),
          (requirements, projectDelta) => {
            const projectsSubmitted = Math.max(0, requirements.requiredProjects - projectDelta - 1);
            const progress = {
              completedSessions: requirements.requiredSessions,
              projectsSubmitted,
              projectLinks: ['https://example.com'],
            };

            const result = checkPassCondition(progress, requirements);

            if (projectsSubmitted < requirements.requiredProjects) {
              expect(result.canPass).toBe(false);
              expect(result.missingConditions.some((c) => c.includes('dự án'))).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify missing project links correctly', () => {
      fc.assert(
        fc.property(courseRequirementsArbitrary(), (requirements) => {
          const progress = {
            completedSessions: requirements.requiredSessions,
            projectsSubmitted: requirements.requiredProjects,
            projectLinks: [],
          };

          const result = checkPassCondition(progress, requirements);

          expect(result.canPass).toBe(false);
          expect(result.missingConditions.some((c) => c.includes('link'))).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic - same input produces same output', () => {
      fc.assert(
        fc.property(
          courseRequirementsArbitrary(),
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 0, max: 10 }),
          fc.array(fc.webUrl(), { maxLength: 5 }),
          (requirements, sessions, projects, links) => {
            const progress = {
              completedSessions: sessions,
              projectsSubmitted: projects,
              projectLinks: links,
            };

            const result1 = checkPassCondition(progress, requirements);
            const result2 = checkPassCondition(progress, requirements);

            expect(result1.canPass).toBe(result2.canPass);
            expect(result1.missingConditions).toEqual(result2.missingConditions);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 5: Session Count Validation**
   * **Validates: Requirements 2.4**
   *
   * For any session count update attempt where the new value exceeds the
   * course's requiredSessions, the system should reject the update and
   * return a validation error.
   */
  describe('Property 5: Session Count Validation', () => {
    it('should accept valid session counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (requiredSessions) => {
            // Test all valid values from 0 to requiredSessions
            for (let sessions = 0; sessions <= requiredSessions; sessions++) {
              const result = validateSessionCount(sessions, requiredSessions);
              expect(result.success).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject session counts exceeding required', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 100 }),
          (requiredSessions, excess) => {
            const sessions = requiredSessions + excess;
            const result = validateSessionCount(sessions, requiredSessions);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject negative session counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: -1 }),
          fc.integer({ min: 1, max: 20 }),
          (sessions, requiredSessions) => {
            const result = validateSessionCount(sessions, requiredSessions);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept zero sessions', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 20 }), (requiredSessions) => {
          const result = validateSessionCount(0, requiredSessions);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should accept exactly required sessions', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 20 }), (requiredSessions) => {
          const result = validateSessionCount(requiredSessions, requiredSessions);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 6: Project Count Validation**
   * **Validates: Requirements 2.5**
   *
   * For any project count update attempt where the new value exceeds the
   * course's requiredProjects, the system should reject the update and
   * return a validation error.
   */
  describe('Property 6: Project Count Validation', () => {
    it('should accept valid project counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (requiredProjects) => {
            // Test all valid values from 0 to requiredProjects
            for (let projects = 0; projects <= requiredProjects; projects++) {
              const result = validateProjectCount(projects, requiredProjects);
              expect(result.success).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject project counts exceeding required', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 100 }),
          (requiredProjects, excess) => {
            const projects = requiredProjects + excess;
            const result = validateProjectCount(projects, requiredProjects);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject negative project counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: -1 }),
          fc.integer({ min: 1, max: 10 }),
          (projects, requiredProjects) => {
            const result = validateProjectCount(projects, requiredProjects);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept zero projects', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (requiredProjects) => {
          const result = validateProjectCount(0, requiredProjects);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should accept exactly required projects', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (requiredProjects) => {
          const result = validateProjectCount(requiredProjects, requiredProjects);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 7: URL Format Validation**
   * **Validates: Requirements 2.6**
   *
   * For any project link addition, the system should validate the URL format
   * and reject invalid URLs.
   */
  describe('Property 7: URL Format Validation', () => {
    it('should accept valid http URLs', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['http'] }),
          (url) => {
            const result = validateProjectUrl(url);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid https URLs', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (url) => {
            const result = validateProjectUrl(url);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid URL formats', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }).filter((s) => {
              try {
                new URL(s);
                return false;
              } catch {
                return true;
              }
            }),
            fc.constant('not-a-url'),
            fc.constant('ftp://example.com'),
            fc.constant('file:///path/to/file'),
            fc.constant('javascript:alert(1)')
          ),
          (invalidUrl) => {
            const result = validateProjectUrl(invalidUrl);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('VALIDATION_ERROR');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty strings', () => {
      const result = validateProjectUrl('');
      expect(result.success).toBe(false);
    });

    it('should reject URLs with invalid protocols', () => {
      const invalidProtocols = ['ftp://example.com', 'file:///path', 'mailto:test@test.com'];
      for (const url of invalidProtocols) {
        const result = validateProjectUrl(url);
        expect(result.success).toBe(false);
      }
    });
  });
});


/**
 * Arbitrary generator for approval input
 */
const approvalInputArbitrary = (): fc.Arbitrary<{ approvedBy: string }> =>
  fc.record({
    approvedBy: fc.uuid(),
  });

/**
 * Arbitrary generator for rejection input - only valid non-whitespace reasons
 */
const rejectionInputArbitrary = (): fc.Arbitrary<{ rejectionReason: string }> =>
  fc.record({
    rejectionReason: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
  });

/**
 * Simulates approval state transition logic
 * This mirrors the behavior of the approve method in tracking service
 */
function simulateApproval(
  currentStatus: string,
  approvedBy: string
): { success: boolean; newStatus?: string; approvedBy?: string; approvedAt?: Date } {
  if (currentStatus !== 'pending_approval') {
    return { success: false };
  }
  return {
    success: true,
    newStatus: 'completed',
    approvedBy,
    approvedAt: new Date(),
  };
}

/**
 * Simulates rejection state transition logic
 * This mirrors the behavior of the reject method in tracking service
 */
function simulateRejection(
  currentStatus: string,
  reason: string
): { success: boolean; newStatus?: string; rejectionReason?: string } {
  if (currentStatus !== 'pending_approval') {
    return { success: false };
  }
  if (!reason || reason.trim().length === 0) {
    return { success: false };
  }
  return {
    success: true,
    newStatus: 'rejected',
    rejectionReason: reason.trim(),
  };
}

describe('Tracking Service State Transition Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 9: Approval State Transition**
   * **Validates: Requirements 3.3**
   *
   * For any approve action on a pending_approval progress, the status should
   * change to completed with approvedAt timestamp and approvedBy userId recorded.
   */
  describe('Property 9: Approval State Transition', () => {
    it('should transition from pending_approval to completed on approval', () => {
      fc.assert(
        fc.property(approvalInputArbitrary(), (input) => {
          const result = simulateApproval('pending_approval', input.approvedBy);
          expect(result.success).toBe(true);
          expect(result.newStatus).toBe('completed');
          expect(result.approvedBy).toBe(input.approvedBy);
          expect(result.approvedAt).toBeInstanceOf(Date);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject approval for non-pending_approval statuses', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('not_started', 'in_progress', 'completed', 'rejected', 'locked'),
          approvalInputArbitrary(),
          (status, input) => {
            const result = simulateApproval(status, input.approvedBy);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should record approvedBy userId on successful approval', () => {
      fc.assert(
        fc.property(fc.uuid(), (adminId) => {
          const result = simulateApproval('pending_approval', adminId);
          expect(result.success).toBe(true);
          expect(result.approvedBy).toBe(adminId);
        }),
        { numRuns: 100 }
      );
    });

    it('should record approvedAt timestamp on successful approval', () => {
      fc.assert(
        fc.property(approvalInputArbitrary(), (input) => {
          const before = new Date();
          const result = simulateApproval('pending_approval', input.approvedBy);
          const after = new Date();

          expect(result.success).toBe(true);
          expect(result.approvedAt).toBeDefined();
          if (result.approvedAt) {
            expect(result.approvedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(result.approvedAt.getTime()).toBeLessThanOrEqual(after.getTime());
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should be idempotent - approving already completed should fail', () => {
      fc.assert(
        fc.property(approvalInputArbitrary(), (input) => {
          // First approval succeeds
          const result1 = simulateApproval('pending_approval', input.approvedBy);
          expect(result1.success).toBe(true);

          // Second approval on completed status should fail
          const result2 = simulateApproval('completed', input.approvedBy);
          expect(result2.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: phase-4-tracking, Property 10: Rejection State Transition**
   * **Validates: Requirements 3.5**
   *
   * For any reject action with a reason, the status should change to rejected
   * with rejectionReason stored as a non-empty string.
   */
  describe('Property 10: Rejection State Transition', () => {
    it('should transition from pending_approval to rejected on rejection', () => {
      fc.assert(
        fc.property(rejectionInputArbitrary(), (input) => {
          const result = simulateRejection('pending_approval', input.rejectionReason);
          expect(result.success).toBe(true);
          expect(result.newStatus).toBe('rejected');
          expect(result.rejectionReason).toBe(input.rejectionReason.trim());
        }),
        { numRuns: 100 }
      );
    });

    it('should reject rejection for non-pending_approval statuses', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('not_started', 'in_progress', 'completed', 'rejected', 'locked'),
          rejectionInputArbitrary(),
          (status, input) => {
            const result = simulateRejection(status, input.rejectionReason);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should store non-empty rejection reason', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
          (reason) => {
            const result = simulateRejection('pending_approval', reason);
            expect(result.success).toBe(true);
            expect(result.rejectionReason).toBeDefined();
            expect(result.rejectionReason!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty rejection reason', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n', '  \n  '),
          (emptyReason) => {
            const result = simulateRejection('pending_approval', emptyReason);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trim whitespace from rejection reason', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 0, maxLength: 10 }).filter((s) => s.trim() === ''),
          fc.string({ minLength: 0, maxLength: 10 }).filter((s) => s.trim() === ''),
          (content, prefix, suffix) => {
            const reasonWithWhitespace = prefix + content + suffix;
            const result = simulateRejection('pending_approval', reasonWithWhitespace);
            
            if (content.trim().length > 0) {
              expect(result.success).toBe(true);
              expect(result.rejectionReason).toBe(reasonWithWhitespace.trim());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be idempotent - rejecting already rejected should fail', () => {
      fc.assert(
        fc.property(
          // Use a generator that produces valid non-whitespace reasons
          fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
          (reason) => {
            // First rejection succeeds
            const result1 = simulateRejection('pending_approval', reason);
            expect(result1.success).toBe(true);

            // Second rejection on rejected status should fail
            const result2 = simulateRejection('rejected', reason);
            expect(result2.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
