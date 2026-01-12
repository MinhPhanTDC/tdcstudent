import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  RejectProgressInputSchema,
  ApproveProgressInputSchema,
  StudentProgressSchema,
  type ProgressStatus,
} from '@tdc/schemas';

/**
 * Valid date arbitrary that ensures dates are valid (not NaN)
 */
const validDateArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-01-01').getTime() })
  .map((timestamp) => new Date(timestamp));

/**
 * Feature: phase-4-tracking, Property 19: Rejection Reason Required
 * Validates: Requirements 6.2
 *
 * For any progress with status rejected, the rejectionReason field
 * should be a non-empty string.
 */
describe('Property 19: Rejection Reason Required', () => {
  /**
   * Validates that the RejectProgressInputSchema requires a non-empty rejection reason
   */
  it('should accept valid non-empty rejection reasons', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
        (reason) => {
          const result = RejectProgressInputSchema.safeParse({ rejectionReason: reason });
          expect(result.success).toBe(true);
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty rejection reason', () => {
    const result = RejectProgressInputSchema.safeParse({ rejectionReason: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Lý do từ chối không được để trống');
    }
  });

  it('should reject missing rejection reason', () => {
    const result = RejectProgressInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  /**
   * Validates that rejected progress records must have a rejection reason
   * This tests the data model constraint
   */
  it('should validate rejected progress has rejectionReason in data model', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          studentId: fc.uuid(),
          courseId: fc.uuid(),
          completedSessions: fc.integer({ min: 0, max: 20 }),
          projectsSubmitted: fc.integer({ min: 0, max: 10 }),
          projectLinks: fc.array(fc.webUrl(), { maxLength: 5 }),
          status: fc.constant('rejected' as ProgressStatus),
          rejectionReason: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
          createdAt: validDateArb,
          updatedAt: validDateArb,
        }),
        (progress) => {
          const result = StudentProgressSchema.safeParse(progress);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.status).toBe('rejected');
            expect(result.data.rejectionReason).toBeDefined();
            expect(result.data.rejectionReason!.length).toBeGreaterThan(0);
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates that rejection reason is preserved through schema parsing
   */
  it('should preserve rejection reason through schema parsing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
        (reason) => {
          const input = { rejectionReason: reason };
          const result = RejectProgressInputSchema.safeParse(input);
          
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.rejectionReason).toBe(reason);
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: phase-4-tracking, Property 20: Approval Metadata Required
 * Validates: Requirements 6.3
 *
 * For any progress with status completed that was approved, the approvedAt
 * timestamp and approvedBy userId should be present.
 */
describe('Property 20: Approval Metadata Required', () => {
  /**
   * Validates that ApproveProgressInputSchema requires approvedBy field
   */
  it('should accept valid approvedBy userId', () => {
    fc.assert(
      fc.property(fc.uuid(), (adminId) => {
        const result = ApproveProgressInputSchema.safeParse({ approvedBy: adminId });
        expect(result.success).toBe(true);
        return result.success;
      }),
      { numRuns: 100 }
    );
  });

  it('should reject missing approvedBy', () => {
    const result = ApproveProgressInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty approvedBy', () => {
    const result = ApproveProgressInputSchema.safeParse({ approvedBy: '' });
    expect(result.success).toBe(false);
  });

  /**
   * Validates that completed progress records can have approval metadata
   */
  it('should validate completed progress with approval metadata', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          studentId: fc.uuid(),
          courseId: fc.uuid(),
          completedSessions: fc.integer({ min: 0, max: 20 }),
          projectsSubmitted: fc.integer({ min: 0, max: 10 }),
          projectLinks: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
          status: fc.constant('completed' as ProgressStatus),
          approvedAt: validDateArb,
          approvedBy: fc.uuid(),
          completedAt: validDateArb,
          createdAt: validDateArb,
          updatedAt: validDateArb,
        }),
        (progress) => {
          const result = StudentProgressSchema.safeParse(progress);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.status).toBe('completed');
            expect(result.data.approvedAt).toBeDefined();
            expect(result.data.approvedBy).toBeDefined();
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates that approvedBy is preserved through schema parsing
   */
  it('should preserve approvedBy through schema parsing', () => {
    fc.assert(
      fc.property(fc.uuid(), (adminId) => {
        const input = { approvedBy: adminId };
        const result = ApproveProgressInputSchema.safeParse(input);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.approvedBy).toBe(adminId);
        }
        return result.success;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates that approval timestamp is a valid date when present
   */
  it('should accept valid approval timestamps', () => {
    fc.assert(
      fc.property(
        validDateArb,
        fc.uuid(),
        (approvedAt, approvedBy) => {
          const progress = {
            id: 'test-id',
            studentId: 'student-1',
            courseId: 'course-1',
            completedSessions: 10,
            projectsSubmitted: 2,
            projectLinks: ['https://example.com'],
            status: 'completed' as ProgressStatus,
            approvedAt,
            approvedBy,
            completedAt: approvedAt,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          };

          const result = StudentProgressSchema.safeParse(progress);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.approvedAt).toBeInstanceOf(Date);
            expect(result.data.approvedBy).toBe(approvedBy);
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });
});
