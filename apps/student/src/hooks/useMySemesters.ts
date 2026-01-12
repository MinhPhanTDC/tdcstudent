'use client';

import { useQuery } from '@tanstack/react-query';
import { semesterRepository, progressRepository, courseRepository } from '@tdc/firebase';
import type { SemesterWithStatus } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const mySemesterKeys = {
  all: ['my-semesters'] as const,
  list: () => [...mySemesterKeys.all, 'list'] as const,
  detail: (id: string) => [...mySemesterKeys.all, 'detail', id] as const,
};

/**
 * Hook to get semesters with student progress status
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export function useMySemesters() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: mySemesterKeys.list(),
    queryFn: async (): Promise<SemesterWithStatus[]> => {
      if (!student) return [];

      // Fetch all active semesters
      const semestersResult = await semesterRepository.findActive();
      if (!semestersResult.success) {
        throw semestersResult.error;
      }

      // Sort by order
      const semesters = semestersResult.data.sort((a, b) => a.order - b.order);

      // Fetch student progress for all courses
      const progressResult = await progressRepository.findByStudentId(student.id);
      const progressMap = new Map(
        progressResult.success
          ? progressResult.data.map((p) => [p.courseId, p])
          : []
      );

      // Calculate status for each semester
      const semestersWithStatus: SemesterWithStatus[] = [];
      let previousSemesterCompleted = true;

      for (const semester of semesters) {
        // Get courses for this semester
        const coursesResult = await courseRepository.findBySemester(semester.id);
        const courses = coursesResult.success ? coursesResult.data : [];
        const courseCount = courses.length;

        // Count completed courses
        const completedCount = courses.filter((course) => {
          const progress = progressMap.get(course.id);
          return progress?.status === 'completed';
        }).length;

        // Determine semester status
        let status: 'completed' | 'in_progress' | 'locked';

        if (!previousSemesterCompleted) {
          status = 'locked';
        } else if (completedCount === courseCount && courseCount > 0) {
          status = 'completed';
        } else if (completedCount > 0 || courses.some((c) => progressMap.get(c.id)?.status === 'in_progress')) {
          status = 'in_progress';
        } else if (previousSemesterCompleted) {
          status = 'in_progress'; // First unlocked semester
          previousSemesterCompleted = false; // Lock subsequent semesters
        } else {
          status = 'locked';
        }

        // Update for next iteration
        if (status === 'completed') {
          previousSemesterCompleted = true;
        } else {
          previousSemesterCompleted = false;
        }

        semestersWithStatus.push({
          semester,
          status,
          courseCount,
          completedCount,
        });
      }

      return semestersWithStatus;
    },
    enabled: !!user && !!student,
  });
}
