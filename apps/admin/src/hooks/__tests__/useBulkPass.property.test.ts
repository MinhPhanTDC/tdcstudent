import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Simulates the selection management logic from useBulkPass
 * This is a pure function that mirrors the hook's behavior for testing
 */
function createSelectionManager() {
  let selectedIds = new Set<string>();
  let availableIds: string[] = [];

  return {
    getSelectedIds: () => new Set(selectedIds),
    getAvailableIds: () => [...availableIds],
    getSelectedCount: () => selectedIds.size,

    isSelected: (id: string) => selectedIds.has(id),

    isAllSelected: () => {
      if (availableIds.length === 0) return false;
      return availableIds.every((id) => selectedIds.has(id));
    },

    isSomeSelected: () => {
      const allSelected =
        availableIds.length > 0 && availableIds.every((id) => selectedIds.has(id));
      return selectedIds.size > 0 && !allSelected;
    },

    toggleSelection: (id: string) => {
      if (selectedIds.has(id)) {
        selectedIds.delete(id);
      } else {
        selectedIds.add(id);
      }
    },

    select: (id: string) => {
      selectedIds.add(id);
    },

    deselect: (id: string) => {
      selectedIds.delete(id);
    },

    selectAll: () => {
      selectedIds = new Set(availableIds);
    },

    deselectAll: () => {
      selectedIds = new Set();
    },

    updateAvailableIds: (ids: string[]) => {
      availableIds = ids;
      // Remove any selected IDs that are no longer available
      const newSelected = new Set<string>();
      selectedIds.forEach((id) => {
        if (ids.includes(id)) {
          newSelected.add(id);
        }
      });
      selectedIds = newSelected;
    },
  };
}

/**
 * Arbitrary generator for unique IDs
 */
const uniqueIdsArbitrary = (minLength: number = 0, maxLength: number = 20): fc.Arbitrary<string[]> =>
  fc.array(fc.uuid(), { minLength, maxLength }).map((ids) => [...new Set(ids)]);

