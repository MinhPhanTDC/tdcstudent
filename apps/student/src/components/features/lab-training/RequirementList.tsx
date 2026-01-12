'use client';

import type { LabRequirement, StudentLabProgress, LabProgressStatus } from '@tdc/schemas';
import { RequirementCard } from './RequirementCard';

export interface RequirementListProps {
  /** List of active lab requirements (already filtered and sorted) */
  requirements: LabRequirement[];
  /** Student's progress records */
  progress: StudentLabProgress[];
  /** Callback when a requirement is marked as complete */
  onMarkComplete: (requirementId: string) => void;
  /** ID of requirement currently being processed */
  loadingRequirementId?: string | null;
}

/**
 * Filter active requirements from a list
 * Property 2: Active requirements filtering
 * For any list of Lab requirements, the student view SHALL display only
 * requirements where isActive equals true, maintaining the order field sorting.
 * 
 * Requirements: 1.1, 1.5, 3.5
 * 
 * @param requirements - Array of lab requirements
 * @returns Filtered array containing only active requirements, sorted by order
 */
export function filterActiveRequirements(requirements: LabRequirement[]): LabRequirement[] {
  return requirements
    .filter((req) => req.isActive)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get the status of a requirement for a student
 * 
 * @param progress - Array of student progress records
 * @param requirementId - The requirement ID to check
 * @returns The status or 'not_started' if no progress exists
 */
function getRequirementStatus(
  progress: StudentLabProgress[],
  requirementId: string
): LabProgressStatus {
  const record = progress.find((p) => p.requirementId === requirementId);
  return record?.status || 'not_started';
}

/**
 * RequirementList component - renders list of RequirementCard components
 * Requirements: 1.1, 1.5
 */
export function RequirementList({
  requirements,
  progress,
  onMarkComplete,
  loadingRequirementId,
}: RequirementListProps): JSX.Element {
  if (requirements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-secondary-300 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-secondary-900">
          Chưa có yêu cầu nào
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          Các yêu cầu Lab Training sẽ được hiển thị ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requirements.map((requirement) => (
        <RequirementCard
          key={requirement.id}
          requirement={requirement}
          status={getRequirementStatus(progress, requirement.id)}
          onMarkComplete={() => onMarkComplete(requirement.id)}
          isLoading={loadingRequirementId === requirement.id}
        />
      ))}
    </div>
  );
}
