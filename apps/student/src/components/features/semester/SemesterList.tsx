'use client';

import { Card, Skeleton } from '@tdc/ui';
import type { SemesterWithStatus } from '@tdc/schemas';
import { SemesterCard } from './SemesterCard';

export interface SemesterListProps {
  semesters: SemesterWithStatus[];
  isLoading?: boolean;
}

/**
 * SemesterList component - displays list of semester cards
 * Requirements: 1.1, 9.1, 9.2
 */
export function SemesterList({ semesters, isLoading }: SemesterListProps): JSX.Element {
  if (isLoading) {
    return <SemesterListSkeleton />;
  }

  if (semesters.length === 0) {
    return <SemesterListEmpty />;
  }

  return (
    <div className="space-y-4">
      {semesters.map((semesterWithStatus) => (
        <SemesterCard
          key={semesterWithStatus.semester.id}
          semesterWithStatus={semesterWithStatus}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton loading state for semester list
 * Requirements: 9.1
 */
export function SemesterListSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton rounded="full" className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton height={20} width={200} rounded="sm" />
                <Skeleton height={14} width={150} rounded="sm" />
                <div className="flex items-center gap-2">
                  <Skeleton height={20} width={80} rounded="full" />
                  <Skeleton height={14} width={60} rounded="sm" />
                </div>
              </div>
            </div>
            <Skeleton height={20} width={20} rounded="sm" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Empty state for semester list
 * Requirements: 9.2
 */
export function SemesterListEmpty(): JSX.Element {
  return (
    <Card className="text-center">
      <div className="py-8">
        <svg
          className="mx-auto h-12 w-12 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-secondary-900">
          Chưa có học kỳ nào
        </h3>
        <p className="mt-2 text-sm text-secondary-500">
          Các học kỳ sẽ được hiển thị ở đây khi có sẵn.
        </p>
      </div>
    </Card>
  );
}
