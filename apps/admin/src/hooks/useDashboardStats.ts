'use client';

import { useQuery } from '@tanstack/react-query';
import { semesterRepository, courseRepository, studentRepository, userRepository } from '@tdc/firebase';
import type { Student, User } from '@tdc/schemas';

/**
 * Dashboard statistics interface
 * Requirements: 5.1, 5.2
 */
export interface DashboardStats {
  totalSemesters: number;
  totalCourses: number;
  totalStudents: number;
  newStudentsThisMonth: number;
}

/**
 * Recent student with user data
 * Requirements: 5.3
 */
export interface RecentStudent extends Student {
  user: User;
}

// Query keys factory
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentStudents: (count: number) => [...dashboardKeys.all, 'recentStudents', count] as const,
};

/**
 * Hook to fetch dashboard statistics
 * Requirements: 5.1, 5.2
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all counts in parallel
      const [semestersResult, coursesResult, studentsResult, newStudentsResult] = await Promise.all([
        semesterRepository.findAllSorted(),
        courseRepository.findAllSorted(),
        studentRepository.countTotal(),
        studentRepository.countNewThisMonth(),
      ]);

      // Handle errors
      if (!semestersResult.success) {
        throw semestersResult.error;
      }
      if (!coursesResult.success) {
        throw coursesResult.error;
      }
      if (!studentsResult.success) {
        throw studentsResult.error;
      }
      if (!newStudentsResult.success) {
        throw newStudentsResult.error;
      }

      return {
        totalSemesters: semestersResult.data.length,
        totalCourses: coursesResult.data.length,
        totalStudents: studentsResult.data,
        newStudentsThisMonth: newStudentsResult.data,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch recent students
 * Requirements: 5.3
 */
export function useRecentStudents(count: number = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentStudents(count),
    queryFn: async (): Promise<RecentStudent[]> => {
      // Get recent students
      const studentsResult = await studentRepository.findRecent(count);
      if (!studentsResult.success) {
        throw studentsResult.error;
      }

      // Get user data for each student
      const usersResult = await userRepository.findByRole('student');
      if (!usersResult.success) {
        throw usersResult.error;
      }

      // Merge student and user data
      const recentStudents: RecentStudent[] = [];
      for (const student of studentsResult.data) {
        const user = usersResult.data.find((u) => u.id === student.userId);
        if (user) {
          recentStudents.push({ ...student, user });
        }
      }

      return recentStudents;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch all dashboard data at once
 * Combines stats and recent students
 */
export function useDashboard(recentStudentsCount: number = 5) {
  const statsQuery = useDashboardStats();
  const recentStudentsQuery = useRecentStudents(recentStudentsCount);

  return {
    stats: statsQuery.data,
    recentStudents: recentStudentsQuery.data,
    isLoading: statsQuery.isLoading || recentStudentsQuery.isLoading,
    isError: statsQuery.isError || recentStudentsQuery.isError,
    error: statsQuery.error || recentStudentsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      recentStudentsQuery.refetch();
    },
  };
}
