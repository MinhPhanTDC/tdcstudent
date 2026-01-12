'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { majorCourseService } from '@tdc/firebase';
import type { MajorCourse, CreateMajorCourseInput, UpdateMajorCourseInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';
import { majorKeys } from './useMajors';

// Query keys factory
export const majorCourseKeys = {
  all: ['majorCourses'] as const,
  lists: () => [...majorCourseKeys.all, 'list'] as const,
  list: (majorId: string) => [...majorCourseKeys.lists(), majorId] as const,
  details: () => [...majorCourseKeys.all, 'detail'] as const,
  detail: (id: string) => [...majorCourseKeys.details(), id] as const,
  requiredCount: (majorId: string) => [...majorCourseKeys.all, 'requiredCount', majorId] as const,
};

/**
 * Hook to fetch all courses for a major, sorted by order
 * Requirements: 2.2, 2.6
 */
export function useMajorCourses(majorId: string) {
  return useQuery({
    queryKey: majorCourseKeys.list(majorId),
    queryFn: async (): Promise<MajorCourse[]> => {
      const result = await majorCourseService.getMajorCourses(majorId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!majorId,
  });
}

/**
 * Hook to get required courses count for a major
 */
export function useRequiredCoursesCount(majorId: string) {
  return useQuery({
    queryKey: majorCourseKeys.requiredCount(majorId),
    queryFn: async (): Promise<number> => {
      const result = await majorCourseService.getRequiredCoursesCount(majorId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!majorId,
  });
}

/**
 * Hook to add a course to a major
 * Requirements: 2.1
 */
export function useAddCourseToMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMajorCourseInput): Promise<Result<MajorCourse>> => {
      return majorCourseService.addCourseToMajor(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.list(variables.majorId) });
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.requiredCount(variables.majorId) });
      queryClient.invalidateQueries({ queryKey: majorKeys.courseCount(variables.majorId) });
    },
  });
}

/**
 * Hook to update a major course (order, isRequired)
 * Requirements: 2.4
 */
export function useUpdateMajorCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMajorCourseInput): Promise<Result<MajorCourse>> => {
      return majorCourseService.updateMajorCourse(input);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: majorCourseKeys.list(result.data.majorId) });
        queryClient.invalidateQueries({ queryKey: majorCourseKeys.requiredCount(result.data.majorId) });
      }
    },
  });
}

/**
 * Hook to remove a course from a major
 * Requirements: 2.5
 */
export function useRemoveCourseFromMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ majorCourseId }: { majorCourseId: string; majorId: string }): Promise<Result<void>> => {
      return majorCourseService.removeCourseFromMajor(majorCourseId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.list(variables.majorId) });
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.requiredCount(variables.majorId) });
      queryClient.invalidateQueries({ queryKey: majorKeys.courseCount(variables.majorId) });
    },
  });
}

/**
 * Hook to reorder courses within a major
 * Requirements: 2.3
 */
export function useReorderMajorCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      majorId, 
      majorCourseIds 
    }: { 
      majorId: string; 
      majorCourseIds: string[];
    }): Promise<Result<void>> => {
      return majorCourseService.reorderCourses(majorId, majorCourseIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.list(variables.majorId) });
    },
  });
}

/**
 * Hook to toggle required status of a course in a major
 * Requirements: 2.4
 */
export function useToggleMajorCourseRequired() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ majorCourseId }: { majorCourseId: string; majorId: string }): Promise<Result<MajorCourse>> => {
      return majorCourseService.toggleRequired(majorCourseId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.list(variables.majorId) });
      queryClient.invalidateQueries({ queryKey: majorCourseKeys.requiredCount(variables.majorId) });
    },
  });
}
