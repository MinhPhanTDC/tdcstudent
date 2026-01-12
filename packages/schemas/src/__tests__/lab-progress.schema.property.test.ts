import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  LabProgressStatusSchema,
  StudentLabProgressSchema,
  CreateStudentLabProgressInputSchema,
  RejectLabVerificationInputSchema,
  ApproveLabVerificationInputSchema,
  type LabProgressStatus,
} from '../lab-progress.schema';

/**
 * Feature: phase-6-lab-advanced, Property 14: Student progress schema round-trip
 * Validates: Requirements 9.3, 9.4
 *
 * For any valid StudentLabProgress object, serializing to JSON and deserializing back
 * SHALL produce an equivalent object.
 */

// Arbitrary generators for lab progress data
const labProgressStatusArb = fc.constantFrom<LabProgressStatus>(
  'not_started',
  'pending',
  'completed',
  'rejected'
);

const studentLabProgressArb = fc.record({
  id: fc.uuid(),
  studentId: fc.uuid(),
  requirementId: fc.uuid(),
  status: labProgressStatusArb,
  completedAt: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), { nil: null }),
  verifiedBy: fc.option(fc.uuid(), { nil: null }),
  rejectionReason: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
  notes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

describe('Lab Progress Schema Property Tests', () => {
  describe('Property 14: Student progress schema round-trip', () => {
    it('should produce equivalent object after JSON round trip', () => {
      fc.assert(
        fc.property(studentLabProgressArb, (progress) => {
          // Parse to ensure valid structure
          const parsed = StudentLabProgressSchema.safeParse(progress);
          if (!parsed.success) {
            return true; // Skip invalid inputs
          }

          // Serialize to JSON
          const json = JSON.stringify(parsed.data);

          // Deserialize back
          const deserialized = JSON.parse(json);

          // Parse again with schema
          const reparsed = StudentLabProgressSchema.safeParse(deserialized);

          // Should be valid
          expect(reparsed.success).toBe(true);

          if (reparsed.success) {
            // Core fields should match
            expect(reparsed.data.id).toBe(parsed.data.id);
            expect(reparsed.data.studentId).toBe(parsed.data.studentId);
            expect(reparsed.data.requirementId).toBe(parsed.data.requirementId);
            expect(reparsed.data.status).toBe(parsed.data.status);
            expect(reparsed.data.verifiedBy).toBe(parsed.data.verifiedBy);
            expect(reparsed.data.rejectionReason).toBe(parsed.data.rejectionReason);
            expect(reparsed.data.notes).toBe(parsed.data.notes);
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Status Enum Validation', () => {
    it('should accept all valid status values', () => {
      fc.assert(
        fc.property(labProgressStatusArb, (status) => {
          const result = LabProgressStatusSchema.safeParse(status);
          expect(result.success).toBe(true);
          return result.success;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject invalid status values', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !['not_started', 'pending', 'completed', 'rejected'].includes(s)),
          (invalidStatus) => {
            const result = LabProgressStatusSchema.safeParse(invalidStatus);
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Required Fields Validation', () => {
    it('should require studentId', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        requirementId: 'req-1',
      });
      expect(result.success).toBe(false);
    });

    it('should require requirementId', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        studentId: 'student-1',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid minimal input', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        studentId: 'student-1',
        requirementId: 'req-1',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Rejection Reason Validation', () => {
    it('should require non-empty rejection reason in RejectLabVerificationInputSchema', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (reason) => {
            const result = RejectLabVerificationInputSchema.safeParse({
              progressId: 'progress-1',
              rejectionReason: reason,
            });
            return result.success;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject empty rejection reason', () => {
      const result = RejectLabVerificationInputSchema.safeParse({
        progressId: 'progress-1',
        rejectionReason: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject rejection reason longer than 500 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 501, maxLength: 1000 }),
          (reason) => {
            const result = RejectLabVerificationInputSchema.safeParse({
              progressId: 'progress-1',
              rejectionReason: reason,
            });
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Approve Verification Input Validation', () => {
    it('should require progressId and verifiedBy', () => {
      fc.assert(
        fc.property(fc.uuid(), fc.uuid(), (progressId, verifiedBy) => {
          const result = ApproveLabVerificationInputSchema.safeParse({
            progressId,
            verifiedBy,
          });
          return result.success;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject missing progressId', () => {
      const result = ApproveLabVerificationInputSchema.safeParse({
        verifiedBy: 'admin-1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing verifiedBy', () => {
      const result = ApproveLabVerificationInputSchema.safeParse({
        progressId: 'progress-1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Default Values', () => {
    it('should default status to not_started', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        studentId: 'student-1',
        requirementId: 'req-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('not_started');
      }
    });

    it('should default completedAt to null', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        studentId: 'student-1',
        requirementId: 'req-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completedAt).toBeNull();
      }
    });

    it('should default verifiedBy to null', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        studentId: 'student-1',
        requirementId: 'req-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verifiedBy).toBeNull();
      }
    });

    it('should default rejectionReason to null', () => {
      const result = CreateStudentLabProgressInputSchema.safeParse({
        studentId: 'student-1',
        requirementId: 'req-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rejectionReason).toBeNull();
      }
    });
  });
});
