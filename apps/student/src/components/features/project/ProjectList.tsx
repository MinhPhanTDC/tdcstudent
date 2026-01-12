'use client';

import { useState } from 'react';
import { Skeleton } from '@tdc/ui';
import type { ProjectSubmission } from '@tdc/schemas';
import { ProjectCard } from './ProjectCard';
import { ProjectSubmitForm } from './ProjectSubmitForm';

export interface ProjectListProps {
  /** Number of required projects for the course */
  requiredProjects: number;
  /** List of existing submissions */
  submissions: ProjectSubmission[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when a project is submitted */
  onSubmit: (projectNumber: number, data: { title?: string; submissionUrl: string; notes?: string }) => Promise<void>;
  /** Callback when a project is updated */
  onUpdate: (submissionId: string, data: { title?: string; submissionUrl: string; notes?: string }) => Promise<void>;
  /** Callback when a project is deleted */
  onDelete: (submissionId: string) => Promise<void>;
  /** Whether a mutation is in progress */
  isMutating?: boolean;
}

/**
 * ProjectList component - displays list of required projects with submission status
 * Requirements: 4.1
 */
export function ProjectList({
  requiredProjects,
  submissions,
  isLoading = false,
  onSubmit,
  onUpdate,
  onDelete,
  isMutating = false,
}: ProjectListProps): JSX.Element {
  const [formState, setFormState] = useState<{
    isOpen: boolean;
    projectNumber: number;
    existingSubmission?: ProjectSubmission;
  }>({
    isOpen: false,
    projectNumber: 1,
    existingSubmission: undefined,
  });

  // Create array of project numbers
  const projectNumbers = Array.from({ length: requiredProjects }, (_, i) => i + 1);

  // Get submission for a project number
  const getSubmissionForProject = (projectNumber: number): ProjectSubmission | undefined => {
    return submissions.find((s) => s.projectNumber === projectNumber);
  };

  // Handle opening form for new submission
  const handleOpenSubmitForm = (projectNumber: number) => {
    setFormState({
      isOpen: true,
      projectNumber,
      existingSubmission: undefined,
    });
  };

  // Handle opening form for edit
  const handleOpenEditForm = (projectNumber: number, submission: ProjectSubmission) => {
    setFormState({
      isOpen: true,
      projectNumber,
      existingSubmission: submission,
    });
  };

  // Handle closing form
  const handleCloseForm = () => {
    setFormState({
      isOpen: false,
      projectNumber: 1,
      existingSubmission: undefined,
    });
  };

  // Handle form submission
  const handleFormSubmit = async (data: { title?: string; submissionUrl: string; notes?: string }) => {
    if (formState.existingSubmission) {
      await onUpdate(formState.existingSubmission.id, data);
    } else {
      await onSubmit(formState.projectNumber, data);
    }
    handleCloseForm();
  };

  // Handle delete
  const handleDelete = async (submission: ProjectSubmission) => {
    if (window.confirm('Bạn có chắc muốn xóa bài nộp này?')) {
      await onDelete(submission.id);
    }
  };

  if (isLoading) {
    return <ProjectListSkeleton count={requiredProjects} />;
  }

  if (requiredProjects === 0) {
    return (
      <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-6 text-center">
        <svg
          className="mx-auto h-10 w-10 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-secondary-600">
          Môn học này không yêu cầu dự án
        </p>
      </div>
    );
  }

  const submittedCount = submissions.length;

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900">Dự án</h3>
        <span className="text-sm text-secondary-600">
          {submittedCount}/{requiredProjects} đã nộp
        </span>
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {projectNumbers.map((projectNumber) => {
          const submission = getSubmissionForProject(projectNumber);
          return (
            <ProjectCard
              key={projectNumber}
              projectNumber={projectNumber}
              submission={submission}
              onSubmit={() => handleOpenSubmitForm(projectNumber)}
              onEdit={() => submission && handleOpenEditForm(projectNumber, submission)}
              onDelete={() => submission && handleDelete(submission)}
            />
          );
        })}
      </div>

      {/* Submit/Edit form modal */}
      <ProjectSubmitForm
        isOpen={formState.isOpen}
        onClose={handleCloseForm}
        projectNumber={formState.projectNumber}
        existingSubmission={formState.existingSubmission}
        onSubmit={handleFormSubmit}
        isSubmitting={isMutating}
      />
    </div>
  );
}

/**
 * Skeleton loading state for project list
 * Requirements: 9.1
 */
function ProjectListSkeleton({ count }: { count: number }): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height={24} width={80} rounded="sm" />
        <Skeleton height={20} width={60} rounded="sm" />
      </div>

      {/* Project card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: count || 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-secondary-200 bg-white p-6"
          >
            <div className="flex items-start gap-3">
              <Skeleton height={40} width={40} rounded="full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton height={20} width={80} rounded="sm" />
                  <Skeleton height={20} width={60} rounded="full" />
                </div>
                <Skeleton height={16} width={200} rounded="sm" />
              </div>
              <Skeleton height={32} width={80} rounded="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
