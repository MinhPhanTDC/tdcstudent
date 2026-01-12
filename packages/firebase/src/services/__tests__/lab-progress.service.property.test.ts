import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  determineStatusOnComplete,
  isPendingVerification,
  createApprovalState,
  createRejectionState,
  validateRejectionReason,
} from '../lab-progress.service';
import type { StudentLabProgress, LabProgressStatus } from '@tdc/schemas';

/**
 * Feature: phase-6-lab-advanced, Property 3: Verification flow status transition
 * Validates: Requirements 2.1, 2.2
 *
 * For any requirement with requiresVerification=true, marking as complete SHALL result
 * in status='pending'. For requirements with requiresVerification=false, marking as
 * complete SHALL result in status='completed'.
 */
describe('Property 3: Verification flow status transition', () => {
  it('should return pending status when requiresVerification is true', () => {
    fc.assert(
      fc.property(fc.boolean(), (requiresVerification) => {
        const status = determineStatusOnComplete(requiresVerification);
        
        if (requiresVerification) {
          expect(status).toBe('pending');
        } else {
          expect(status).toBe('completed');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should always return pending for requiresVerification=true', () => {
    // Test specifically with true
    const status = determineStatusOnComplete(true);
    expect(status).toBe('pending');
  });

  it('should always return completed for requiresVerification=false', () => {
    // Test specifically with false
    const status = determineStatusOnComplete(false);
    expect(status).toBe('completed');
  });

  it('should be deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(fc.boolean(), (requiresVerification) => {
        const status1 = determineStatusOnComplete(requiresVerification);
        const status2 = determineStatusOnComplete(requiresVerification);
        expect(status1).toBe(status2);
      }),
      { numRuns: 100 }
    );
  });

  it('should only return valid LabProgressStatus values', () => {
    fc.assert(
      fc.property(fc.boolean(), (requiresVerification) => {
        const status = determineStatusOnComplete(requiresVerification);
        const validStatuses: LabProgressStatus[] = ['not_started', 'pending', 'completed', 'rejected'];
        expect(validStatuses).toContain(status);
      }),
      { numRuns: 100 }
    );
  });

  it('should never return not_started or rejected from determineStatusOnComplete', () => {
    fc.assert(
      fc.property(fc.boolean(), (requiresVerification) => {
        const status = determineStatusOnComplete(requiresVerification);
        expect(status).not.toBe('not_started');
        expect(status).not.toBe('rejected');
      }),
      { numRuns: 100 }
    );
  });

  it('verification flow: true -> pending, false -> completed (exhaustive)', () => {
    // Exhaustive test for both cases
    expect(determineStatusOnComplete(true)).toBe('pending');
    expect(determineStatusOnComplete(false)).toBe('completed');
  });
});


/**
 * Feature: phase-6-lab-advanced, Property 7: Verification approval state
 * Validates: Requirements 4.3
 *
 * For any approved verification, the StudentLabProgress record SHALL have
 * status='completed', verifiedBy set to the admin's ID, and completedAt
 * set to the approval timestamp.
 */
