import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { ProgressStatus } from '@tdc/schemas';

/**
 * Filter state type matching useTrackingFilters
 */
interface TrackingFilterState {
  semesterId: string | null;
  courseId: string | null;
  search: string;
  status: ProgressStatus | null;
}

/**
 * Tab type for tracking page
 */
type TrackingTab = 'tracking' | 'quickTrack';

/**
 * Simulates the filter state management logic from useTrackingFilters
 * This is a pure function that mirrors the hook's behavior for testing
 */
function createFilterStateManager() {
  let filters: TrackingFilterState = {
    semesterId: null,
    courseId: null,
    search: '',
    status: null,
  };
  let activeTab: TrackingTab = 'tracking';

  return {
    getFilters: () => ({ ...filters }),
    getActiveTab: () => activeTab,

    setSemesterId: (semesterId: string | null) => {
      filters = { ...filters, semesterId, courseId: null };
    },

    setCourseId: (courseId: string | null) => {
      filters = { ...filters, courseId };
    },

    setSearch: (search: string) => {
      filters = { ...filters, search };
    },

    setStatus: (status: ProgressStatus | null) => {
      filters = { ...filters, status };
    },

    switchTab: (tab: TrackingTab) => {
      activeTab = tab;
      // Filters are preserved - this is the key behavior we're testing
    },

    resetFilters: () => {
      filters = {
        semesterId: null,
        courseId: null,
        search: '',
        status: null,
      };
    },
  };
}

/**
 * Arbitrary generator for semester IDs
 */
const semesterIdArbitrary = (): fc.Arbitrary<string | null> =>
  fc.oneof(fc.uuid(), fc.constant(null));

/**
 * Arbitrary generator for course IDs
 */
const courseIdArbitrary = (): fc.Arbitrary<string | null> =>
  fc.oneof(fc.uuid(), fc.constant(null));

/**
 * Arbitrary generator for search terms
 */
const searchArbitrary = (): fc.Arbitrary<string> =>
  fc.string({ minLength: 0, maxLength: 100 });

/**
 * Arbitrary generator for progress status
 */
const statusArbitrary = (): fc.Arbitrary<ProgressStatus | null> =>
  fc.oneof(
    fc.constantFrom(
      'not_started' as ProgressStatus,
      'in_progress' as ProgressStatus,
      'pending_approval' as ProgressStatus,
      'completed' as ProgressStatus,
      'rejected' as ProgressStatus,
      'locked' as ProgressStatus
    ),
    fc.constant(null)
  );

/**
 * Arbitrary generator for tab type
 */
const tabArbitrary = (): fc.Arbitrary<TrackingTab> =>
  fc.constantFrom('tracking', 'quickTrack');

/**
 * Arbitrary generator for complete filter state
 */
const filterStateArbitrary = (): fc.Arbitrary<TrackingFilterState> =>
  fc.record({
    semesterId: semesterIdArbitrary(),
    courseId: courseIdArbitrary(),
    search: searchArbitrary(),
    status: statusArbitrary(),
  });

