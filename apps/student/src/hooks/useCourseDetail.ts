'use client';

import { useQuery } from '@tanstack/react-query';
import { courseRepository, progressRepository } from '@tdc/firebase';
import type { CourseWithProgress } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const courseDetailKeys = {
  all: ['course-detail'] as const,
  detail: (courseId: string) => [...courseDetailKeys.all, courseId] as const,
};

/**
 * Hook to get course detail with progress and navigation
 * Requirements: 3.1, 3.5
 */
export function useCourseDetail(courseId: string) {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: courseDetailKeys.detail(courseId),
    queryFn: async (): Promise<CourseWithProgress | null> => {
      if (!student || !courseId) return null;

      // Fetch the course
      const courseResult = await courseRepository.findById(courseId);
      if (!courseResult.success) {
        throw courseResult.error;
      }

      const course = courseResult.data;

      // Fetch all courses in the same semester for navigation
      const semesterCoursesResult = await courseRepository.findBySemester(course.semesterId);
      const semesterCourses = semesterCoursesResult.success
        ? semesterCoursesResult.data.sort((a, b) => a.order - b.order)
        : [];

      // Find current course index
      const currentIndex = semesterCourses.findIndex((c) => c.id === courseId);
      const previousCourse = currentIndex > 0 ? semesterCourses[currentIndex - 1] : undefined;
      const nextCourse = currentIndex < semesterCourses.length - 1 ? semesterCourses[currentIndex + 1] : undefined;

      // Fetch student progress for this course
      const progressResult = await progressRepository.findByStudentAndCourse(student.id, courseId);
      const progress = progressResult.success ? progressResult.data : null;

      // Check if course is locked (previous course not completed)
      let isLocked = false;
      if (previousCourse) {
        const prevProgressResult = await progressRepository.findByStudentAndCourse(
          student.id,
          previousCourse.id
        );
        isLocked = !prevProgressResult.success || prevProgressResult.data?.status !== 'completed';
      }

      return {
        course,
        progress,
        isLocked,
        previousCourse,
        nextCourse,
      };
    },
    enabled: !!user && !!student && !!courseId,
  });
}
