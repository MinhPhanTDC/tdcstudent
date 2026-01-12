'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { semesterRepository } from '@tdc/firebase';
import type { Semester, CreateSemesterInput, UpdateSemesterInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const semesterKeys = {
  all: ['semesters'] as const,
  lists: () => [...semesterKeys.all, 'list'] as const,
  list: (filters?: SemesterFilters) => [...semesterKeys.lists(), filters] as const,
  details: () => [...semesterKeys.all, 'detail'] as const,
  detail: (id: string) => [...semesterKeys.details(), id] as const,
};

export interface SemesterFilters {
  isActive?: boolean;
}

/**
 * Hook to fetch all semesters sorted by order
 * Requirements: 1.1
 */
export function useSemesters(filters?: SemesterFilters) {
  return useQuery({
    queryKey: semesterKeys.list(filters),
    queryFn: async (): Promise<Semester[]> => {
      const result = await semesterRepository.findAllSorted();
      if (!result.success) {
        throw result.error;
      }

      let semesters = result.data;

      // Apply filters
      if (filters?.isActive !== undefined) {
        semesters = semesters.filter((s) => s.isActive === filters.isActive);
      }

      return semesters;
    },
  });
}

/**
 * Hook to fetch a single semester by ID
 */
export function useSemester(semesterId: string) {
  return useQuery({
    queryKey: semesterKeys.detail(semesterId),
    queryFn: async (): Promise<Semester> => {
      const result = await semesterRepository.findById(semesterId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!semesterId,
  });
}

/**
 * Hook to create a new semester
 * Requirements: 1.2
 */
export function useCreateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSemesterInput): Promise<Result<Semester>> => {
      return semesterRepository.createSemester(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.lists() });
    },
  });
}

/**
 * Hook to update a semester
 * Requirements: 1.4
 */
export function useUpdateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      semesterId,
      data,
    }: {
      semesterId: string;
      data: Partial<UpdateSemesterInput>;
    }): Promise<Result<Semester>> => {
      return semesterRepository.update(semesterId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: semesterKeys.detail(variables.semesterId) });
    },
  });
}

/**
 * Hook to delete a semester
 * Requirements: 1.5, 1.6
 */
export function useDeleteSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (semesterId: string): Promise<Result<void>> => {
      return semesterRepository.deleteSemester(semesterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.lists() });
    },
  });
}

/**
 * Hook to reorder semesters
 * Requirements: 1.7
 */
export function useReorderSemesters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (semesterIds: string[]): Promise<Result<void>> => {
      return semesterRepository.reorder(semesterIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.lists() });
    },
  });
}

/**
 * Hook to toggle semester active status
 * Requirements: 1.8
 */
export function useToggleSemesterActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (semesterId: string): Promise<Result<Semester>> => {
      return semesterRepository.toggleActive(semesterId);
    },
    onSuccess: (_, semesterId) => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: semesterKeys.detail(semesterId) });
    },
  });
}

/**
 * Hook to check if semester has associated courses
 */
export function useSemesterHasCourses(semesterId: string) {
  return useQuery({
    queryKey: [...semesterKeys.detail(semesterId), 'hasCourses'],
    queryFn: async (): Promise<boolean> => {
      const result = await semesterRepository.hasAssociatedCourses(semesterId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!semesterId,
  });
}

/**
 * Hook to get next available order number
 */
export function useNextSemesterOrder() {
  return useQuery({
    queryKey: [...semesterKeys.all, 'nextOrder'],
    queryFn: async (): Promise<number> => {
      const result = await semesterRepository.getNextOrder();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}
