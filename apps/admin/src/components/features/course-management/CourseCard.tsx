'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, Badge, Button, Spinner } from '@tdc/ui';
import type { Course, Semester } from '@tdc/schemas';

export interface CourseCardProps {
  course: Course;
  semester?: Semester;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  isReordering?: boolean;
  isToggling?: boolean;
  isDeleting?: boolean;
  showReorderControls?: boolean;
}

/**
 * CourseCard component - displays course info with semester badge
 * Requirements: 2.1
 */
export function CourseCard({
  course,
  semester,
  isFirst = false,
  isLast = false,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onToggleActive,
  isReordering = false,
  isToggling = false,
  isDeleting = false,
  showReorderControls = false,
}: CourseCardProps): JSX.Element {
  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Reorder buttons - only shown when showReorderControls is true */}
          {showReorderControls && (
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
          )}

          {/* Course thumbnail */}
          {course.thumbnailUrl && (
            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-secondary-100">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}

          {/* Course info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-secondary-900">{course.title}</h3>
              <Badge variant={course.isActive ? 'success' : 'warning'}>
                {course.isActive ? 'Đã xuất bản' : 'Bản nháp'}
              </Badge>
              {semester && (
                <Badge variant="primary">{semester.name}</Badge>
              )}
            </div>
            {course.description && (
              <p className="mt-1 line-clamp-1 text-sm text-secondary-500">
                {course.description}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-secondary-400">
              <span>{course.lessons.length} bài học</span>
              <span>{course.requiredSessions} buổi</span>
              <span>{course.requiredProjects} dự án</span>
              {course.geniallyUrl && (
                <a
                  href={course.geniallyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Genially
                </a>
              )}
            </div>
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
              ) : course.isActive ? (
                'Ẩn'
              ) : (
                'Xuất bản'
              )}
            </Button>
          )}
          {onEdit ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Chỉnh sửa
            </Button>
          ) : (
            <Link href={`/courses/${course.id}`}>
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
        </div>
      </div>
    </Card>
  );
}
