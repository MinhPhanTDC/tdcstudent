'use client';

import Link from 'next/link';
import { Card, Badge, Button, Spinner } from '@tdc/ui';
import type { Semester } from '@tdc/schemas';

export interface SemesterCardProps {
  semester: Semester;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  isReordering?: boolean;
  isToggling?: boolean;
  isDeleting?: boolean;
}

/**
 * SemesterCard component - displays semester info with actions
 * Requirements: 1.8
 */
export function SemesterCard({
  semester,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onToggleActive,
  isReordering = false,
  isToggling = false,
  isDeleting = false,
}: SemesterCardProps): JSX.Element {
  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst || isReordering || !onMoveUp}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Di chuyển lên"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast || isReordering || !onMoveDown}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Di chuyển xuống"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Semester info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-secondary-900">{semester.name}</h3>
              <Badge variant={semester.isActive ? 'success' : 'warning'}>
                {semester.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </Badge>
              {semester.requiresMajorSelection && (
                <Badge variant="primary">Chọn chuyên ngành</Badge>
              )}
            </div>
            {semester.description && (
              <p className="mt-1 text-sm text-secondary-500">{semester.description}</p>
            )}
            <p className="mt-1 text-xs text-secondary-400">Thứ tự: {semester.order}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onToggleActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleActive}
              disabled={isToggling}
            >
              {isToggling ? (
                <Spinner size="sm" />
              ) : semester.isActive ? (
                'Tạm dừng'
              ) : (
                'Kích hoạt'
              )}
            </Button>
          )}
          {onEdit ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Chỉnh sửa
            </Button>
          ) : (
            <Link href={`/semesters/${semester.id}`}>
              <Button variant="ghost" size="sm">
                Chỉnh sửa
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
        </div>
      </div>
    </Card>
  );
}
