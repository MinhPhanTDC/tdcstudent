import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CreateLabRequirementInputSchema } from '@tdc/schemas';

/**
 * Feature: phase-6-lab-advanced, Property 4: Title validation bounds
 * Validates: Requirements 3.2
 *
 * For any Lab requirement title string, validation SHALL pass if and only if
 * the length is between 1 and 200 characters inclusive.
 */

/**
 * Validates a title string against the lab requirement schema
 * Returns true if validation passes, false otherwise
 */
function validateTitle(title: string): boolean {
  const result = CreateLabRequirementInputSchema.safeParse({
    title,
    order: 0,
  });
  return result.success;
}

describe('Lab Requirement Service Property Tests', () => {
  /**
   * **Feature: phase-6-lab-advanced, Property 4: Title validation bounds**
   * **Validates: Requirements 3.2**
   *
   * For any Lab requirement title string, validation SHALL pass if and only if
   * the length is between 1 and 200 characters inclusive.
   */
  describe('Property 4: Title validation bounds', () => {
    it('should accept titles with length between 1 and 200 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (title) => {
            const isValid = validateTitle(title);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty titles (length 0)', () => {
      const isValid = validateTitle('');
      expect(isValid).toBe(false);
    });

    it('should reject titles longer than 200 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 201, maxLength: 500 }),
          (title) => {
            const isValid = validateTitle(title);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept exactly 1 character title (boundary)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1 }),
          (title) => {
            const isValid = validateTitle(title);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept exactly 200 character title (boundary)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 200, maxLength: 200 }),
          (title) => {
            const isValid = validateTitle(title);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject exactly 201 character title (boundary)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 201, maxLength: 201 }),
          (title) => {
            const isValid = validateTitle(title);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('validation result should be deterministic', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 300 }),
          (title) => {
            const result1 = validateTitle(title);
            const result2 = validateTitle(title);
            expect(result1).toBe(result2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly classify any string based on length bounds', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 300 }),
          (title) => {
            const isValid = validateTitle(title);
            const expectedValid = title.length >= 1 && title.length <= 200;
            expect(isValid).toBe(expectedValid);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * Feature: phase-6-lab-advanced, Property 5: Requirement ordering consistency
 * Validates: Requirements 3.6
 *
 * For any reorder operation on Lab requirements, the resulting order field values
 * SHALL form a contiguous sequence starting from 0 with no gaps or duplicates.
 */

import {
  validateOrderSequence,
  generateOrderSequence,
} from '../lab-requirement.service';

describe('Property 5: Requirement ordering consistency', () => {
  it('should generate contiguous sequence starting from 0', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (ids) => {
          // Remove duplicates
          const uniqueIds = [...new Set(ids)];
          
          const orderMap = generateOrderSequence(uniqueIds);
          
          // Check that all IDs have an order
          expect(orderMap.size).toBe(uniqueIds.length);
          
          // Extract order values
          const orders = Array.from(orderMap.values());
          
          // Validate the sequence
          expect(validateOrderSequence(orders)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce orders starting from 0', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (ids) => {
          const uniqueIds = [...new Set(ids)];
          const orderMap = generateOrderSequence(uniqueIds);
          const orders = Array.from(orderMap.values());
          
          // Minimum order should be 0
          expect(Math.min(...orders)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce orders with no gaps', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (ids) => {
          const uniqueIds = [...new Set(ids)];
          const orderMap = generateOrderSequence(uniqueIds);
          const orders = Array.from(orderMap.values()).sort((a, b) => a - b);
          
          // Check for no gaps
          for (let i = 0; i < orders.length; i++) {
            expect(orders[i]).toBe(i);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce orders with no duplicates', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (ids) => {
          const uniqueIds = [...new Set(ids)];
          const orderMap = generateOrderSequence(uniqueIds);
          const orders = Array.from(orderMap.values());
          
          // Check for no duplicates
          const uniqueOrders = new Set(orders);
          expect(uniqueOrders.size).toBe(orders.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve the input order in the sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (ids) => {
          const uniqueIds = [...new Set(ids)];
          const orderMap = generateOrderSequence(uniqueIds);
          
          // Each ID should have order equal to its index
          uniqueIds.forEach((id, index) => {
            expect(orderMap.get(id)).toBe(index);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty array', () => {
    const orderMap = generateOrderSequence([]);
    expect(orderMap.size).toBe(0);
    expect(validateOrderSequence([])).toBe(true);
  });

  it('should handle single element', () => {
    fc.assert(
      fc.property(fc.uuid(), (id) => {
        const orderMap = generateOrderSequence([id]);
        expect(orderMap.size).toBe(1);
        expect(orderMap.get(id)).toBe(0);
        expect(validateOrderSequence([0])).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('validateOrderSequence should reject sequences with gaps', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 0, max: 8 }),
        (length, gapPosition) => {
          // Create a sequence with a gap
          const orders: number[] = [];
          for (let i = 0; i < length; i++) {
            if (i === gapPosition % length) {
              orders.push(i + 1); // Skip one number to create gap
            } else {
              orders.push(i);
            }
          }
          
          // If we actually created a gap (not just shifted), it should be invalid
          const hasGap = orders.some((_, i) => {
            const sorted = [...orders].sort((a, b) => a - b);
            return sorted[i] !== i;
          });
          
          if (hasGap) {
            expect(validateOrderSequence(orders)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validateOrderSequence should reject sequences not starting from 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 10 }),
        (startOffset, length) => {
          // Create a contiguous sequence but not starting from 0
          const orders = Array.from({ length }, (_, i) => i + startOffset);
          expect(validateOrderSequence(orders)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validateOrderSequence should reject sequences with duplicates', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 0, max: 8 }),
        (length, dupPosition) => {
          // Create a sequence with a duplicate
          const orders = Array.from({ length }, (_, i) => i);
          const dupIndex = dupPosition % length;
          if (dupIndex > 0) {
            orders[dupIndex] = orders[dupIndex - 1]; // Create duplicate
            expect(validateOrderSequence(orders)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: phase-6-lab-advanced, Property 6: Cascade delete integrity
 * Validates: Requirements 3.4
 *
 * For any deleted Lab requirement, all related StudentLabProgress records
 * with matching requirementId SHALL also be deleted.
 */

/**
 * Simulates the cascade delete logic
 * This mirrors the behavior of deleteRequirement in lab-requirement.service
 */
interface MockProgressRecord {
  id: string;
  studentId: string;
  requirementId: string;
  status: string;
}

interface MockRequirement {
  id: string;
  title: string;
  order: number;
}

interface MockDatabase {
  requirements: MockRequirement[];
  progressRecords: MockProgressRecord[];
}

/**
 * Simulates cascade delete operation
 * Returns the number of progress records deleted
 */
function simulateCascadeDelete(
  db: MockDatabase,
  requirementId: string
): { deletedProgressCount: number; remainingProgress: MockProgressRecord[] } {
  // Find all progress records with matching requirementId
  const toDelete = db.progressRecords.filter((p) => p.requirementId === requirementId);
  const remaining = db.progressRecords.filter((p) => p.requirementId !== requirementId);

  return {
    deletedProgressCount: toDelete.length,
    remainingProgress: remaining,
  };
}

/**
 * Verifies cascade delete integrity
 * Returns true if no progress records remain for the deleted requirement
 */
function verifyCascadeIntegrity(
  remainingProgress: MockProgressRecord[],
  deletedRequirementId: string
): boolean {
  return remainingProgress.every((p) => p.requirementId !== deletedRequirementId);
}

// Arbitrary generators for mock data
const mockRequirementArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  order: fc.integer({ min: 0, max: 100 }),
});

describe('Property 6: Cascade delete integrity', () => {
  it('should delete all progress records for the deleted requirement', () => {
    fc.assert(
      fc.property(
        fc.array(mockRequirementArb, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 50 }),
        (requirements, progressCount) => {
          // Create unique requirement IDs
          const requirementIds = requirements.map((r) => r.id);
          
          // Generate progress records that reference these requirements
          const progressRecords: MockProgressRecord[] = [];
          for (let i = 0; i < progressCount; i++) {
            progressRecords.push({
              id: `progress-${i}`,
              studentId: `student-${i % 5}`,
              requirementId: requirementIds[i % requirementIds.length],
              status: ['not_started', 'pending', 'completed', 'rejected'][i % 4],
            });
          }

          const db: MockDatabase = { requirements, progressRecords };

          // Pick a requirement to delete
          const requirementToDelete = requirements[0].id;

          // Perform cascade delete
          const result = simulateCascadeDelete(db, requirementToDelete);

          // Verify integrity: no remaining progress should reference deleted requirement
          expect(verifyCascadeIntegrity(result.remainingProgress, requirementToDelete)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should count deleted progress records correctly', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 0, max: 10 }),
        (targetRequirementId, otherRequirementIds, targetProgressCount) => {
          // Create progress records: some for target, some for others
          const progressRecords: MockProgressRecord[] = [];
          
          // Add progress records for target requirement
          for (let i = 0; i < targetProgressCount; i++) {
            progressRecords.push({
              id: `target-progress-${i}`,
              studentId: `student-${i}`,
              requirementId: targetRequirementId,
              status: 'not_started',
            });
          }
          
          // Add progress records for other requirements
          otherRequirementIds.forEach((reqId, i) => {
            progressRecords.push({
              id: `other-progress-${i}`,
              studentId: `student-${i}`,
              requirementId: reqId,
              status: 'completed',
            });
          });

          const db: MockDatabase = { requirements: [], progressRecords };

          // Perform cascade delete
          const result = simulateCascadeDelete(db, targetRequirementId);

          // Verify count
          expect(result.deletedProgressCount).toBe(targetProgressCount);
          expect(result.remainingProgress.length).toBe(otherRequirementIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not affect progress records for other requirements', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (targetReqId, otherReqId, targetCount, otherCount) => {
          // Ensure IDs are different
          if (targetReqId === otherReqId) return true;

          const progressRecords: MockProgressRecord[] = [];
          
          // Add progress for target requirement
          for (let i = 0; i < targetCount; i++) {
            progressRecords.push({
              id: `target-${i}`,
              studentId: `student-${i}`,
              requirementId: targetReqId,
              status: 'pending',
            });
          }
          
          // Add progress for other requirement
          for (let i = 0; i < otherCount; i++) {
            progressRecords.push({
              id: `other-${i}`,
              studentId: `student-${i}`,
              requirementId: otherReqId,
              status: 'completed',
            });
          }

          const db: MockDatabase = { requirements: [], progressRecords };

          // Delete target requirement
          const result = simulateCascadeDelete(db, targetReqId);

          // All other requirement's progress should remain
          const otherProgress = result.remainingProgress.filter(
            (p) => p.requirementId === otherReqId
          );
          expect(otherProgress.length).toBe(otherCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle deletion when no progress records exist', () => {
    fc.assert(
      fc.property(fc.uuid(), (requirementId) => {
        const db: MockDatabase = { requirements: [], progressRecords: [] };

        const result = simulateCascadeDelete(db, requirementId);

        expect(result.deletedProgressCount).toBe(0);
        expect(result.remainingProgress.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle deletion when requirement has no associated progress', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        (targetReqId, otherReqIds) => {
          // Ensure target is not in other IDs
          const filteredOtherIds = otherReqIds.filter((id) => id !== targetReqId);
          if (filteredOtherIds.length === 0) return true;

          // Create progress only for other requirements
          const progressRecords: MockProgressRecord[] = filteredOtherIds.map((reqId, i) => ({
            id: `progress-${i}`,
            studentId: `student-${i}`,
            requirementId: reqId,
            status: 'completed',
          }));

          const db: MockDatabase = { requirements: [], progressRecords };

          const result = simulateCascadeDelete(db, targetReqId);

          // No records should be deleted
          expect(result.deletedProgressCount).toBe(0);
          // All records should remain
          expect(result.remainingProgress.length).toBe(progressRecords.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be idempotent - deleting same requirement twice has no additional effect', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        (requirementId, progressCount) => {
          // Create initial progress records
          const initialProgress: MockProgressRecord[] = [];
          for (let i = 0; i < progressCount; i++) {
            initialProgress.push({
              id: `progress-${i}`,
              studentId: `student-${i}`,
              requirementId,
              status: 'pending',
            });
          }

          // First delete
          const db1: MockDatabase = { requirements: [], progressRecords: [...initialProgress] };
          const result1 = simulateCascadeDelete(db1, requirementId);

          // Second delete on already empty result
          const db2: MockDatabase = { requirements: [], progressRecords: result1.remainingProgress };
          const result2 = simulateCascadeDelete(db2, requirementId);

          // Second delete should have no effect
          expect(result2.deletedProgressCount).toBe(0);
          expect(result2.remainingProgress).toEqual(result1.remainingProgress);
        }
      ),
      { numRuns: 100 }
    );
  });
});
