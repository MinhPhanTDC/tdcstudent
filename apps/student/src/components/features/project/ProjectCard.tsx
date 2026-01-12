'use client';

import { Card, Badge, Button } from '@tdc/ui';
import type { ProjectSubmission, SubmissionType } from '@tdc/schemas';

export interface ProjectCardProps {
  /** Project number (1-indexed) */
  projectNumber: number;
  /** Existing submission if any */
  submission?: ProjectSubmission;
  /** Callback when edit is clicked */
  onEdit?: () => void;
  /** Callback when delete is clicked */
  onDelete?: () => void;
  /** Callback when submit is clicked (for new submissions) */
  onSubmit?: () => void;
}

/**
 * ProjectCard component - displays project submission status
 * Requirements: 4.1
 */
export function ProjectCard({
  projectNumber,
  submission,
  onEdit,
  onDelete,
  onSubmit,
}: ProjectCardProps): JSX.Element {
  const isSubmitted = !!submission;

  // Get submission type icon and label
  const getSubmissionTypeInfo = (type: SubmissionType) => {
    switch (type) {
      case 'drive':
        return {
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71 3.5L1.15 15l4.58 6.5h11.54l4.58-6.5L15.29 3.5H7.71zm.79 1.5h7l5.5 9.5-3.5 5h-11l-3.5-5L8.5 5z" />
            </svg>
          ),
          label: 'Google Drive',
        };
      case 'behance':
        return {
          icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
            </svg>
          ),
          label: 'Behance',
        };
      default:
        return {
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ),
          label: 'Link khác',
        };
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Project info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Project number badge */}
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
            isSubmitted ? 'bg-green-100 text-green-600' : 'bg-secondary-100 text-secondary-500'
          }`}>
            {isSubmitted ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-sm font-medium">{projectNumber}</span>
            )}
          </div>

          {/* Project details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-secondary-900">
                Dự án {projectNumber}
              </h3>
              <Badge variant={isSubmitted ? 'success' : 'default'}>
                {isSubmitted ? 'Đã nộp' : 'Chưa nộp'}
              </Badge>
            </div>

            {/* Submission details */}
            {submission && (
              <div className="mt-2 space-y-1">
                {submission.title && (
                  <p className="text-sm text-secondary-700">{submission.title}</p>
                )}
                <a
                  href={submission.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {getSubmissionTypeInfo(submission.submissionType).icon}
                  <span className="truncate max-w-[200px]">
                    {getSubmissionTypeInfo(submission.submissionType).label}
                  </span>
                  <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                {submission.notes && (
                  <p className="text-xs text-secondary-500 line-clamp-2">{submission.notes}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSubmitted ? (
            <>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={onSubmit}>
              Nộp bài
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
