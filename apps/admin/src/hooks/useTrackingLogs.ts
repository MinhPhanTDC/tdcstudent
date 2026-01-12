'use client';

import { useQuery } from '@tanstack/react-query';
import { trackingLogRepository } from '@tdc/firebase';
import type { TrackingLog } from '@tdc/schemas';

// Query keys factory
export const trackingLogKeys = {
  all: ['trackingLogs'] as const,
  lists: () => [...trackingLogKeys.all, 'list'] as const,
  byStudentCourse: (studentId: string, courseId: string) =>
    [...trackingLogKeys.all, 'byStudentCourse', studentId, courseId] as const,
  byStudent: (studentId: string) =>
    [...trackingLogKeys.all, 'byStudent', studentId] as const,
  byCourse: (courseId: string) =>
    [...trackingLogKeys.all, 'byCourse', courseId] as const,
  byAdmin: (adminId: string) =>
    [...trackingLogKeys.all, 'byAdmin', adminId] as const,
};

/**
 * Hook to fetch tracking logs by student and course
 * Requirements: 7.4
 * 
 * @param studentId - The student ID to filter by
 * @param courseId - The course ID to filter by
 * @returns Query result with tracking logs
 */
export function useTrackingLogsByStudentCourse(studentId: string, courseId: string) {
  return useQuery({
    queryKey: trackingLogKeys.byStudentCourse(studentId, courseId),
    queryFn: async (): Promise<TrackingLog[]> => {
      const result = await trackingLogRepository.findByStudentCourse(studentId, courseId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!studentId && !!courseId,
  });
}

/**
 * Hook to fetch all tracking logs for a student
 * Requirements: 7.4
 * 
 * @param studentId - The student ID to filter by
 * @returns Query result with tracking logs
 */
export function useTrackingLogsByStudent(studentId: string) {
  return useQuery({
    queryKey: trackingLogKeys.byStudent(studentId),
    queryFn: async (): Promise<TrackingLog[]> => {
      const result = await trackingLogRepository.findByStudent(studentId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!studentId,
  });
}

/**
 * Hook to fetch tracking logs for a course
 * 
 * @param courseId - The course ID to filter by
 * @returns Query result with tracking logs
 */
export function useTrackingLogsByCourse(courseId: string) {
  return useQuery({
    queryKey: trackingLogKeys.byCourse(courseId),
    queryFn: async (): Promise<TrackingLog[]> => {
      const result = await trackingLogRepository.findByCourse(courseId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch tracking logs by admin who performed the action
 * 
 * @param adminId - The admin ID to filter by
 * @returns Query result with tracking logs
 */
export function useTrackingLogsByAdmin(adminId: string) {
  return useQuery({
    queryKey: trackingLogKeys.byAdmin(adminId),
    queryFn: async (): Promise<TrackingLog[]> => {
      const result = await trackingLogRepository.findByPerformedBy(adminId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!adminId,
  });
}

/**
 * Format tracking action for display
 */
export function formatTrackingAction(action: TrackingLog['action']): string {
  const actionLabels: Record<TrackingLog['action'], string> = {
    update_sessions: 'Cập nhật số buổi',
    update_projects: 'Cập nhật số dự án',
    add_project_link: 'Thêm link dự án',
    remove_project_link: 'Xóa link dự án',
    approve: 'Duyệt pass',
    reject: 'Từ chối',
    unlock_course: 'Mở khóa môn học',
    unlock_semester: 'Mở khóa học kỳ',
  };
  return actionLabels[action] || action;
}

/**
 * Format tracking log value for display
 */
export function formatTrackingValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return JSON.stringify(value);
}