describe('Property 7: Verification approval state', () => {

  it('should set status to completed after approval', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.date(), (adminId, timestamp) => {
        const approvalState = createApprovalState(adminId, timestamp);
        expect(approvalState.status).toBe('completed');
      }),
      { numRuns: 100 }
    );
  });

  it('should set verifiedBy to the admin ID', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.date(), (adminId, timestamp) => {
        const approvalState = createApprovalState(adminId, timestamp);
        expect(approvalState.verifiedBy).toBe(adminId);
      }),
      { numRuns: 100 }
    );
  });

  it('should set completedAt to the approval timestamp', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.date(), (adminId, timestamp) => {
        const approvalState = createApprovalState(adminId, timestamp);
        expect(approvalState.completedAt).toEqual(timestamp);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce all required fields for approval', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.date(), (adminId, timestamp) => {
        const approvalState = createApprovalState(adminId, timestamp);
        
        // All required fields must be present
        expect(approvalState).toHaveProperty('status');
        expect(approvalState).toHaveProperty('verifiedBy');
        expect(approvalState).toHaveProperty('completedAt');
        
        // Values must be correct types
        expect(typeof approvalState.status).toBe('string');
        expect(typeof approvalState.verifiedBy).toBe('string');
        expect(approvalState.completedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve admin ID exactly as provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.date(),
        (adminId, timestamp) => {
          const approvalState = createApprovalState(adminId, timestamp);
          expect(approvalState.verifiedBy).toBe(adminId);
          expect(approvalState.verifiedBy).toHaveLength(adminId.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve timestamp exactly as provided', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.date(), (adminId, timestamp) => {
        const approvalState = createApprovalState(adminId, timestamp);
        expect(approvalState.completedAt?.getTime()).toBe(timestamp.getTime());
      }),
      { numRuns: 100 }
    );
  });

  it('isPendingVerification should return true only for pending status', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('not_started', 'pending', 'completed', 'rejected'),
        (status) => {
          const progress: StudentLabProgress = {
            id: 'test-id',
            studentId: 'student-1',
            requirementId: 'req-1',
            status: status as LabProgressStatus,
            completedAt: null,
            verifiedBy: null,
            rejectionReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const isPending = isPendingVerification(progress);
          expect(isPending).toBe(status === 'pending');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('approval state should be deterministic', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.date(), (adminId, timestamp) => {
        const state1 = createApprovalState(adminId, timestamp);
        const state2 = createApprovalState(adminId, timestamp);
        
        expect(state1.status).toBe(state2.status);
        expect(state1.verifiedBy).toBe(state2.verifiedBy);
        expect(state1.completedAt?.getTime()).toBe(state2.completedAt?.getTime());
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: phase-6-lab-advanced, Property 8: Verification rejection state
 * Validates: Requirements 4.4
 *
 * For any rejected verification, the StudentLabProgress record SHALL have
 * status='rejected' and rejectionReason set to a non-empty string.
 */
describe('Property 8: Verification rejection state', () => {
  it('should set status to rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          const rejectionState = createRejectionState(reason);
          expect(rejectionState.status).toBe('rejected');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should set rejectionReason to the provided reason', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          const rejectionState = createRejectionState(reason);
          expect(rejectionState.rejectionReason).toBe(reason);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce all required fields for rejection', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          const rejectionState = createRejectionState(reason);
          
          // All required fields must be present
          expect(rejectionState).toHaveProperty('status');
          expect(rejectionState).toHaveProperty('rejectionReason');
          
          // Values must be correct types
          expect(typeof rejectionState.status).toBe('string');
          expect(typeof rejectionState.rejectionReason).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve rejection reason exactly as provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          const rejectionState = createRejectionState(reason);
          expect(rejectionState.rejectionReason).toBe(reason);
          expect(rejectionState.rejectionReason).toHaveLength(reason.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validateRejectionReason should return true for non-empty strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          // Only test non-whitespace strings
          if (reason.trim().length > 0) {
            expect(validateRejectionReason(reason)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validateRejectionReason should return false for empty string', () => {
    expect(validateRejectionReason('')).toBe(false);
  });

  it('validateRejectionReason should return false for whitespace-only strings', () => {
    const whitespaceStrings = ['   ', '\t', '\n', '\r', '  \t\n  ', '\t\t\t'];
    whitespaceStrings.forEach((whitespace) => {
      expect(validateRejectionReason(whitespace)).toBe(false);
    });
  });

  it('rejection state should be deterministic', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          const state1 = createRejectionState(reason);
          const state2 = createRejectionState(reason);
          
          expect(state1.status).toBe(state2.status);
          expect(state1.rejectionReason).toBe(state2.rejectionReason);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejection reason validation should be consistent with rejection state creation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (reason) => {
          const isValid = validateRejectionReason(reason);
          
          // If valid, creating rejection state should work
          if (isValid) {
            const state = createRejectionState(reason);
            expect(state.rejectionReason).toBe(reason);
            expect(state.status).toBe('rejected');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in rejection reason', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (reason) => {
          const rejectionState = createRejectionState(reason);
          // Should preserve all characters including special ones
          expect(rejectionState.rejectionReason).toBe(reason);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle unicode characters in rejection reason', () => {
    const unicodeReasons = [
      'Lý do từ chối: không đạt yêu cầu',
      '拒绝原因：不符合要求',
      'Причина отказа: не соответствует требованиям',
      '🚫 Rejected: Does not meet requirements',
      'Αιτία απόρριψης: δεν πληροί τις απαιτήσεις',
    ];
    
    unicodeReasons.forEach((reason) => {
      const rejectionState = createRejectionState(reason);
      expect(rejectionState.rejectionReason).toBe(reason);
      expect(rejectionState.status).toBe('rejected');
    });
  });
});
