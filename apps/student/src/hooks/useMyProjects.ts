'use client';

import { useQuery } from '@tanstack/react-query';
import { projectSubmissionRepository } from '@tdc/firebase';
import type { ProjectSubmission } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const myProjectKeys = {
  all: ['my-projects'] as const,
  byCourse: (courseId: string) => [...myProjectKeys.all, 'course', courseId] as const,
  byStudent: () => [...myProjectKeys.all, 'student'] as const,
};

/**
 * Hook to get project submissions for a course
 * Requirements: 4.1
 */
export function useMyProjects(courseId: string) {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myProjectKeys.byCourse(courseId),
    queryFn: async (): Promise<ProjectSubmission[]> => {
      if (!student || !courseId) return [];

      const result = await projectSubmissionRepository.findByStudentAndCourse(
        student.id,
        courseId
      );

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
    enabled: !!user && !!student && !!courseId,
  });
}

/**
 * Hook to get all project submissions for the current student
 */
export function useAllMyProjects() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myProjectKeys.byStudent(),
    queryFn: async (): Promise<ProjectSubmission[]> => {
      if (!student) return [];

      const result = await projectSubmissionRepository.findByStudentId(student.id);

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
    enabled: !!user && !!student,
  });
}
