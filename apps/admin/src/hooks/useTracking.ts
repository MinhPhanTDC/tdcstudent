'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  progressRepository,
  trackingService,
  studentRepository,
  courseRepository,
} from '@tdc/firebase';
import type { ApprovalResult } from '@tdc/firebase';
import type {
  StudentProgress,
  UpdateProgressInput,
  Course,
  ProgressStatus,
} from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const trackingKeys = {
  all: ['tracking'] as const,
  lists: () => [...trackingKeys.all, 'list'] as const,
  list: (filters?: TrackingFilters, pagination?: TrackingPagination) =>
    [...trackingKeys.lists(), filters, pagination] as const,
  pendingApproval: (courseId?: string) =>
    [...trackingKeys.all, 'pendingApproval', courseId] as const,
  details: () => [...trackingKeys.all, 'detail'] as const,
  detail: (progressId: string) => [...trackingKeys.details(), progressId] as const,
  byStudentCourse: (studentId: string, courseId: string) =>
    [...trackingKeys.all, 'byStudentCourse', studentId, courseId] as const,
};

/**
 * Tracking filters for querying progress data
 * Requirements: 1.3, 1.4, 1.5
 */
export interface TrackingFilters {
  semesterId?: string;
  courseId?: string;
  search?: string;
  status?: ProgressStatus;
}

/**
 * Pagination options for tracking table
 * Requirements: 1.6
 */
export interface TrackingPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tracking data view model combining progress, student, and course info
 * Requirements: 1.1, 1.2
 */
export interface TrackingData {
  progressId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  semesterId: string;
  semesterName: string;
  completedSessions: number;
  requiredSessions: number;
  projectsSubmitted: number;
  requiredProjects: number;
  projectLinks: string[];
  status: ProgressStatus;
  canPass: boolean;
  missingConditions: string[];
  rejectionReason?: string;
  approvedAt?: Date | null;
  approvedBy?: string;
}

/**
 * Paginated tracking data result
 */
