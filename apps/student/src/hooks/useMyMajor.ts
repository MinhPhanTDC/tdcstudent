'use client';

import { useQuery } from '@tanstack/react-query';
import { majorService, majorCourseService, progressRepository, courseRepository } from '@tdc/firebase';
import type { Major, MajorCourse, Course, StudentProgress, ProgressStatus } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const myMajorKeys = {
  all: ['my-major'] as const,
  major: () => [...myMajorKeys.all, 'major'] as const,
  courses: () => [...myMajorKeys.all, 'courses'] as const,
  progress: () => [...myMajorKeys.all, 'progress'] as const,
};

/**
 * Course status for display in major course list
 * Requirements: 5.2
 */
export type MajorCourseStatus = 'locked' | 'in_progress' | 'completed';

/**
 * Major course with full details and status
 * Requirements: 5.2
 */
export interface MajorCourseWithStatus {
  majorCourse: MajorCourse;
  course: Course | null;
  progress: StudentProgress | null;
  status: MajorCourseStatus;
}

/**
 * Major progress data
 * Requirements: 5.1, 5.3
 */
export interface MyMajorData {
  major: Major;
  courses: MajorCourseWithStatus[];
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  progressPercentage: number;
}

/**
 * Derive course status from progress data
 * Requirements: 5.2 - Course status derivation
 * 
 * Status rules:
 * - 'completed': progress status is 'completed'
 * - 'in_progress': progress exists and status is 'in_progress', 'pending_approval', or 'rejected'
 * - 'locked': no progress or status is 'not_started' or 'locked', or prerequisites not met
 */
export function deriveCourseStatus(
  progress: StudentProgress | null,
  previousCourseCompleted: boolean
): MajorCourseStatus {
  // If previous course is not completed, this course is locked
  if (!previousCourseCompleted) {
    return 'locked';
  }

  // No progress record means not started (but unlocked if previous is done)
  if (!progress) {
    return 'locked';
  }

  // Check progress status
  const status = progress.status as ProgressStatus;
  
  if (status === 'completed') {
    return 'completed';
  }
  
  if (status === 'in_progress' || status === 'pending_approval' || status === 'rejected') {
    return 'in_progress';
  }
  
  // 'not_started' or 'locked' status
  return 'locked';
}

/**
 * Calculate major progress percentage
 * Requirements: 5.3 - Progress calculation
 * 
 * @param completedCourses - Number of completed courses
 * @param totalCourses - Total number of courses in major
 * @returns Progress percentage (0-100), rounded to nearest integer
 */
export function calculateMajorProgress(completedCourses: number, totalCourses: number): number {
  if (totalCourses === 0) {
    return 0;
  }
  return Math.round((completedCourses / totalCourses) * 100);
}

/**
 * Hook to get student's selected major with details
 * Requirements: 5.1 - Display major name and description
 */
export function useMyMajor() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myMajorKeys.major(),
    queryFn: async (): Promise<Major | null> => {
      if (!student?.selectedMajorId) {
        return null;
      }

      const result = await majorService.getMajor(student.selectedMajorId);
      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
    enabled: !!user && !!student?.selectedMajorId,
  });
}

/**
 * Hook to get major courses with status and progress
 * Requirements: 5.2 - Display courses with completion status
 */
export function useMyMajorCourses() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myMajorKeys.courses(),
    queryFn: async (): Promise<MajorCourseWithStatus[]> => {
      if (!student?.selectedMajorId) {
        return [];
      }

      // Get major courses
      const majorCoursesResult = await majorCourseService.getMajorCourses(student.selectedMajorId);
      if (!majorCoursesResult.success) {
        throw majorCoursesResult.error;
      }

      // Get student progress for all courses
      const progressResult = await progressRepository.findByStudentId(student.id);
      const progressMap = new Map(
        progressResult.success
          ? progressResult.data.map((p) => [p.courseId, p])
          : []
      );

      // Get course details and build status
      const coursesWithStatus: MajorCourseWithStatus[] = [];
      let previousCompleted = true; // First course is always unlocked

      for (const majorCourse of majorCoursesResult.data) {
        // Get course details
        const courseResult = await courseRepository.findById(majorCourse.courseId);
        const course = courseResult.success ? courseResult.data : null;

        // Get progress for this course
        const progress = progressMap.get(majorCourse.courseId) || null;

        // Derive status
        const status = deriveCourseStatus(progress, previousCompleted);

        coursesWithStatus.push({
          majorCourse,
          course,
          progress,
          status,
        });

        // Update previousCompleted for next iteration
        previousCompleted = status === 'completed';
      }

      return coursesWithStatus;
    },
    enabled: !!user && !!student?.selectedMajorId,
  });
}

/**
 * Hook to get complete major data with progress
 * Requirements: 5.1, 5.2, 5.3
 */
export function useMyMajorProgress() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myMajorKeys.progress(),
    queryFn: async (): Promise<MyMajorData | null> => {
      if (!student?.selectedMajorId) {
        return null;
      }

      // Get major details
      const majorResult = await majorService.getMajor(student.selectedMajorId);
      if (!majorResult.success) {
        throw majorResult.error;
      }

      // Get major courses
      const majorCoursesResult = await majorCourseService.getMajorCourses(student.selectedMajorId);
      if (!majorCoursesResult.success) {
        throw majorCoursesResult.error;
      }

      // Get student progress
      const progressResult = await progressRepository.findByStudentId(student.id);
      const progressMap = new Map(
        progressResult.success
          ? progressResult.data.map((p) => [p.courseId, p])
          : []
      );

      // Build courses with status
      const courses: MajorCourseWithStatus[] = [];
      let previousCompleted = true;
      let completedCourses = 0;
      let inProgressCourses = 0;

      for (const majorCourse of majorCoursesResult.data) {
        const courseResult = await courseRepository.findById(majorCourse.courseId);
        const course = courseResult.success ? courseResult.data : null;
        const progress = progressMap.get(majorCourse.courseId) || null;
        const status = deriveCourseStatus(progress, previousCompleted);

        courses.push({
          majorCourse,
          course,
          progress,
          status,
        });

        if (status === 'completed') {
          completedCourses++;
        } else if (status === 'in_progress') {
          inProgressCourses++;
        }

        previousCompleted = status === 'completed';
      }

      const totalCourses = courses.length;
      const progressPercentage = calculateMajorProgress(completedCourses, totalCourses);

      return {
        major: majorResult.data,
        courses,
        totalCourses,
        completedCourses,
        inProgressCourses,
        progressPercentage,
      };
    },
    enabled: !!user && !!student?.selectedMajorId,
  });
}
