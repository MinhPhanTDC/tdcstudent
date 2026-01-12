'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectSubmissionRepository, progressRepository, activityService } from '@tdc/firebase';
import type {
  ProjectSubmission,
  CreateProjectSubmissionInput,
  UpdateProjectSubmissionInput,
} from '@tdc/schemas';
import type { Result } from '@tdc/types';
import { useMyStudent } from './useMyCourses';
import { myProjectKeys } from './useMyProjects';

/**
 * Hook to submit a new project
 * Requirements: 4.2, 4.3, 6.3
 */
export function useSubmitProject() {
  const queryClient = useQueryClient();
  const { data: student } = useMyStudent();

  return useMutation({
    mutationFn: async (input: CreateProjectSubmissionInput): Promise<Result<ProjectSubmission>> => {
      if (!student) {
        return {
          success: false,
          error: new Error('Student not found') as never,
        };
      }

      const result = await projectSubmissionRepository.createSubmission(student.id, input);

      // Update progress if submission successful
      if (result.success) {
        const progressResult = await progressRepository.findByStudentAndCourse(
          student.id,
          input.courseId
        );

        if (progressResult.success && progressResult.data) {
          await progressRepository.update(progressResult.data.id, {
            projectsSubmitted: progressResult.data.projectsSubmitted + 1,
            status: progressResult.data.status === 'not_started' ? 'in_progress' : progressResult.data.status,
          });
        }

        // Log project submission activity (Requirements: 6.3)
        try {
          await activityService.logProjectSubmission({
            userId: student.id,
            userName: student.displayName || 'Unknown Student',
            projectId: result.data.id,
            projectTitle: input.title || `Project ${input.projectNumber}`,
          });
        } catch (activityError) {
          // Don't fail the submission if activity logging fails
          console.warn('Failed to log project submission activity:', activityError);
        }
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: myProjectKeys.byCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: myProjectKeys.byStudent() });
    },
  });
}

/**
 * Hook to update an existing project submission
 * Requirements: 4.4
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      input,
    }: {
      submissionId: string;
      courseId: string;
      input: UpdateProjectSubmissionInput;
    }): Promise<Result<ProjectSubmission>> => {
      return projectSubmissionRepository.updateSubmission(submissionId, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: myProjectKeys.byCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: myProjectKeys.byStudent() });
    },
  });
}

/**
 * Hook to delete a project submission
 * Requirements: 4.4
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { data: student } = useMyStudent();

  return useMutation({
    mutationFn: async ({
      submissionId,
      courseId,
    }: {
      submissionId: string;
      courseId: string;
    }): Promise<Result<void>> => {
      if (!student) {
        return {
          success: false,
          error: new Error('Student not found') as never,
        };
      }

      const result = await projectSubmissionRepository.delete(submissionId);

      // Update progress if deletion successful
      if (result.success) {
        const progressResult = await progressRepository.findByStudentAndCourse(
          student.id,
          courseId
        );

        if (progressResult.success && progressResult.data && progressResult.data.projectsSubmitted > 0) {
          await progressRepository.update(progressResult.data.id, {
            projectsSubmitted: progressResult.data.projectsSubmitted - 1,
          });
        }
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: myProjectKeys.byCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: myProjectKeys.byStudent() });
    },
  });
}
