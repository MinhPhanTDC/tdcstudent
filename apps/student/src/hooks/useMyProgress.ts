'use client';

import { useQuery } from '@tanstack/react-query';
import { courseRepository, progressRepository, semesterRepository } from '@tdc/firebase';
import type { OverallProgress, Course, CourseWithProgress } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const myProgressKeys = {
  all: ['my-progress'] as const,
  overall: () => [...myProgressKeys.all, 'overall'] as const,
};

/**
 * Hook to get overall progress statistics
 * Requirements: 5.2, 5.3, 5.4, 5.5
 */
export function useMyProgress() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: myProgressKeys.overall(),
    queryFn: async (): Promise<OverallProgress> => {
      if (!student) {
        return {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalProjects: 0,
          submittedProjects: 0,
          completionPercentage: 0,
          nextCourses: [],
        };
      }

      // Fetch all active semesters
      const semestersResult = await semesterRepository.findActive();
      const semesters = semestersResult.success
        ? semestersResult.data.sort((a, b) => a.order - b.order)
        : [];

      // Fetch all courses
      let allCourses: Course[] = [];
      for (const semester of semesters) {
        const coursesResult = await courseRepository.findBySemester(semester.id);
        if (coursesResult.success) {
          allCourses = [...allCourses, ...coursesResult.data];
        }
      }

      // Sort all courses by semester order then course order
      allCourses.sort((a, b) => {
        const semA = semesters.find((s) => s.id === a.semesterId);
        const semB = semesters.find((s) => s.id === b.semesterId);
        if (semA && semB && semA.order !== semB.order) {
          return semA.order - semB.order;
        }
        return a.order - b.order;
      });

      // Fetch student progress
      const progressResult = await progressRepository.findByStudentId(student.id);
      const progressMap = new Map(
        progressResult.success
          ? progressResult.data.map((p) => [p.courseId, p])
          : []
      );

      // Calculate statistics
      const totalCourses = allCourses.length;
      let completedCourses = 0;
      let inProgressCourses = 0;
      let totalProjects = 0;
      let submittedProjects = 0;
      let currentCourse: CourseWithProgress | undefined;
      const nextCourses: Course[] = [];

      let foundCurrent = false;

      for (let i = 0; i < allCourses.length; i++) {
        const course = allCourses[i];
        const progress = progressMap.get(course.id);

        totalProjects += course.requiredProjects;
        submittedProjects += progress?.projectsSubmitted || 0;

        if (progress?.status === 'completed') {
          completedCourses++;
        } else if (progress?.status === 'in_progress') {
          inProgressCourses++;
          if (!foundCurrent) {
            currentCourse = {
              course,
              progress,
              isLocked: false,
              previousCourse: i > 0 ? allCourses[i - 1] : undefined,
              nextCourse: i < allCourses.length - 1 ? allCourses[i + 1] : undefined,
            };
            foundCurrent = true;
          }
        } else if (!foundCurrent && !progress) {
          // First course without progress is the current one
          const previousCourse = i > 0 ? allCourses[i - 1] : undefined;
          const prevProgress = previousCourse ? progressMap.get(previousCourse.id) : undefined;
          const isLocked = previousCourse && prevProgress?.status !== 'completed';

          if (!isLocked) {
            currentCourse = {
              course,
              progress: null,
              isLocked: false,
              previousCourse,
              nextCourse: i < allCourses.length - 1 ? allCourses[i + 1] : undefined,
            };
            foundCurrent = true;
          }
        }

        // Collect next courses (up to 3)
        if (foundCurrent && nextCourses.length < 3 && course.id !== currentCourse?.course.id) {
          const prevCourse = i > 0 ? allCourses[i - 1] : undefined;
          const prevProgress = prevCourse ? progressMap.get(prevCourse.id) : undefined;
          if (!prevProgress || prevProgress.status !== 'completed') {
            nextCourses.push(course);
          }
        }
      }

      const completionPercentage = totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

      return {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalProjects,
        submittedProjects,
        completionPercentage,
        currentCourse,
        nextCourses,
      };
    },
    enabled: !!user && !!student,
  });
}
