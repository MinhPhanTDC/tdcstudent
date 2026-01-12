'use client';

import { useState, useMemo } from 'react';
import { Modal, Button, Input, Checkbox, Spinner, EmptyState } from '@tdc/ui';
import type { Course, MajorCourse } from '@tdc/schemas';

export interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  existingMajorCourses: MajorCourse[];
  onAddCourse: (courseId: string, isRequired: boolean) => Promise<void>;
  isLoading?: boolean;
  isAdding?: boolean;
}

/**
 * AddCourseModal component - modal to select and add course to major
 * Requirements: 2.1, 2.7
 */
export function AddCourseModal({
  isOpen,
  onClose,
  courses,
  existingMajorCourses,
  onAddCourse,
  isLoading = false,
  isAdding = false,
}: AddCourseModalProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isRequired, setIsRequired] = useState(true);

  // Get IDs of courses already in the major
  const existingCourseIds = useMemo(
    () => new Set(existingMajorCourses.map((mc) => mc.courseId)),
    [existingMajorCourses]
  );

  // Filter available courses (not already in major)
  const availableCourses = useMemo(() => {
    return courses.filter((course) => {
      // Exclude courses already in major
      if (existingCourseIds.has(course.id)) {
        return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          course.title.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [courses, existingCourseIds, searchQuery]);

  const handleAdd = async (): Promise<void> => {
    if (!selectedCourseId) return;

    await onAddCourse(selectedCourseId, isRequired);

    // Reset state
    setSelectedCourseId(null);
    setIsRequired(true);
    setSearchQuery('');
    onClose();
  };

  const handleClose = (): void => {
    setSelectedCourseId(null);
    setIsRequired(true);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm môn học vào chuyên ngành"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Hủy
          </Button>
          <Button onClick={handleAdd} disabled={!selectedCourseId || isAdding}>
            {isAdding ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Đang thêm...
              </>
            ) : (
              'Thêm môn học'
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search input */}
        <Input
          placeholder="Tìm kiếm môn học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Course list */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-secondary-200">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner />
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={searchQuery ? 'Không tìm thấy môn học' : 'Không có môn học khả dụng'}
                description={
                  searchQuery
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : 'Tất cả môn học đã được thêm vào chuyên ngành này'
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {availableCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full p-3 text-left transition-colors ${
                    selectedCourseId === course.id
                      ? 'bg-primary-50'
                      : 'hover:bg-secondary-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        selectedCourseId === course.id
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-secondary-300'
                      }`}
                    >
                      {selectedCourseId === course.id && (
                        <svg
                          className="h-full w-full text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-secondary-900 line-clamp-1">
                        {course.title}
                      </h4>
                      {course.description && (
                        <p className="mt-0.5 text-sm text-secondary-500 line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Required checkbox */}
        {selectedCourseId && (
          <div className="flex items-start gap-3 rounded-lg bg-secondary-50 p-3">
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <div>
              <label htmlFor="isRequired" className="text-sm font-medium text-secondary-700">
                Môn học bắt buộc
              </label>
              <p className="text-xs text-secondary-500">
                Học viên phải hoàn thành môn học này để tốt nghiệp chuyên ngành
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
