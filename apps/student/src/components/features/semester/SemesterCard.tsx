'use client';

import Link from 'next/link';
import { Card, Badge } from '@tdc/ui';
import type { SemesterWithStatus } from '@tdc/schemas';

export interface SemesterCardProps {
  semesterWithStatus: SemesterWithStatus;
}

/**
 * SemesterCard component - displays semester info with status for students
 * Requirements: 1.2, 1.3, 1.4, 1.5
 */
export function SemesterCard({ semesterWithStatus }: SemesterCardProps): JSX.Element {
  const { semester, status, courseCount, completedCount } = semesterWithStatus;
  const isClickable = status !== 'locked';

  const statusConfig = {
    completed: {
      icon: (
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: 'Hoàn thành',
      badgeVariant: 'success' as const,
    },
    in_progress: {
      icon: (
        <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Đang học',
      badgeVariant: 'primary' as const,
    },
    locked: {
      icon: (
        <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: 'Chưa mở khóa',
      badgeVariant: 'default' as const,
    },
  };

  const config = statusConfig[status];

  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Status icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100">
          {config.icon}
        </div>

        {/* Semester info */}
        <div>
          <h3 className="font-medium text-secondary-900">{semester.name}</h3>
          {semester.description && (
            <p className="mt-0.5 text-sm text-secondary-500 line-clamp-1">{semester.description}</p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={config.badgeVariant}>{config.label}</Badge>
            <span className="text-xs text-secondary-400">
              {completedCount}/{courseCount} môn học
            </span>
          </div>
        </div>
      </div>

      {/* Arrow indicator for clickable cards */}
      {isClickable && (
        <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <Link href={`/semesters/${semester.id}`}>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="opacity-60">
      {cardContent}
    </Card>
  );
}
