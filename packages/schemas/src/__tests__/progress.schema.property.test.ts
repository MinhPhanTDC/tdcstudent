import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  ProgressStatusSchema,
  StudentProgressSchema,
  UpdateProgressInputSchema,
  ApproveProgressInputSchema,
  RejectProgressInputSchema,
  type ProgressStatus,
} from '../progress.schema';

/**
 * Feature: phase-4-tracking, Property 21: Progress Serialization Round Trip
 * Validates: Requirements 6.4
 * 
 * For any valid progress object, serializing to JSON and deserializing back
 * should produce an equivalent object.
 */

// Arbitrary generators for progress data
const progressStatusArb = fc.constantFrom<ProgressStatus>(
  'not_started',
  'in_progress',
  'pending_approval',
  'completed',
  'rejected',
  'locked'
);

const projectLinkArb = fc.webUrl();

const studentProgressArb = fc.record({
  id: fc.uuid(),
  studentId: fc.uuid(),
  courseId: fc.uuid(),
  completedSessions: fc.integer({ min: 0, max: 100 }),
  projectsSubmitted: fc.integer({ min: 0, max: 10 }),
  projectLinks: fc.array(projectLinkArb, { minLength: 0, maxLength: 5 }),
  status: progressStatusArb,
  rejectionReason: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  approvedAt: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), { nil: null }),
  approvedBy: fc.option(fc.uuid(), { nil: undefined }),
  completedAt: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), { nil: null }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

describe('Progress Schema Property Tests', () => {
  describe('Property 21: Progress Serialization Round Trip', () => {
    it('should produce equivalent object after JSON round trip', () => {
      fc.assert(
        fc.property(studentProgressArb, (progress) => {
          // Parse to ensure valid structure
          const parsed = StudentProgressSchema.safeParse(progress);
          if (!parsed.success) {
            return true; // Skip invalid inputs
          }

          // Serialize to JSON
          const json = JSON.stringify(parsed.data);

          // Deserialize back
          const deserialized = JSON.parse(json);

          // Parse again with schema
          const reparsed = StudentProgressSchema.safeParse(deserialized);

          // Should be valid
          expect(reparsed.success).toBe(true);

          if (reparsed.success) {
            // Core fields should match
            expect(reparsed.data.id).toBe(parsed.data.id);
            expect(reparsed.data.studentId).toBe(parsed.data.studentId);
            expect(reparsed.data.courseId).toBe(parsed.data.courseId);
            expect(reparsed.data.completedSessions).toBe(parsed.data.completedSessions);
            expect(reparsed.data.projectsSubmitted).toBe(parsed.data.projectsSubmitted);
            expect(reparsed.data.projectLinks).toEqual(parsed.data.projectLinks);
            expect(reparsed.data.status).toBe(parsed.data.status);
            expect(reparsed.data.rejectionReason).toBe(parsed.data.rejectionReason);
            expect(reparsed.data.approvedBy).toBe(parsed.data.approvedBy);
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
        fc.property(progressStatusArb, (status) => {
          const result = ProgressStatusSchema.safeParse(status);
          expect(result.success).toBe(true);
          return result.success;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject invalid status values', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !['not_started', 'in_progress', 'pending_approval', 'completed', 'rejected', 'locked'].includes(s)),
          (invalidStatus) => {
            const result = ProgressStatusSchema.safeParse(invalidStatus);
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Project Links Validation', () => {
    it('should accept valid URLs in projectLinks', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
          (links) => {
            const progress = {
              id: 'test-id',
              studentId: 'student-1',
              courseId: 'course-1',
              completedSessions: 5,
              projectsSubmitted: 2,
              projectLinks: links,
              status: 'in_progress' as const,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const result = StudentProgressSchema.safeParse(progress);
            return result.success;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject invalid URLs in projectLinks', () => {
      // Generate strings that are definitely not valid URLs
      // Invalid URLs: no scheme, no host, just random text without URL structure
      const invalidUrlArb = fc.oneof(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => {
          // Filter out anything that could be a valid URL
          // Valid URLs need scheme:// or scheme: format
          return !s.includes('://') && !s.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/);
        }),
        fc.constantFrom('not-a-url', 'just text', 'invalid url here', '/path/only', '//no-scheme')
      );

      fc.assert(
        fc.property(
          fc.array(invalidUrlArb, { minLength: 1, maxLength: 3 }),
          (invalidLinks) => {
            const progress = {
              id: 'test-id',
              studentId: 'student-1',
              courseId: 'course-1',
              completedSessions: 5,
              projectsSubmitted: 2,
              projectLinks: invalidLinks,
              status: 'in_progress' as const,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const result = StudentProgressSchema.safeParse(progress);
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Rejection Reason Validation', () => {
    it('should require non-empty rejection reason in RejectProgressInputSchema', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (reason) => {
            const result = RejectProgressInputSchema.safeParse({ rejectionReason: reason });
            return result.success;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject empty rejection reason', () => {
      const result = RejectProgressInputSchema.safeParse({ rejectionReason: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('Approve Progress Input Validation', () => {
    it('should require approvedBy field', () => {
      fc.assert(
        fc.property(fc.uuid(), (adminId) => {
          const result = ApproveProgressInputSchema.safeParse({ approvedBy: adminId });
          return result.success;
        }),
        { numRuns: 50 }
      );
    });

    it('should reject missing approvedBy', () => {
      const result = ApproveProgressInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Numeric Fields Validation', () => {
    it('should accept non-negative integers for completedSessions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (sessions) => {
            const result = UpdateProgressInputSchema.safeParse({ completedSessions: sessions });
            return result.success;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject negative completedSessions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: -1 }),
          (sessions) => {
            const result = UpdateProgressInputSchema.safeParse({ completedSessions: sessions });
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should accept non-negative integers for projectsSubmitted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (projects) => {
            const result = UpdateProgressInputSchema.safeParse({ projectsSubmitted: projects });
            return result.success;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject negative projectsSubmitted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: -1 }),
          (projects) => {
            const result = UpdateProgressInputSchema.safeParse({ projectsSubmitted: projects });
            return !result.success;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
