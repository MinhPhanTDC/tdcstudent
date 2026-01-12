'use client';

import Link from 'next/link';
import { Card, Badge, Button, Spinner } from '@tdc/ui';
import type { Major } from '@tdc/schemas';

export interface MajorCardProps {
  major: Major;
  courseCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  isDeleting?: boolean;
  isRestoring?: boolean;
}

/**
 * MajorCard component - displays major info with actions
 * Requirements: 1.2
 */
export function MajorCard({
  major,
  courseCount = 0,
  onEdit,
  onDelete,
  onRestore,
  isDeleting = false,
  isRestoring = false,
}: MajorCardProps): JSX.Element {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col p-4">
        {/* Header with color indicator */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Color indicator */}
            <div
              className="h-10 w-10 flex-shrink-0 rounded-lg"
              style={{ backgroundColor: major.color || '#6B7280' }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-secondary-900 line-clamp-1">{major.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={major.isActive ? 'success' : 'warning'}>
                  {major.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {major.description && (
          <p className="mb-3 line-clamp-2 text-sm text-secondary-500">
            {major.description}
          </p>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 text-sm text-secondary-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {courseCount} môn học
          </span>
        </div>

        {/* Actions - pushed to bottom */}
        <div className="mt-auto flex items-center gap-2 border-t border-secondary-100 pt-3">
          {major.isActive ? (
            <>
              {onEdit ? (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Chỉnh sửa
                </Button>
              ) : (
                <Link href={`/majors/${major.id}`}>
                  <Button variant="ghost" size="sm">
                    Chi tiết
                  </Button>
                </Link>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  {isDeleting ? <Spinner size="sm" /> : 'Xóa'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Link href={`/majors/${major.id}`}>
                <Button variant="ghost" size="sm">
                  Chi tiết
                </Button>
              </Link>
              {onRestore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRestore}
                  disabled={isRestoring}
                  className="text-green-600 hover:text-green-700"
                >
                  {isRestoring ? <Spinner size="sm" /> : 'Khôi phục'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