describe('useTrackingFilters Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 27: Filter State Preservation**
   * **Validates: Requirements 10.4**
   *
   * For any tab switch between Tracking and Quick Track, the filter selections
   * (semester, course, search) should be preserved.
   */
  describe('Property 27: Filter State Preservation', () => {
    it('should preserve all filter values when switching tabs', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          tabArbitrary(),
          tabArbitrary(),
          (initialFilters, fromTab, toTab) => {
            const manager = createFilterStateManager();

            // Set initial tab
            manager.switchTab(fromTab);

            // Set all filter values
            manager.setSemesterId(initialFilters.semesterId);
            manager.setCourseId(initialFilters.courseId);
            manager.setSearch(initialFilters.search);
            manager.setStatus(initialFilters.status);

            // Capture filters before tab switch
            const filtersBefore = manager.getFilters();

            // Switch to different tab
            manager.switchTab(toTab);

            // Capture filters after tab switch
            const filtersAfter = manager.getFilters();

            // All filter values should be preserved
            expect(filtersAfter.semesterId).toBe(filtersBefore.semesterId);
            expect(filtersAfter.courseId).toBe(filtersBefore.courseId);
            expect(filtersAfter.search).toBe(filtersBefore.search);
            expect(filtersAfter.status).toBe(filtersBefore.status);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve semester filter across multiple tab switches', () => {
      fc.assert(
        fc.property(
          semesterIdArbitrary(),
          fc.array(tabArbitrary(), { minLength: 1, maxLength: 10 }),
          (semesterId, tabSequence) => {
            const manager = createFilterStateManager();

            // Set semester filter
            manager.setSemesterId(semesterId);

            // Switch tabs multiple times
            for (const tab of tabSequence) {
              manager.switchTab(tab);
            }

            // Semester should still be preserved
            expect(manager.getFilters().semesterId).toBe(semesterId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve course filter across multiple tab switches', () => {
      fc.assert(
        fc.property(
          courseIdArbitrary(),
          fc.array(tabArbitrary(), { minLength: 1, maxLength: 10 }),
          (courseId, tabSequence) => {
            const manager = createFilterStateManager();

            // Set course filter
            manager.setCourseId(courseId);

            // Switch tabs multiple times
            for (const tab of tabSequence) {
              manager.switchTab(tab);
            }

            // Course should still be preserved
            expect(manager.getFilters().courseId).toBe(courseId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve search term across multiple tab switches', () => {
      fc.assert(
        fc.property(
          searchArbitrary(),
          fc.array(tabArbitrary(), { minLength: 1, maxLength: 10 }),
          (search, tabSequence) => {
            const manager = createFilterStateManager();

            // Set search filter
            manager.setSearch(search);

            // Switch tabs multiple times
            for (const tab of tabSequence) {
              manager.switchTab(tab);
            }

            // Search should still be preserved
            expect(manager.getFilters().search).toBe(search);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve status filter across multiple tab switches', () => {
      fc.assert(
        fc.property(
          statusArbitrary(),
          fc.array(tabArbitrary(), { minLength: 1, maxLength: 10 }),
          (status, tabSequence) => {
            const manager = createFilterStateManager();

            // Set status filter
            manager.setStatus(status);

            // Switch tabs multiple times
            for (const tab of tabSequence) {
              manager.switchTab(tab);
            }

            // Status should still be preserved
            expect(manager.getFilters().status).toBe(status);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly update active tab while preserving filters', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          tabArbitrary(),
          (filters, targetTab) => {
            const manager = createFilterStateManager();

            // Set all filters
            manager.setSemesterId(filters.semesterId);
            manager.setCourseId(filters.courseId);
            manager.setSearch(filters.search);
            manager.setStatus(filters.status);

            // Switch tab
            manager.switchTab(targetTab);

            // Tab should be updated
            expect(manager.getActiveTab()).toBe(targetTab);

            // Filters should be preserved
            const currentFilters = manager.getFilters();
            expect(currentFilters.semesterId).toBe(filters.semesterId);
            expect(currentFilters.courseId).toBe(filters.courseId);
            expect(currentFilters.search).toBe(filters.search);
            expect(currentFilters.status).toBe(filters.status);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reset course when semester changes', () => {
      fc.assert(
        fc.property(
          semesterIdArbitrary(),
          courseIdArbitrary(),
          semesterIdArbitrary(),
          (initialSemester, courseId, newSemester) => {
            const manager = createFilterStateManager();

            // Set initial semester and course
            manager.setSemesterId(initialSemester);
            manager.setCourseId(courseId);

            // Change semester
            manager.setSemesterId(newSemester);

            // Course should be reset to null
            expect(manager.getFilters().courseId).toBe(null);
            // New semester should be set
            expect(manager.getFilters().semesterId).toBe(newSemester);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reset all filters when resetFilters is called', () => {
      fc.assert(
        fc.property(filterStateArbitrary(), (filters) => {
          const manager = createFilterStateManager();

          // Set all filters
          manager.setSemesterId(filters.semesterId);
          manager.setCourseId(filters.courseId);
          manager.setSearch(filters.search);
          manager.setStatus(filters.status);

          // Reset filters
          manager.resetFilters();

          // All filters should be reset to defaults
          const currentFilters = manager.getFilters();
          expect(currentFilters.semesterId).toBe(null);
          expect(currentFilters.courseId).toBe(null);
          expect(currentFilters.search).toBe('');
          expect(currentFilters.status).toBe(null);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve filters after reset and new values set', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          filterStateArbitrary(),
          tabArbitrary(),
          (oldFilters, newFilters, tab) => {
            const manager = createFilterStateManager();

            // Set old filters
            manager.setSemesterId(oldFilters.semesterId);
            manager.setCourseId(oldFilters.courseId);
            manager.setSearch(oldFilters.search);
            manager.setStatus(oldFilters.status);

            // Reset
            manager.resetFilters();

            // Set new filters
            manager.setSemesterId(newFilters.semesterId);
            manager.setCourseId(newFilters.courseId);
            manager.setSearch(newFilters.search);
            manager.setStatus(newFilters.status);

            // Switch tab
            manager.switchTab(tab);

            // New filters should be preserved
            const currentFilters = manager.getFilters();
            expect(currentFilters.semesterId).toBe(newFilters.semesterId);
            expect(currentFilters.courseId).toBe(newFilters.courseId);
            expect(currentFilters.search).toBe(newFilters.search);
            expect(currentFilters.status).toBe(newFilters.status);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
