'use client';

import Link from 'next/link';
import { Card, Avatar, Badge, Button } from '@tdc/ui';
import type { Student } from '@tdc/schemas';

interface StudentCardProps {
  student: Student;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

/**
 * Card component displaying student information
 * Shows active/inactive status and activate/deactivate action
 * Requirements: 3.6, 3.7
 */
export function StudentCard({ student, onDelete, onToggleActive }: StudentCardProps): JSX.Element {
  const averageProgress =
    Object.keys(student.progress).length > 0
      ? Math.round(
          Object.values(student.progress).reduce((a, b) => a + b, 0) /
            Object.keys(student.progress).length
        )
      : 0;

  const handleToggleActive = (): void => {
    if (student.isActive) {
      if (confirm('Bạn có chắc muốn vô hiệu hóa học viên này?')) {
        onToggleActive?.(student.id, false);
      }
    } else {
      if (confirm('Bạn có chắc muốn kích hoạt lại học viên này?')) {
        onToggleActive?.(student.id, true);
      }
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-start gap-4">
        <Avatar name={student.displayName} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-secondary-900">{student.displayName}</h3>
          <p className="truncate text-sm text-secondary-500">{student.email}</p>
          <p className="text-sm text-secondary-500">
            {student.enrolledCourses.length} khóa học đã đăng ký
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={student.isActive ? 'success' : 'danger'}>
            {student.isActive ? 'Hoạt động' : 'Vô hiệu'}
          </Badge>
          <Badge
            variant={
              averageProgress >= 80 ? 'success' : averageProgress >= 50 ? 'warning' : 'default'
            }
          >
            {averageProgress}%
          </Badge>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-secondary-500">Tiến độ trung bình</span>
          <span className="font-medium text-secondary-900">{averageProgress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${averageProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/students/${student.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Chi tiết
          </Button>
        </Link>
        {onToggleActive && (
          <Button
            variant={student.isActive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleToggleActive}
          >
            {student.isActive ? 'Vô hiệu' : 'Kích hoạt'}
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(student.id)}>
            Xóa
          </Button>
        )}
      </div>
    </Card>
  );
}
