'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkPassService, type BulkPassResult } from '@tdc/firebase';
import { trackingKeys } from './useTracking';

/**
 * Selection state for bulk pass
 */
export interface BulkPassSelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
}

/**
 * Processing state for bulk pass
 */
export interface BulkPassProcessingState {
  isProcessing: boolean;
  progress: number;
  total: number;
  result: BulkPassResult | null;
}

/**
 * Hook to manage bulk pass selection and processing
 * Requirements: 4.2, 4.3, 4.4, 4.5
 * 
 * This hook manages:
 * - Selection state for students
 * - Select all / deselect all functionality
 * - Bulk pass mutation with progress tracking
 * - Result reporting
 */
export function useBulkPass(adminId: string) {
  const queryClient = useQueryClient();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Processing state
  const [processingState, setProcessingState] = useState<BulkPassProcessingState>({
    isProcessing: false,
    progress: 0,
    total: 0,
    result: null,
  });

  // Available IDs for selection (set by parent component)
  const [availableIds, setAvailableIds] = useState<string[]>([]);

  /**
   * Bulk pass mutation
   */
  const bulkPassMutation = useMutation({
    mutationFn: async (progressIds: string[]) => {
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: 0,
        total: progressIds.length,
        result: null,
      }));

      const result = await bulkPassService.bulkPass({
        progressIds,
        adminId,
      });

      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        setProcessingState((prev) => ({
          ...prev,
          isProcessing: false,
          progress: result.data.total,
          result: result.data,
        }));
        // Clear selection after successful bulk pass
        setSelectedIds(new Set());
        // Invalidate tracking queries
        queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
        queryClient.invalidateQueries({ queryKey: trackingKeys.pendingApproval() });
      } else {
        setProcessingState((prev) => ({
          ...prev,
          isProcessing: false,
          result: null,
        }));
      }
    },
    onError: () => {
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        result: null,
      }));
    },
  });

  /**
   * Toggle selection for a single item
   * Requirements: 4.2
   */
  const toggleSelection = useCallback((progressId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(progressId)) {
        newSet.delete(progressId);
      } else {
        newSet.add(progressId);
      }
      return newSet;
    });
  }, []);

  /**
   * Select a single item
   */
  const select = useCallback((progressId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(progressId);
      return newSet;
    });
  }, []);

  /**
   * Deselect a single item
   */
  const deselect = useCallback((progressId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(progressId);
      return newSet;
    });
  }, []);

  /**
   * Select all available items
   * Requirements: 4.3
   */
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(availableIds));
  }, [availableIds]);

  /**
   * Deselect all items
   */
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Update available IDs (called by parent component)
   */
  const updateAvailableIds = useCallback((ids: string[]) => {
    setAvailableIds(ids);
    // Remove any selected IDs that are no longer available
    setSelectedIds((prev) => {
      const newSet = new Set<string>();
      prev.forEach((id) => {
        if (ids.includes(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, []);

  /**
   * Check if all available items are selected
   */
  const isAllSelected = useMemo(() => {
    if (availableIds.length === 0) return false;
    return availableIds.every((id) => selectedIds.has(id));
  }, [availableIds, selectedIds]);

  /**
   * Check if some (but not all) items are selected
   */
  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && !isAllSelected;
  }, [selectedIds.size, isAllSelected]);

  /**
   * Execute bulk pass for selected items
   * Requirements: 4.4, 4.5
   */
  const executeBulkPass = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const progressIds = Array.from(selectedIds);
    await bulkPassMutation.mutateAsync(progressIds);
  }, [selectedIds, bulkPassMutation]);

  /**
   * Clear the result (after user acknowledges)
   */
  const clearResult = useCallback(() => {
    setProcessingState((prev) => ({
      ...prev,
      result: null,
    }));
  }, []);

  /**
   * Check if a specific item is selected
   */
  const isSelected = useCallback(
    (progressId: string) => selectedIds.has(progressId),
    [selectedIds]
  );

  /**
   * Get selected count
   */
  const selectedCount = selectedIds.size;

  return {
    // Selection state
    selectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isSelected,

    // Selection actions
    toggleSelection,
    select,
    deselect,
    selectAll,
    deselectAll,
    updateAvailableIds,

    // Processing state
    isProcessing: processingState.isProcessing,
    progress: processingState.progress,
    total: processingState.total,
    result: processingState.result,

    // Processing actions
    executeBulkPass,
    clearResult,

    // Mutation state
    isError: bulkPassMutation.isError,
    error: bulkPassMutation.error,
  };
}

/**
 * Type for the return value of useBulkPass
 */
export type UseBulkPassReturn = ReturnType<typeof useBulkPass>;
