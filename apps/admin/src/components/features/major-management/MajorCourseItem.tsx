'use client';

import { Badge, Button, Spinner } from '@tdc/ui';
import type { MajorCourse, Course } from '@tdc/schemas';

export interface MajorCourseItemProps {
  majorCourse: MajorCourse;
  course?: Course;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleRequired?: () => void;
  onRemove?: () => void;
  isReordering?: boolean;
  isToggling?: boolean;
  isRemoving?: boolean;
  /** Whether drag handle should be shown */
  showDragHandle?: boolean;
  /** Drag handle props for dnd-kit */
  dragHandleProps?: Record<string, unknown>;
}

/**
 * MajorCourseItem component - displays course with drag handle, required toggle, remove button
 * Requirements: 2.2, 2.4
 */
export function MajorCourseItem({
  majorCourse,
  course,
  isFirst = false,
  isLast = false,
  onMoveUp,
  onMoveDown,
  onToggleRequired,
  onRemove,
  isReordering = false,
  isToggling = false,
  isRemoving = false,
  showDragHandle = true,
  dragHandleProps,
}: MajorCourseItemProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-secondary-200 bg-white p-3">
      {/* Drag handle or reorder buttons */}
      {showDragHandle && (
        <div className="flex flex-col gap-1">
          {dragHandleProps ? (
            <button
              type="button"
              className="cursor-grab rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 active:cursor-grabbing"
              aria-label="Kéo để sắp xếp"
              {...dragHandleProps}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Course info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-secondary-400">
            #{majorCourse.order + 1}
          </span>
          <h4 className="font-medium text-secondary-900 line-clamp-1">
            {course?.title || 'Đang tải...'}
          </h4>
          <Badge variant={majorCourse.isRequired ? 'primary' : 'default'}>
            {majorCourse.isRequired ? 'Bắt buộc' : 'Tự chọn'}
          </Badge>
        </div>
        {course?.description && (
          <p className="mt-1 line-clamp-1 text-sm text-secondary-500">
            {course.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onToggleRequired && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRequired}
            disabled={isToggling}
          >
            {isToggling ? (
              <Spinner size="sm" />
            ) : majorCourse.isRequired ? (
              'Đặt tự chọn'
            ) : (
              'Đặt bắt buộc'
            )}
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700"
          >
            {isRemoving ? <Spinner size="sm" /> : 'Xóa'}
          </Button>
        )}
      </div>
    </div>
  );
}
