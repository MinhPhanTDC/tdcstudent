'use client';

import { Modal, Button, Spinner } from '@tdc/ui';
import { useSemesterHasCourses } from '@/hooks/useSemesters';
import { useCoursesBySemester } from '@/hooks/useCourses';
import type { Semester } from '@tdc/schemas';

export interface SemesterDeleteModalProps {
  semester: Semester | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * SemesterDeleteModal component - confirmation modal for deleting semesters
 * Shows which courses prevent deletion
 * Requirements: 1.5, 1.6, 7.4, 8.6
 */
export function SemesterDeleteModal({
  semester,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: SemesterDeleteModalProps): JSX.Element {
  const { data: hasCourses = false, isLoading: isCheckingCourses } = useSemesterHasCourses(
    semester?.id ?? ''
  );
  
  // Fetch courses to show which ones prevent deletion
  const { data: courses = [], isLoading: isLoadingCourses } = useCoursesBySemester(
    semester?.id ?? ''
  );

  if (!semester) {
    return <></>;
  }

  const isLoading = isCheckingCourses || isLoadingCourses;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Xác nhận xóa học kỳ">
      <div className="space-y-4">
        <p className="text-secondary-600">
          Bạn có chắc muốn xóa học kỳ <strong className="text-secondary-900">{semester.name}</strong>?
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-secondary-500">
            <Spinner size="sm" />
            <span>Đang kiểm tra...</span>
          </div>
        ) : hasCourses ? (
          <div className="rounded-lg bg-yellow-50 p-4 text-sm">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Không thể xóa học kỳ</p>
                <p className="mt-1 text-yellow-700">
                  Học kỳ này đang có {courses.length} môn học liên kết. Vui lòng xóa hoặc chuyển các môn học trước khi xóa học kỳ.
                </p>
                
                {/* List of courses preventing deletion */}
                {courses.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-yellow-800">Các môn học liên kết:</p>
                    <ul className="mt-1 list-inside list-disc text-yellow-700">
                      {courses.slice(0, 5).map((course) => (
                        <li key={course.id}>{course.title}</li>
                      ))}
                      {courses.length > 5 && (
                        <li className="text-yellow-600">
                          ... và {courses.length - 5} môn học khác
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-secondary-500">
            Hành động này không thể hoàn tác.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting || isLoading || hasCourses}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Đang xóa...
              </>
            ) : (
              'Xóa học kỳ'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
