'use client';

import { useState, useEffect, useCallback } from 'react';
import { Select, Input } from '@tdc/ui';
import { useSemesters } from '@/hooks/useSemesters';
import { useCourses } from '@/hooks/useCourses';
import type { Semester, Course } from '@tdc/schemas';

export interface TrackingFiltersProps {
  /** Selected semester ID */
  semesterId: string | null;
  /** Selected course ID */
  courseId: string | null;
  /** Search term */
  search: string;
  /** Callback when semester changes */
  onSemesterChange: (semesterId: string | null) => void;
  /** Callback when course changes */
  onCourseChange: (courseId: string | null) => void;
  /** Callback when search changes */
  onSearchChange: (search: string) => void;
}

/**
 * Tracking filters component with semester, course dropdowns and search input
 * Requirements: 1.3, 1.4, 1.5
 */
export function TrackingFilters({
  semesterId,
  courseId,
  search,
  onSemesterChange,
  onCourseChange,
  onSearchChange,
}: TrackingFiltersProps): JSX.Element {
  const { data: semesters = [] } = useSemesters();
  const { data: allCourses = [] } = useCourses();

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(search);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input - Requirements: 1.5
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  // Filter courses by selected semester - Requirements: 1.4
  const filteredCourses = semesterId
    ? allCourses.filter((course) => course.semesterId === semesterId)
    : allCourses;

  // Build semester options
  const semesterOptions = [
    { value: '', label: 'Tất cả học kỳ' },
    ...semesters.map((semester: Semester) => ({
      value: semester.id,
      label: semester.name,
    })),
  ];

  // Build course options (filtered by semester)
  const courseOptions = [
    { value: '', label: 'Tất cả môn học' },
    ...filteredCourses.map((course: Course) => ({
      value: course.id,
      label: course.title,
    })),
  ];

  const handleSemesterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || null;
      onSemesterChange(value);
    },
    [onSemesterChange]
  );

  const handleCourseChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || null;
      onCourseChange(value);
    },
    [onCourseChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
    },
    []
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      {/* Semester filter - Requirements: 1.3 */}
      <div className="w-full sm:w-48">
        <Select
          options={semesterOptions}
          value={semesterId || ''}
          onChange={handleSemesterChange}
          label="Học kỳ"
        />
      </div>

      {/* Course filter - Requirements: 1.4 */}
      <div className="w-full sm:w-56">
        <Select
          options={courseOptions}
          value={courseId || ''}
          onChange={handleCourseChange}
          label="Môn học"
        />
      </div>

      {/* Search input with debounce - Requirements: 1.5 */}
      <div className="w-full sm:w-64">
        <Input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={localSearch}
          onChange={handleSearchChange}
          label="Tìm kiếm"
        />
      </div>
    </div>
  );
}
