'use client';

import { useQuery } from '@tanstack/react-query';
import { courseRepository, progressRepository } from '@tdc/firebase';
import type { CourseWithProgress } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const semesterCourseKeys = {
  all: ['semester-courses'] as const,
  list: (semesterId: string) => [...semesterCourseKeys.all, 'list', semesterId] as const,
};

/**
 * Hook to get courses for a semester with progress
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export function useSemesterCourses(semesterId: string) {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: semesterCourseKeys.list(semesterId),
    queryFn: async (): Promise<CourseWithProgress[]> => {
      if (!student || !semesterId) return [];

      // Fetch courses for this semester
      const coursesResult = await courseRepository.findBySemester(semesterId);
      if (!coursesResult.success) {
        throw coursesResult.error;
      }

      // Sort by order
      const courses = coursesResult.data.sort((a, b) => a.order - b.order);

      // Fetch student progress
      const progressResult = await progressRepository.findByStudentId(student.id);
      const progressMap = new Map(
        progressResult.success
          ? progressResult.data.map((p) => [p.courseId, p])
          : []
      );

      // Build courses with progress
      const coursesWithProgress: CourseWithProgress[] = [];
      let previousCourseCompleted = true;

      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const progress = progressMap.get(course.id) || null;
        const previousCourse = i > 0 ? courses[i - 1] : undefined;
        const nextCourse = i < courses.length - 1 ? courses[i + 1] : undefined;

        // Determine if course is locked
        // First course is never locked, subsequent courses require previous completion
        const isLocked = i > 0 && !previousCourseCompleted;

        coursesWithProgress.push({
          course,
          progress,
          isLocked,
          previousCourse,
          nextCourse,
        });

        // Update for next iteration
        previousCourseCompleted = progress?.status === 'completed';
      }

      return coursesWithProgress;
    },
    enabled: !!user && !!student && !!semesterId,
  });
}
