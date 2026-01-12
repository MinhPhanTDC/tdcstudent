'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseRepository } from '@tdc/firebase';
import type { Course, CreateCourseInput, Lesson } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters?: CourseFilters) => [...courseKeys.lists(), filters] as const,
  bySemester: (semesterId: string) => [...courseKeys.all, 'bySemester', semesterId] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

export interface CourseFilters {
  search?: string;
  isActive?: boolean;
  semesterId?: string;
}

/**
 * Hook to fetch all courses
 */
export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: async (): Promise<Course[]> => {
      const result = await courseRepository.findAllSorted();
      if (!result.success) {
        throw result.error;
      }

      let courses = result.data;

      // Apply filters
      if (filters?.semesterId) {
        courses = courses.filter((c) => c.semesterId === filters.semesterId);
      }

      if (filters?.isActive !== undefined) {
        courses = courses.filter((c) => c.isActive === filters.isActive);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        courses = courses.filter(
          (c) =>
            c.title.toLowerCase().includes(searchLower) ||
            (c.description && c.description.toLowerCase().includes(searchLower))
        );
      }

      return courses;
    },
  });
}

/**
 * Hook to fetch courses by semester ID sorted by order
 * Requirements: 2.1, 2.7
 */
export function useCoursesBySemester(semesterId: string) {
  return useQuery({
    queryKey: courseKeys.bySemester(semesterId),
    queryFn: async (): Promise<Course[]> => {
      const result = await courseRepository.findBySemester(semesterId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!semesterId,
  });
}

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async (): Promise<Course> => {
      const result = await courseRepository.findById(courseId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!courseId,
  });
}

/**
 * Hook to create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCourseInput): Promise<Result<Course>> => {
      // Add default lessons array since CreateCourseInput omits it
      return courseRepository.create({
        ...input,
        lessons: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to update a course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: string;
      data: Partial<Course>;
    }): Promise<Result<Course>> => {
      return courseRepository.update(courseId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
}

/**
 * Hook to add a lesson to a course
 */
export function useAddLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      lesson,
    }: {
      courseId: string;
      lesson: Lesson;
    }): Promise<Result<void>> => {
      return courseRepository.addLesson(courseId, lesson);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
}

/**
 * Hook to publish/unpublish a course
 */
export function useTogglePublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      isPublished,
    }: {
      courseId: string;
      isPublished: boolean;
    }): Promise<Result<void>> => {
      return courseRepository.setPublished(courseId, isPublished);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string): Promise<Result<void>> => {
      return courseRepository.delete(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to reorder courses within a semester
 * Requirements: 2.8
 */
export function useReorderCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      semesterId,
      courseIds,
    }: {
      semesterId: string;
      courseIds: string[];
    }): Promise<Result<void>> => {
      return courseRepository.reorderInSemester(semesterId, courseIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.bySemester(variables.semesterId) });
    },
  });
}

/**
 * Hook to move a course to a different semester
 * Requirements: 2.9
 */
export function useMoveCourseToSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      newSemesterId,
    }: {
      courseId: string;
      newSemesterId: string;
    }): Promise<Result<Course>> => {
      return courseRepository.moveToSemester(courseId, newSemesterId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      // Invalidate both old and new semester course lists
      queryClient.invalidateQueries({ queryKey: [...courseKeys.all, 'bySemester'] });
    },
  });
}

/**
 * Hook to toggle course active status
 */
export function useToggleCourseActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string): Promise<Result<Course>> => {
      return courseRepository.toggleActive(courseId);
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}
