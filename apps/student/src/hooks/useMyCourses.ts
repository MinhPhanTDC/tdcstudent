'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentRepository, courseRepository } from '@tdc/firebase';
import type { Course, Student } from '@tdc/schemas';
import type { Result } from '@tdc/types';
import { useAuth } from '@/contexts/AuthContext';

// Query keys factory
export const myCourseKeys = {
  all: ['my-courses'] as const,
  student: () => [...myCourseKeys.all, 'student'] as const,
  courses: () => [...myCourseKeys.all, 'courses'] as const,
  course: (id: string) => [...myCourseKeys.courses(), id] as const,
};

export interface CourseWithProgress extends Course {
  progress: number;
}

/**
 * Hook to get current student data
 */
export function useMyStudent() {
  const { user } = useAuth();

  return useQuery({
    queryKey: myCourseKeys.student(),
    queryFn: async (): Promise<Student | null> => {
      if (!user) return null;

      const result = await studentRepository.findByUserId(user.id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!user,
  });
}

/**
 * Hook to get enrolled courses with progress
 */
export function useMyCourses() {
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myCourseKeys.courses(),
    queryFn: async (): Promise<CourseWithProgress[]> => {
      if (!student || student.enrolledCourses.length === 0) {
        return [];
      }

      const coursesResult = await courseRepository.findByIds(student.enrolledCourses);
      if (!coursesResult.success) {
        throw coursesResult.error;
      }

      return coursesResult.data.map((course) => ({
        ...course,
        progress: student.progress[course.id] || 0,
      }));
    },
    enabled: !!student,
  });
}

/**
 * Hook to get a single course with progress
 */
export function useMyCourse(courseId: string) {
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myCourseKeys.course(courseId),
    queryFn: async (): Promise<CourseWithProgress | null> => {
      if (!student) return null;

      // Check if enrolled
      if (!student.enrolledCourses.includes(courseId)) {
        return null;
      }

      const result = await courseRepository.findById(courseId);
      if (!result.success) {
        throw result.error;
      }

      return {
        ...result.data,
        progress: student.progress[courseId] || 0,
      };
    },
    enabled: !!student && !!courseId,
  });
}

/**
 * Hook to update lesson progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { data: student } = useMyStudent();

  return useMutation({
    mutationFn: async ({
      courseId,
      progress,
    }: {
      courseId: string;
      progress: number;
    }): Promise<Result<void>> => {
      if (!student) {
        return { success: false, error: new Error('Student not found') as never };
      }

      return studentRepository.updateProgress(student.id, courseId, progress);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: myCourseKeys.student() });
      queryClient.invalidateQueries({ queryKey: myCourseKeys.course(variables.courseId) });
    },
  });
}
