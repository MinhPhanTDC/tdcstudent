'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ProgressStatus } from '@tdc/schemas';

/**
 * Filter state for tracking table
 * Requirements: 1.3, 1.4, 1.5, 10.4
 */
export interface TrackingFilterState {
  semesterId: string | null;
  courseId: string | null;
  search: string;
  status: ProgressStatus | null;
}

/**
 * Pagination state for tracking table
 * Requirements: 1.6, 1.7
 */
export interface TrackingPaginationState {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Tab type for tracking page
 */
export type TrackingTab = 'tracking' | 'quickTrack';

/**
 * Default filter state
 */
const DEFAULT_FILTER_STATE: TrackingFilterState = {
  semesterId: null,
  courseId: null,
  search: '',
  status: null,
};

/**
 * Default pagination state
 */
const DEFAULT_PAGINATION_STATE: TrackingPaginationState = {
  page: 1,
  limit: 20,
  sortBy: 'studentName',
  sortOrder: 'asc',
};

/**
 * Hook to manage tracking filter state with tab preservation
 * Requirements: 1.3, 1.4, 1.5, 10.4
 * 
 * This hook manages:
 * - Semester filter selection
 * - Course filter selection (filtered by semester)
 * - Search term for student name/email
 * - Status filter
 * - Pagination and sorting
 * - Tab state with filter preservation across tab switches
 */
export function useTrackingFilters() {
  // Current active tab
  const [activeTab, setActiveTab] = useState<TrackingTab>('tracking');

  // Filter state - preserved across tab switches (Requirement 10.4)
  const [filters, setFilters] = useState<TrackingFilterState>(DEFAULT_FILTER_STATE);

  // Pagination state
  const [pagination, setPagination] = useState<TrackingPaginationState>(DEFAULT_PAGINATION_STATE);

  /**
   * Update semester filter
   * When semester changes, reset course filter since courses are semester-specific
   */
  const setSemesterId = useCallback((semesterId: string | null) => {
    setFilters((prev) => ({
      ...prev,
      semesterId,
      courseId: null, // Reset course when semester changes
    }));
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Update course filter
   */
  const setCourseId = useCallback((courseId: string | null) => {
    setFilters((prev) => ({
      ...prev,
      courseId,
    }));
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Update search term
   */
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
    }));
    // Reset to first page when search changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Update status filter
   */
  const setStatus = useCallback((status: ProgressStatus | null) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Update page number
   */
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Update page size
   */
  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  /**
   * Update sort configuration
   */
  const setSort = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
    setPagination((prev) => {
      // Toggle sort order if same column, otherwise default to asc
      const newSortOrder =
        sortOrder ?? (prev.sortBy === sortBy ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
      return { ...prev, sortBy, sortOrder: newSortOrder };
    });
  }, []);

  /**
   * Switch tab - filters are preserved (Requirement 10.4)
   */
  const switchTab = useCallback((tab: TrackingTab) => {
    setActiveTab(tab);
    // Reset pagination when switching tabs but keep filters
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    setPagination(DEFAULT_PAGINATION_STATE);
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.semesterId !== null ||
      filters.courseId !== null ||
      filters.search !== '' ||
      filters.status !== null
    );
  }, [filters]);

  /**
   * Get filter object for useTracking hook
   */
  const trackingFilters = useMemo(() => {
    return {
      semesterId: filters.semesterId ?? undefined,
      courseId: filters.courseId ?? undefined,
      search: filters.search || undefined,
      status: filters.status ?? undefined,
    };
  }, [filters]);

  /**
   * Get pagination object for useTracking hook
   */
  const trackingPagination = useMemo(() => {
    return {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    };
  }, [pagination]);

  return {
    // Tab state
    activeTab,
    switchTab,

    // Filter state
    filters,
    setSemesterId,
    setCourseId,
    setSearch,
    setStatus,
    resetFilters,
    hasActiveFilters,

    // Pagination state
    pagination,
    setPage,
    setLimit,
    setSort,

    // Formatted for hooks
    trackingFilters,
    trackingPagination,
  };
}

/**
 * Type for the return value of useTrackingFilters
 */
export type UseTrackingFiltersReturn = ReturnType<typeof useTrackingFilters>;
