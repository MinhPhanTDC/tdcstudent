'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { majorService } from '@tdc/firebase';
import type { Major, CreateMajorInput, UpdateMajorInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const majorKeys = {
  all: ['majors'] as const,
  lists: () => [...majorKeys.all, 'list'] as const,
  list: (filters?: MajorFilters) => [...majorKeys.lists(), filters] as const,
  active: () => [...majorKeys.all, 'active'] as const,
  details: () => [...majorKeys.all, 'detail'] as const,
  detail: (id: string) => [...majorKeys.details(), id] as const,
  courseCount: (id: string) => [...majorKeys.all, 'courseCount', id] as const,
};

export interface MajorFilters {
  search?: string;
  isActive?: boolean;
}

export interface MajorWithCourseCount extends Major {
  courseCount: number;
}

/**
 * Hook to fetch all majors sorted by active status and name
 * Requirements: 1.2, 1.6
 */
export function useMajors(filters?: MajorFilters) {
  return useQuery({
    queryKey: majorKeys.list(filters),
    queryFn: async (): Promise<Major[]> => {
      const result = await majorService.getMajors();
      if (!result.success) {
        throw result.error;
      }

      let majors = result.data;

      // Apply filters
      if (filters?.isActive !== undefined) {
        majors = majors.filter((m) => m.isActive === filters.isActive);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        majors = majors.filter(
          (m) =>
            m.name.toLowerCase().includes(searchLower) ||
            (m.description && m.description.toLowerCase().includes(searchLower))
        );
      }

      return majors;
    },
  });
}

/**
 * Hook to fetch only active majors
 * Requirements: 1.2, 1.6
 */
export function useActiveMajors() {
  return useQuery({
    queryKey: majorKeys.active(),
    queryFn: async (): Promise<Major[]> => {
      const result = await majorService.getActiveMajors();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}

/**
 * Hook to fetch a single major by ID
 * Requirements: 1.2
 */
export function useMajor(majorId: string) {
  return useQuery({
    queryKey: majorKeys.detail(majorId),
    queryFn: async (): Promise<Major> => {
      const result = await majorService.getMajor(majorId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!majorId,
  });
}

/**
 * Hook to get course count for a major
 */
export function useMajorCourseCount(majorId: string) {
  return useQuery({
    queryKey: majorKeys.courseCount(majorId),
    queryFn: async (): Promise<number> => {
      const result = await majorService.getCourseCount(majorId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!majorId,
  });
}

/**
 * Hook to create a new major
 * Requirements: 1.1
 */
export function useCreateMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMajorInput): Promise<Result<Major>> => {
      return majorService.createMajor(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: majorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: majorKeys.active() });
    },
  });
}

/**
 * Hook to update a major
 * Requirements: 1.3
 */
export function useUpdateMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMajorInput): Promise<Result<Major>> => {
      return majorService.updateMajor(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: majorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: majorKeys.active() });
      queryClient.invalidateQueries({ queryKey: majorKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook to soft delete a major (sets isActive to false)
 * Requirements: 1.4
 */
export function useDeleteMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (majorId: string): Promise<Result<Major>> => {
      return majorService.deleteMajor(majorId);
    },
    onSuccess: (_, majorId) => {
      queryClient.invalidateQueries({ queryKey: majorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: majorKeys.active() });
      queryClient.invalidateQueries({ queryKey: majorKeys.detail(majorId) });
    },
  });
}

/**
 * Hook to restore a soft-deleted major
 */
export function useRestoreMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (majorId: string): Promise<Result<Major>> => {
      return majorService.restoreMajor(majorId);
    },
    onSuccess: (_, majorId) => {
      queryClient.invalidateQueries({ queryKey: majorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: majorKeys.active() });
      queryClient.invalidateQueries({ queryKey: majorKeys.detail(majorId) });
    },
  });
}