export interface PaginatedTrackingData {
  items: TrackingData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Helper function to check pass conditions
 */
function checkPassConditions(
  progress: StudentProgress,
  course: Course
): { canPass: boolean; missingConditions: string[] } {
  const missingConditions: string[] = [];

  if (progress.completedSessions < course.requiredSessions) {
    missingConditions.push(
      `Cần hoàn thành ${course.requiredSessions - progress.completedSessions} buổi học nữa`
    );
  }

  if (progress.projectsSubmitted < course.requiredProjects) {
    missingConditions.push(
      `Cần nộp ${course.requiredProjects - progress.projectsSubmitted} dự án nữa`
    );
  }

  if (progress.projectLinks.length === 0) {
    missingConditions.push('Cần có ít nhất 1 link dự án');
  }

  return {
    canPass: missingConditions.length === 0,
    missingConditions,
  };
}


/**
 * Hook to fetch tracking data with filters, pagination, and sorting
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */
export function useTracking(
  filters?: TrackingFilters,
  pagination?: TrackingPagination
) {
  return useQuery({
    queryKey: trackingKeys.list(filters, pagination),
    queryFn: async (): Promise<PaginatedTrackingData> => {
      // Get all courses first (for filtering by semester)
      const coursesResult = await courseRepository.findAllSorted();
      if (!coursesResult.success) {
        throw coursesResult.error;
      }
      const courses = coursesResult.data;

      // Filter courses by semester if specified
      let filteredCourses = courses;
      if (filters?.semesterId) {
        filteredCourses = courses.filter((c) => c.semesterId === filters.semesterId);
      }

      // Further filter by specific course if specified
      if (filters?.courseId) {
        filteredCourses = filteredCourses.filter((c) => c.id === filters.courseId);
      }

      // Get progress records for filtered courses
      let allProgress: StudentProgress[] = [];
      for (const course of filteredCourses) {
        const progressResult = await progressRepository.findByCourse(course.id);
        if (progressResult.success) {
          allProgress = [...allProgress, ...progressResult.data];
        }
      }

      // Filter by status if specified
      if (filters?.status) {
        allProgress = allProgress.filter((p) => p.status === filters.status);
      }

      // Get all students for name/email lookup
      const studentsResult = await studentRepository.findAll([]);
      if (!studentsResult.success) {
        throw studentsResult.error;
      }
      const studentsMap = new Map(studentsResult.data.map((s) => [s.id, s]));
      const coursesMap = new Map(courses.map((c) => [c.id, c]));

      // Build tracking data
      let trackingData: TrackingData[] = [];
      for (const progress of allProgress) {
        const student = studentsMap.get(progress.studentId);
        const course = coursesMap.get(progress.courseId);

        if (!student || !course) continue;

        const { canPass, missingConditions } = checkPassConditions(progress, course);

        trackingData.push({
          progressId: progress.id,
          studentId: progress.studentId,
          studentName: student.displayName,
          studentEmail: student.email,
          courseId: progress.courseId,
          courseName: course.title,
          semesterId: course.semesterId,
          semesterName: '', // Will be filled if needed
          completedSessions: progress.completedSessions,
          requiredSessions: course.requiredSessions,
          projectsSubmitted: progress.projectsSubmitted,
          requiredProjects: course.requiredProjects,
          projectLinks: progress.projectLinks,
          status: progress.status,
          canPass,
          missingConditions,
          rejectionReason: progress.rejectionReason,
          approvedAt: progress.approvedAt,
          approvedBy: progress.approvedBy,
        });
      }

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        trackingData = trackingData.filter(
          (item) =>
            item.studentName.toLowerCase().includes(searchLower) ||
            item.studentEmail.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      const sortBy = pagination?.sortBy || 'studentName';
      const sortOrder = pagination?.sortOrder || 'asc';
      trackingData.sort((a, b) => {
        const aValue = a[sortBy as keyof TrackingData];
        const bValue = b[sortBy as keyof TrackingData];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const total = trackingData.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedItems = trackingData.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    },
  });
}


/**
 * Hook to fetch pending approval progress records for Quick Track
 * Requirements: 4.1
 */
export function usePendingApproval(courseId?: string) {
  return useQuery({
    queryKey: trackingKeys.pendingApproval(courseId),
    queryFn: async (): Promise<TrackingData[]> => {
      // Get pending approval progress
      const progressResult = courseId
        ? await progressRepository.findPendingApprovalByCourse(courseId)
        : await progressRepository.findPendingApproval();

      if (!progressResult.success) {
        throw progressResult.error;
      }

      // Get all students and courses for lookup
      const studentsResult = await studentRepository.findAll([]);
      if (!studentsResult.success) {
        throw studentsResult.error;
      }

      const coursesResult = await courseRepository.findAllSorted();
      if (!coursesResult.success) {
        throw coursesResult.error;
      }

      const studentsMap = new Map(studentsResult.data.map((s) => [s.id, s]));
      const coursesMap = new Map(coursesResult.data.map((c) => [c.id, c]));

      // Build tracking data
      const trackingData: TrackingData[] = [];
      for (const progress of progressResult.data) {
        const student = studentsMap.get(progress.studentId);
        const course = coursesMap.get(progress.courseId);

        if (!student || !course) continue;

        trackingData.push({
          progressId: progress.id,
          studentId: progress.studentId,
          studentName: student.displayName,
          studentEmail: student.email,
          courseId: progress.courseId,
          courseName: course.title,
          semesterId: course.semesterId,
          semesterName: '',
          completedSessions: progress.completedSessions,
          requiredSessions: course.requiredSessions,
          projectsSubmitted: progress.projectsSubmitted,
          requiredProjects: course.requiredProjects,
          projectLinks: progress.projectLinks,
          status: progress.status,
          canPass: true, // Already pending approval
          missingConditions: [],
          rejectionReason: progress.rejectionReason,
          approvedAt: progress.approvedAt,
          approvedBy: progress.approvedBy,
        });
      }

      return trackingData;
    },
  });
}

/**
 * Hook to update student progress
 * Requirements: 2.3
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      progressId,
      data,
      adminId,
    }: {
      progressId: string;
      data: UpdateProgressInput;
      adminId: string;
    }): Promise<Result<StudentProgress>> => {
      const result = await trackingService.updateProgress(progressId, data, adminId);
      if (!result.success) {
        return result;
      }
      return { success: true, data: result.data.progress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trackingKeys.pendingApproval() });
    },
  });
}

/**
 * Hook to approve a student's progress
 * Requirements: 3.3, 5.1, 5.2
 * 
 * Returns ApprovalResult which includes:
 * - progress: The updated progress record
 * - unlockResult: Information about unlocked course/semester (if any)
 * - notificationCreated: Whether completion notification was created
 */
export function useApproveProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      progressId,
      adminId,
    }: {
      progressId: string;
      adminId: string;
    }): Promise<Result<ApprovalResult>> => {
      return trackingService.approve(progressId, adminId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trackingKeys.pendingApproval() });
    },
  });
}

/**
 * Hook to reject a student's progress
 * Requirements: 3.5
 */
export function useRejectProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      progressId,
      reason,
      adminId,
    }: {
      progressId: string;
      reason: string;
      adminId: string;
    }): Promise<Result<StudentProgress>> => {
      return trackingService.reject(progressId, reason, adminId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trackingKeys.pendingApproval() });
    },
  });
}

/**
 * Hook to get a single progress record
 */
export function useProgress(progressId: string) {
  return useQuery({
    queryKey: trackingKeys.detail(progressId),
    queryFn: async (): Promise<StudentProgress> => {
      const result = await progressRepository.findById(progressId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!progressId,
  });
}

/**
 * Hook to get progress by student and course
 */
export function useProgressByStudentCourse(studentId: string, courseId: string) {
  return useQuery({
    queryKey: trackingKeys.byStudentCourse(studentId, courseId),
    queryFn: async (): Promise<StudentProgress | null> => {
      const result = await progressRepository.findByStudentAndCourse(studentId, courseId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!studentId && !!courseId,
  });
}