describe('useBulkPass Property Tests', () => {
  /**
   * **Feature: phase-4-tracking, Property 12: Select All Completeness**
   * **Validates: Requirements 4.3**
   *
   * For any "Select All" action in Quick Track, all visible student checkboxes
   * should be checked.
   */
  describe('Property 12: Select All Completeness', () => {
    it('should select all available IDs when selectAll is called', () => {
      fc.assert(
        fc.property(uniqueIdsArbitrary(1, 50), (availableIds) => {
          const manager = createSelectionManager();

          // Set available IDs
          manager.updateAvailableIds(availableIds);

          // Select all
          manager.selectAll();

          // All available IDs should be selected
          const selectedIds = manager.getSelectedIds();
          expect(selectedIds.size).toBe(availableIds.length);

          for (const id of availableIds) {
            expect(manager.isSelected(id)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should report isAllSelected=true after selectAll', () => {
      fc.assert(
        fc.property(uniqueIdsArbitrary(1, 50), (availableIds) => {
          const manager = createSelectionManager();

          // Set available IDs
          manager.updateAvailableIds(availableIds);

          // Select all
          manager.selectAll();

          // isAllSelected should be true
          expect(manager.isAllSelected()).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should have selectedCount equal to availableIds length after selectAll', () => {
      fc.assert(
        fc.property(uniqueIdsArbitrary(1, 50), (availableIds) => {
          const manager = createSelectionManager();

          // Set available IDs
          manager.updateAvailableIds(availableIds);

          // Select all
          manager.selectAll();

          // Selected count should match available count
          expect(manager.getSelectedCount()).toBe(availableIds.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should clear all selections when deselectAll is called', () => {
      fc.assert(
        fc.property(uniqueIdsArbitrary(1, 50), (availableIds) => {
          const manager = createSelectionManager();

          // Set available IDs and select all
          manager.updateAvailableIds(availableIds);
          manager.selectAll();

          // Deselect all
          manager.deselectAll();

          // No IDs should be selected
          expect(manager.getSelectedCount()).toBe(0);
          expect(manager.isAllSelected()).toBe(false);

          for (const id of availableIds) {
            expect(manager.isSelected(id)).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should toggle individual selection correctly', () => {
      fc.assert(
        fc.property(
          uniqueIdsArbitrary(2, 20),
          fc.integer({ min: 0, max: 19 }),
          (availableIds, indexToToggle) => {
            if (availableIds.length === 0) return;

            const manager = createSelectionManager();
            manager.updateAvailableIds(availableIds);

            const idToToggle = availableIds[indexToToggle % availableIds.length];

            // Initially not selected
            expect(manager.isSelected(idToToggle)).toBe(false);

            // Toggle on
            manager.toggleSelection(idToToggle);
            expect(manager.isSelected(idToToggle)).toBe(true);

            // Toggle off
            manager.toggleSelection(idToToggle);
            expect(manager.isSelected(idToToggle)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should report isSomeSelected correctly for partial selection', () => {
      fc.assert(
        fc.property(
          uniqueIdsArbitrary(2, 20),
          fc.integer({ min: 1, max: 19 }),
          (availableIds, selectCount) => {
            if (availableIds.length < 2) return;

            const manager = createSelectionManager();
            manager.updateAvailableIds(availableIds);

            // Select some but not all
            const toSelect = Math.min(selectCount, availableIds.length - 1);
            for (let i = 0; i < toSelect; i++) {
              manager.select(availableIds[i]);
            }

            // Should be some selected but not all
            expect(manager.isSomeSelected()).toBe(true);
            expect(manager.isAllSelected()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove unavailable IDs from selection when availableIds changes', () => {
      fc.assert(
        fc.property(
          uniqueIdsArbitrary(5, 20),
          fc.integer({ min: 1, max: 4 }),
          (initialIds, removeCount) => {
            const manager = createSelectionManager();

            // Set initial available IDs and select all
            manager.updateAvailableIds(initialIds);
            manager.selectAll();

            // Remove some IDs from available
            const newAvailableIds = initialIds.slice(removeCount);
            manager.updateAvailableIds(newAvailableIds);

            // Selected IDs should only contain available IDs
            const selectedIds = manager.getSelectedIds();
            selectedIds.forEach((id) => {
              expect(newAvailableIds.includes(id)).toBe(true);
            });

            // Removed IDs should not be selected
            const removedIds = initialIds.slice(0, removeCount);
            removedIds.forEach((id) => {
              expect(manager.isSelected(id)).toBe(false);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty available IDs correctly', () => {
      const manager = createSelectionManager();

      // Set empty available IDs
      manager.updateAvailableIds([]);

      // Select all should not throw
      manager.selectAll();

      // Should have no selections
      expect(manager.getSelectedCount()).toBe(0);
      expect(manager.isAllSelected()).toBe(false);
      expect(manager.isSomeSelected()).toBe(false);
    });

    it('should maintain selection state through multiple selectAll/deselectAll cycles', () => {
      fc.assert(
        fc.property(
          uniqueIdsArbitrary(1, 20),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (availableIds, selectCycle) => {
            const manager = createSelectionManager();
            manager.updateAvailableIds(availableIds);

            for (const shouldSelectAll of selectCycle) {
              if (shouldSelectAll) {
                manager.selectAll();
                expect(manager.isAllSelected()).toBe(true);
                expect(manager.getSelectedCount()).toBe(availableIds.length);
              } else {
                manager.deselectAll();
                expect(manager.isAllSelected()).toBe(false);
                expect(manager.getSelectedCount()).toBe(0);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify when all items are selected after individual selections', () => {
      fc.assert(
        fc.property(uniqueIdsArbitrary(1, 10), (availableIds) => {
          const manager = createSelectionManager();
          manager.updateAvailableIds(availableIds);

          // Select all items one by one
          for (const id of availableIds) {
            manager.select(id);
          }

          // Should report all selected
          expect(manager.isAllSelected()).toBe(true);
          expect(manager.getSelectedCount()).toBe(availableIds.length);
        }),
        { numRuns: 100 }
      );
    });
  });
});
