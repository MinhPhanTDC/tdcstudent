'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Select, type SelectOption } from '@tdc/ui';
import { useSemesters } from '@/hooks/useSemesters';

export interface CourseSemesterFilterProps {
  /** Current selected semester ID */
  value?: string;
  /** Callback when filter changes */
  onChange?: (semesterId: string | undefined) => void;
  /** Whether to persist filter in URL params */
  preserveInUrl?: boolean;
}

/**
 * CourseSemesterFilter component - dropdown to filter courses by semester
 * Requirements: 2.1, 8.5
 */
export function CourseSemesterFilter({
  value,
  onChange,
  preserveInUrl = true,
}: CourseSemesterFilterProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: semesters = [], isLoading } = useSemesters();

  // Get current value from URL if preserveInUrl is enabled
  const currentValue = preserveInUrl
    ? searchParams.get('semesterId') || value || ''
    : value || '';

  // Build options from semesters
  const options: SelectOption[] = semesters.map((semester) => ({
    value: semester.id,
    label: semester.name,
  }));

  // Handle filter change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value || undefined;

      // Call onChange callback if provided
      onChange?.(newValue);

      // Update URL params if preserveInUrl is enabled
      if (preserveInUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (newValue) {
          params.set('semesterId', newValue);
        } else {
          params.delete('semesterId');
        }
        router.push(`${pathname}?${params.toString()}`);
      }
    },
    [onChange, preserveInUrl, searchParams, pathname, router]
  );

  return (
    <div className="w-64">
      <Select
        label="Lọc theo học kỳ"
        placeholder="Tất cả học kỳ"
        options={options}
        value={currentValue}
        onChange={handleChange}
        disabled={isLoading}
      />
    </div>
  );
}
