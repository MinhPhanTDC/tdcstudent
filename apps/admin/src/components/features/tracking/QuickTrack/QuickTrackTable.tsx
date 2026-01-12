'use client';

import { Card, Checkbox, Badge, EmptyState } from '@tdc/ui';
import type { TrackingData } from '@/hooks/useTracking';

export interface QuickTrackTableProps {
  /** Pending approval data to display */
  data: TrackingData[];
  /** Loading state */
  isLoading: boolean;
  /** Set of selected progress IDs */
  selectedIds?: Set<string>;
  /** Callback when selection changes */
  onSelectionChange: (progressId: string, selected: boolean) => void;
  /** Check if a specific item is selected */
  isSelected: (progressId: string) => boolean;
}

/**
 * Skeleton loading component for quick track table
 * Requirements: 10.1
 */
function QuickTrackTableSkeleton(): JSX.Element {
  return (
    <Card>
      <div className="space-y-4">
        {/* Table header skeleton */}
        <div className="flex items-center border-b border-secondary-200 pb-3">
          <div className="w-12">
            <div className="h-4 w-4 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-48">
            <div className="h-4 w-32 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
          <div className="w-24">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary-200" />
          </div>
        </div>
        {/* Table rows skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center py-3">
            <div className="w-12">
              <div className="h-4 w-4 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-secondary-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-secondary-100" />
              </div>
            </div>
            <div className="w-48">
              <div className="h-4 w-36 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-4 w-12 animate-pulse rounded bg-secondary-100" />
            </div>
            <div className="w-24">
              <div className="h-4 w-12 animate-pulse rounded bg-secondary-100" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Quick Track table component displaying only pending_approval students
 * Requirements: 4.1, 4.2
 * 
 * - Displays only students with pending_approval status
 * - Checkbox column for selection
 * - Student info columns (name, email, course, sessions, projects)
 */
export function QuickTrackTable({
  data,
  isLoading,
  onSelectionChange,
  isSelected,
}: QuickTrackTableProps): JSX.Element {
  // Loading state - Requirements: 10.1
  if (isLoading) {
    return <QuickTrackTableSkeleton />;
  }

  // Empty state - Requirements: 10.2
  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="Không có học viên chờ duyệt"
          description="Tất cả học viên đã được xử lý hoặc chưa đủ điều kiện pass"
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200">
              {/* Checkbox column header - Requirements: 4.2 */}
              <th className="w-12 px-4 py-3 text-left">
                <span className="sr-only">Chọn</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                Học viên
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                Môn học
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                Buổi học
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                Dự án
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                Links
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.progressId}
                className={`border-b border-secondary-100 hover:bg-secondary-50 ${
                  isSelected(item.progressId) ? 'bg-primary-50' : ''
                }`}
              >
                {/* Checkbox column - Requirements: 4.2 */}
                <td className="px-4 py-3">
                  <Checkbox
                    checked={isSelected(item.progressId)}
                    onChange={(e) =>
                      onSelectionChange(item.progressId, e.target.checked)
                    }
                    aria-label={`Chọn ${item.studentName}`}
                  />
                </td>

                {/* Student info */}
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-secondary-900">
                      {item.studentName}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {item.studentEmail}
                    </p>
                  </div>
                </td>

                {/* Course name */}
                <td className="px-4 py-3">
                  <span className="text-secondary-700">{item.courseName}</span>
                </td>

                {/* Sessions count */}
                <td className="px-4 py-3">
                  <span className="text-secondary-600">
                    {item.completedSessions}/{item.requiredSessions}
                  </span>
                </td>

                {/* Projects count */}
                <td className="px-4 py-3">
                  <span className="text-secondary-600">
                    {item.projectsSubmitted}/{item.requiredProjects}
                  </span>
                </td>

                {/* Project links */}
                <td className="px-4 py-3">
                  {item.projectLinks.length > 0 ? (
                    <span className="text-primary-600">
                      {item.projectLinks.length} link(s)
                    </span>
                  ) : (
                    <span className="text-secondary-400">Chưa có</span>
                  )}
                </td>

                {/* Status badge */}
                <td className="px-4 py-3">
                  <Badge variant="warning">Chờ duyệt</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
