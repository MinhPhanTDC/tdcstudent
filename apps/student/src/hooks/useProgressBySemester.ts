'use client';

import { useQuery } from '@tanstack/react-query';
import { courseRepository, progressRepository, semesterRepository } from '@tdc/firebase';
import type { Course, StudentProgress, Semester } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

export interface SemesterWithCourses {
  semester: Semester;
  status: 'completed' | 'in_progress' | 'locked';
  courses: Array<{
    course: Course;
    progress: StudentProgress | null;
    status: 'completed' | 'in_progress' | 'locked';
  }>;
}

// Query keys factory
export const progressBySemesterKeys = {
  all: ['progress-by-semester'] as const,
  list: () => [...progressBySemesterKeys.all, 'list'] as const,
};

/**
 * Hook to get all semesters with courses and progress
 * Used for the detailed progress page
 * Requirements: 4.1, 4.4, 4.5
 */
export function useProgressBySemester() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: progressBySemesterKeys.list(),
    queryFn: async (): Promise<SemesterWithCourses[]> => {
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

      // Build semesters with courses
      const result: SemesterWithCourses[] = [];
      let previousSemesterCompleted = true;

      for (const semester of semesters) {
        // Fetch courses for this semester
        const coursesResult = await courseRepository.findBySemester(semester.id);
        const courses = coursesResult.success 
          ? coursesResult.data.sort((a, b) => a.order - b.order) 
          : [];

        // Build courses with status
        const coursesWithStatus: SemesterWithCourses['courses'] = [];
        let previousCourseCompleted = previousSemesterCompleted;
        let semesterCompletedCount = 0;

        for (let i = 0; i < courses.length; i++) {
          const course = courses[i];
          const progress = progressMap.get(course.id) || null;

          // Determine course status
          let courseStatus: 'completed' | 'in_progress' | 'locked';
          
          if (progress?.status === 'completed') {
            courseStatus = 'completed';
            semesterCompletedCount++;
            previousCourseCompleted = true;
          } else if (!previousCourseCompleted) {
            courseStatus = 'locked';
          } else if (progress?.status === 'in_progress' || progress?.status === 'pending_approval') {
            courseStatus = 'in_progress';
            previousCourseCompleted = false;
          } else {
            // Not started but unlocked
            courseStatus = 'in_progress';
            previousCourseCompleted = false;
          }

          coursesWithStatus.push({
            course,
            progress,
            status: courseStatus,
          });
        }

        // Determine semester status
        let semesterStatus: 'completed' | 'in_progress' | 'locked';
        
        if (!previousSemesterCompleted) {
          semesterStatus = 'locked';
        } else if (semesterCompletedCount === courses.length && courses.length > 0) {
          semesterStatus = 'completed';
        } else {
          semesterStatus = 'in_progress';
        }

        result.push({
          semester,
          status: semesterStatus,
          courses: coursesWithStatus,
        });

        // Update for next semester
        previousSemesterCompleted = semesterStatus === 'completed';
      }

      return result;
    },
    enabled: !!user && !!student,
  });
}
