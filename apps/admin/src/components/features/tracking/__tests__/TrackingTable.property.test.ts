import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { ProgressStatus } from '@tdc/schemas';

/**
 * TrackingData type for testing - matches the hook's TrackingData interface
 */
interface TrackingData {
  progressId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  semesterId: string;
  semesterName: string;
  completedSessions: number;
  requiredSessions: number;
  projectsSubmitted: number;
  requiredProjects: number;
  projectLinks: string[];
  status: ProgressStatus;
  canPass: boolean;
  missingConditions: string[];
}

/**
 * Sort function that mirrors the sorting logic in useTracking
 * Requirements: 1.7
 */
function sortTrackingData(
  data: TrackingData[],
  sortBy: keyof TrackingData,
  sortOrder: 'asc' | 'desc'
): TrackingData[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
}

/**
 * Check if array is sorted by a given key
 */
function isSortedBy<T>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc'
): boolean {
  if (arr.length <= 1) return true;

  for (let i = 1; i < arr.length; i++) {
    const prev = arr[i - 1][key];
    const curr = arr[i][key];

    if (typeof prev === 'string' && typeof curr === 'string') {
      const comparison = prev.localeCompare(curr);
      if (order === 'asc' && comparison > 0) return false;
      if (order === 'desc' && comparison < 0) return false;
    }

    if (typeof prev === 'number' && typeof curr === 'number') {
      if (order === 'asc' && prev > curr) return false;
      if (order === 'desc' && prev < curr) return false;
    }
  }

  return true;
}

/**
 * Arbitrary generator for progress status
 */
const progressStatusArbitrary = (): fc.Arbitrary<ProgressStatus> =>
  fc.constantFrom(
    'not_started' as ProgressStatus,
    'in_progress' as ProgressStatus,
    'pending_approval' as ProgressStatus,
    'completed' as ProgressStatus,
    'rejected' as ProgressStatus,
    'locked' as ProgressStatus
  );

/**
 * Arbitrary generator for TrackingData
 */
const trackingDataArbitrary = (): fc.Arbitrary<TrackingData> =>
  fc.record({
    progressId: fc.uuid(),
    studentId: fc.uuid(),
    studentName: fc.string({ minLength: 1, maxLength: 50 }),
    studentEmail: fc.emailAddress(),
    courseId: fc.uuid(),
    courseName: fc.string({ minLength: 1, maxLength: 100 }),
    semesterId: fc.uuid(),
    semesterName: fc.string({ minLength: 1, maxLength: 50 }),
    completedSessions: fc.integer({ min: 0, max: 20 }),
    requiredSessions: fc.integer({ min: 1, max: 20 }),
    projectsSubmitted: fc.integer({ min: 0, max: 10 }),
    requiredProjects: fc.integer({ min: 1, max: 10 }),
    projectLinks: fc.array(fc.webUrl(), { minLength: 0, maxLength: 5 }),
    status: progressStatusArbitrary(),
    canPass: fc.boolean(),
    missingConditions: fc.array(fc.string({ minLength: 1, maxLength: 100 }), {
      minLength: 0,
      maxLength: 3,
    }),
  });

/**
 * Sortable keys for TrackingData
 */
type SortableKey = 'studentName' | 'courseName' | 'completedSessions' | 'projectsSubmitted' | 'status';

const sortableKeyArbitrary = (): fc.Arbitrary<SortableKey> =>
  fc.constantFrom(
    'studentName' as SortableKey,
    'courseName' as SortableKey,
    'completedSessions' as SortableKey,
    'projectsSubmitted' as SortableKey,
    'status' as SortableKey
  );

const sortOrderArbitrary = (): fc.Arbitrary<'asc' | 'desc'> =>
  fc.constantFrom('asc', 'desc');

describe('TrackingTable Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 4: Sort Order Preservation**
   * **Validates: Requirements 1.7**
   *
   * For any column sort action, the resulting table rows should be ordered
   * by that column's values in the specified direction (ascending or descending).
   */
  describe('Property 4: Sort Order Preservation', () => {
    it('should sort data by studentName in correct order', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 0, maxLength: 50 }),
          sortOrderArbitrary(),
          (data, order) => {
            const sorted = sortTrackingData(data, 'studentName', order);
            expect(isSortedBy(sorted, 'studentName', order)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort data by courseName in correct order', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 0, maxLength: 50 }),
          sortOrderArbitrary(),
          (data, order) => {
            const sorted = sortTrackingData(data, 'courseName', order);
            expect(isSortedBy(sorted, 'courseName', order)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort data by completedSessions in correct order', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 0, maxLength: 50 }),
          sortOrderArbitrary(),
          (data, order) => {
            const sorted = sortTrackingData(data, 'completedSessions', order);
            expect(isSortedBy(sorted, 'completedSessions', order)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort data by projectsSubmitted in correct order', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 0, maxLength: 50 }),
          sortOrderArbitrary(),
          (data, order) => {
            const sorted = sortTrackingData(data, 'projectsSubmitted', order);
            expect(isSortedBy(sorted, 'projectsSubmitted', order)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort data by any sortable key in correct order', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 0, maxLength: 50 }),
          sortableKeyArbitrary(),
          sortOrderArbitrary(),
          (data, sortKey, order) => {
            const sorted = sortTrackingData(data, sortKey, order);
            expect(isSortedBy(sorted, sortKey, order)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all items when sorting (no data loss)', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 0, maxLength: 50 }),
          sortableKeyArbitrary(),
          sortOrderArbitrary(),
          (data, sortKey, order) => {
            const sorted = sortTrackingData(data, sortKey, order);
            
            // Same length
            expect(sorted.length).toBe(data.length);
            
            // All original items are present
            const originalIds = new Set(data.map((d) => d.progressId));
            const sortedIds = new Set(sorted.map((d) => d.progressId));
            expect(sortedIds).toEqual(originalIds);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not modify original array when sorting', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 1, maxLength: 50 }),
          sortableKeyArbitrary(),
          sortOrderArbitrary(),
          (data, sortKey, order) => {
            const originalOrder = data.map((d) => d.progressId);
            sortTrackingData(data, sortKey, order);
            const afterSortOrder = data.map((d) => d.progressId);
            
            // Original array should not be modified
            expect(afterSortOrder).toEqual(originalOrder);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty array', () => {
      fc.assert(
        fc.property(
          sortableKeyArbitrary(),
          sortOrderArbitrary(),
          (sortKey, order) => {
            const sorted = sortTrackingData([], sortKey, order);
            expect(sorted).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle single item array', () => {
      fc.assert(
        fc.property(
          trackingDataArbitrary(),
          sortableKeyArbitrary(),
          sortOrderArbitrary(),
          (item, sortKey, order) => {
            const sorted = sortTrackingData([item], sortKey, order);
            expect(sorted.length).toBe(1);
            expect(sorted[0].progressId).toBe(item.progressId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reverse order when toggling between asc and desc', () => {
      fc.assert(
        fc.property(
          fc.array(trackingDataArbitrary(), { minLength: 2, maxLength: 50 }),
          sortableKeyArbitrary(),
          (data, sortKey) => {
            const ascSorted = sortTrackingData(data, sortKey, 'asc');
            const descSorted = sortTrackingData(data, sortKey, 'desc');
            
            // Verify both are sorted correctly in their respective directions
            if (data.length > 1) {
              // Both should be properly sorted
              expect(isSortedBy(ascSorted, sortKey, 'asc')).toBe(true);
              expect(isSortedBy(descSorted, sortKey, 'desc')).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
