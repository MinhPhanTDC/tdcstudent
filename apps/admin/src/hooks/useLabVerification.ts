'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labProgressService, studentRepository, labRequirementRepository } from '@tdc/firebase';
import type { StudentLabProgress, LabRequirement, Student } from '@tdc/schemas';
import type { Result } from '@tdc/types';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Pending verification item with enriched data
 * Requirements: 4.2
 */
export interface PendingVerification {
  progress: StudentLabProgress;
  studentName: string;
  studentEmail: string;
  requirementTitle: string;
  submissionDate: Date;
}

// Query keys factory
export const labVerificationKeys = {
  all: ['lab-verification'] as const,
  pending: () => [...labVerificationKeys.all, 'pending'] as const,
};

/**
 * Enriches progress records with student and requirement data
 * Requirements: 4.2
 */
async function enrichPendingVerifications(
  progressRecords: StudentLabProgress[]
): Promise<PendingVerification[]> {
  // Fetch all unique student IDs and requirement IDs
  const studentIds = [...new Set(progressRecords.map((p) => p.studentId))];
  const requirementIds = [...new Set(progressRecords.map((p) => p.requirementId))];

  // Fetch students and requirements in parallel
  const [studentsResults, requirementsResults] = await Promise.all([
    Promise.all(studentIds.map((id) => studentRepository.findById(id))),
    Promise.all(requirementIds.map((id) => labRequirementRepository.findById(id))),
  ]);

  // Create lookup maps
  const studentMap = new Map<string, Student>();
  studentsResults.forEach((result) => {
    if (result.success) {
      studentMap.set(result.data.id, result.data);
    }
  });

  const requirementMap = new Map<string, LabRequirement>();
  requirementsResults.forEach((result) => {
    if (result.success) {
      requirementMap.set(result.data.id, result.data);
    }
  });

  // Enrich progress records
  return progressRecords.map((progress) => {
    const student = studentMap.get(progress.studentId);
    const requirement = requirementMap.get(progress.requirementId);

    return {
      progress,
      studentName: student?.displayName || 'Unknown Student',
      studentEmail: student?.email || '',
      requirementTitle: requirement?.title || 'Unknown Requirement',
      submissionDate: progress.updatedAt,
    };
  });
}

/**
 * Hook to fetch pending lab verifications
 * Requirements: 4.1, 4.2
 */
export function useLabVerification() {
  return useQuery({
    queryKey: labVerificationKeys.pending(),
    queryFn: async (): Promise<PendingVerification[]> => {
      const result = await labProgressService.getPendingVerifications();
      if (!result.success) {
        throw result.error;
      }

      // Enrich with student and requirement data
      return enrichPendingVerifications(result.data);
    },
  });
}

/**
 * Hook to approve a pending verification
 * Requirements: 4.3
 */
export function useApproveVerification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (progressId: string): Promise<Result<StudentLabProgress>> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await labProgressService.approve({
        progressId,
        verifiedBy: user.id,
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data.progress };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labVerificationKeys.pending() });
      }
    },
  });
}

/**
 * Hook to reject a pending verification
 * Requirements: 4.4
 */
export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      progressId,
      rejectionReason,
    }: {
      progressId: string;
      rejectionReason: string;
    }): Promise<Result<StudentLabProgress>> => {
      const result = await labProgressService.reject({
        progressId,
        rejectionReason,
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data.progress };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labVerificationKeys.pending() });
      }
    },
  });
}
