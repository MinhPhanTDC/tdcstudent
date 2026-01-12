'use client';

import { Select } from '@tdc/ui';
import { useSemesters } from '@/hooks/useSemesters';

export interface StudentFiltersValue {
  isActive?: boolean;
  currentSemesterId?: string;
}

interface StudentFiltersProps {
  value: StudentFiltersValue;
  onChange: (value: StudentFiltersValue) => void;
}

/**
 * Filter component for student list
 * Filters by active status and current semester
 * Requirements: 3.9
 */
export function StudentFilters({ value, onChange }: StudentFiltersProps): JSX.Element {
  const { data: semesters = [] } = useSemesters();

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Đã vô hiệu' },
  ];

  const semesterOptions = [
    { value: '', label: 'Tất cả học kỳ' },
    ...semesters.map((semester) => ({
      value: semester.id,
      label: semester.name,
    })),
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const statusValue = e.target.value;
    onChange({
      ...value,
      isActive: statusValue === '' ? undefined : statusValue === 'active',
    });
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange({
      ...value,
      currentSemesterId: e.target.value || undefined,
    });
  };

  const getStatusValue = (): string => {
    if (value.isActive === undefined) return '';
    return value.isActive ? 'active' : 'inactive';
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-48">
        <Select
          options={statusOptions}
          value={getStatusValue()}
          onChange={handleStatusChange}
          label="Trạng thái"
        />
      </div>
      <div className="w-48">
        <Select
          options={semesterOptions}
          value={value.currentSemesterId || ''}
          onChange={handleSemesterChange}
          label="Học kỳ"
        />
      </div>
    </div>
  );
}
