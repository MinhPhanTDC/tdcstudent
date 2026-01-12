'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labProgressService } from '@tdc/firebase';
import type { StudentLabProgress, MarkCompleteInput } from '@tdc/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { labRequirementKeys } from './useLabRequirements';

// Query keys factory
export const labProgressKeys = {
  all: ['lab-progress'] as const,
  student: (studentId: string) => [...labProgressKeys.all, 'student', studentId] as const,
};

/**
 * Hook to fetch progress for current student and provide markComplete mutation
 * Requirements: 1.2, 2.1, 2.2, 2.4
 * 
 * @returns Query result with student progress and markComplete mutation
 */
export function useStudentLabProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const studentId = user?.id || '';

  const progressQuery = useQuery({
    queryKey: labProgressKeys.student(studentId),
    queryFn: async (): Promise<StudentLabProgress[]> => {
      if (!studentId) return [];
      
      const result = await labProgressService.getStudentProgress(studentId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!studentId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (input: MarkCompleteInput) => {
      if (!studentId) {
        throw new Error('Student not authenticated');
      }
      const result = await labProgressService.markComplete(studentId, input);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate progress query to refetch updated data
      queryClient.invalidateQueries({ queryKey: labProgressKeys.student(studentId) });
      // Also invalidate requirements in case any state changed
      queryClient.invalidateQueries({ queryKey: labRequirementKeys.all });
    },
  });

  return {
    progress: progressQuery.data || [],
    isLoading: progressQuery.isLoading,
    error: progressQuery.error,
    markComplete: markCompleteMutation.mutateAsync,
    isMarkingComplete: markCompleteMutation.isPending,
  };
}

/**
 * Get the status of a specific requirement for the current student
 * 
 * @param progress - Array of student progress records
 * @param requirementId - The requirement ID to check
 * @returns The status or 'not_started' if no progress exists
 */
export function getRequirementStatus(
  progress: StudentLabProgress[],
  requirementId: string
): StudentLabProgress['status'] {
  const record = progress.find((p) => p.requirementId === requirementId);
  return record?.status || 'not_started';
}
