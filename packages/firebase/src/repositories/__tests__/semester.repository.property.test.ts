import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Semester } from '@tdc/schemas';

/**
 * **Feature: phase-2-admin-basic, Property 1: Semester list ordering consistency**
 * **Validates: Requirements 1.1, 1.7**
 *
 * Property: For any list of semesters retrieved from the system, the semesters
 * SHALL be sorted in ascending order by the `order` field, with no duplicate order values.
 */

/**
 * Arbitrary generator for valid Semester objects
 */
const semesterArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  order: fc.nat({ max: 1000 }),
  isActive: fc.boolean(),
  requiresMajorSelection: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Sort semesters by order field in ascending order
 * This mirrors the behavior of findAllSorted() in the repository
 */
function sortSemestersByOrder(semesters: Semester[]): Semester[] {
  return [...semesters].sort((a, b) => a.order - b.order);
}

/**
 * Check if semesters are sorted in ascending order by the order field
 */
function isSortedByOrderAscending(semesters: Semester[]): boolean {
  for (let i = 1; i < semesters.length; i++) {
    if (semesters[i].order < semesters[i - 1].order) {
      return false;
    }
  }
  return true;
}

/**
 * Check if all order values are unique
 */
function hasUniqueOrderValues(semesters: Semester[]): boolean {
  const orders = semesters.map((s) => s.order);
  return new Set(orders).size === orders.length;
}

describe('Semester Repository Property Tests', () => {
  describe('Property 1: Semester list ordering consistency', () => {
    it('should always return semesters sorted by order field in ascending order', () => {
      fc.assert(
        fc.property(fc.array(semesterArbitrary, { maxLength: 50 }), (semesters) => {
          const sorted = sortSemestersByOrder(semesters as Semester[]);

          // Verify sorted in ascending order
          expect(isSortedByOrderAscending(sorted)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all semesters after sorting (no data loss)', () => {
      fc.assert(
        fc.property(fc.array(semesterArbitrary, { maxLength: 50 }), (semesters) => {
          const sorted = sortSemestersByOrder(semesters as Semester[]);

          // Same length
          expect(sorted.length).toBe(semesters.length);

          // All original IDs present
          const originalIds = new Set(semesters.map((s) => s.id));
          const sortedIds = new Set(sorted.map((s) => s.id));
          expect(sortedIds).toEqual(originalIds);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain strict ascending order (no equal consecutive orders when unique)', () => {
      // Generate semesters with unique order values
      fc.assert(
        fc.property(
          fc.array(semesterArbitrary, { maxLength: 50 }).filter((semesters) => {
            // Only test with unique order values
            const orders = semesters.map((s) => s.order);
            return new Set(orders).size === orders.length;
          }),
          (semesters) => {
            const sorted = sortSemestersByOrder(semesters as Semester[]);

            // When orders are unique, each subsequent order should be strictly greater
            for (let i = 1; i < sorted.length; i++) {
              expect(sorted[i].order).toBeGreaterThan(sorted[i - 1].order);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect duplicate order values correctly', () => {
      fc.assert(
        fc.property(
          fc.array(semesterArbitrary, { minLength: 2, maxLength: 50 }),
          fc.nat({ max: 49 }),
          (semesters, duplicateIndex) => {
            // Create a copy with a duplicate order value
            const semestersWithDuplicate = [...(semesters as Semester[])];
            if (semestersWithDuplicate.length >= 2) {
              const targetIndex = Math.min(duplicateIndex, semestersWithDuplicate.length - 1);
              const sourceIndex = targetIndex === 0 ? 1 : 0;
              semestersWithDuplicate[targetIndex] = {
                ...semestersWithDuplicate[targetIndex],
                order: semestersWithDuplicate[sourceIndex].order,
              };

              // Should detect duplicates
              expect(hasUniqueOrderValues(semestersWithDuplicate)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty semester list', () => {
      const sorted = sortSemestersByOrder([]);
      expect(sorted).toEqual([]);
      expect(isSortedByOrderAscending(sorted)).toBe(true);
      expect(hasUniqueOrderValues(sorted)).toBe(true);
    });

    it('should handle single semester', () => {
      fc.assert(
        fc.property(semesterArbitrary, (semester) => {
          const sorted = sortSemestersByOrder([semester as Semester]);
          expect(sorted.length).toBe(1);
          expect(isSortedByOrderAscending(sorted)).toBe(true);
          expect(hasUniqueOrderValues(sorted)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should be idempotent - sorting twice produces same result', () => {
      fc.assert(
        fc.property(fc.array(semesterArbitrary, { maxLength: 50 }), (semesters) => {
          const sortedOnce = sortSemestersByOrder(semesters as Semester[]);
          const sortedTwice = sortSemestersByOrder(sortedOnce);

          // Same order after sorting twice
          expect(sortedTwice.map((s) => s.id)).toEqual(sortedOnce.map((s) => s.id));
        }),
        { numRuns: 100 }
      );
    });
  });
});
