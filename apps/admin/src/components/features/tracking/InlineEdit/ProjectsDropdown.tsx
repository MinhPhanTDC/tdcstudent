'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@tdc/ui';

export interface ProjectsDropdownProps {
  /** Current value of submitted projects */
  value: number;
  /** Maximum allowed projects (requiredProjects) */
  maxValue: number;
  /** Callback when value changes - triggers auto-save */
  onChange: (value: number) => void;
  /** Callback when dropdown should close */
  onClose: () => void;
  /** Whether the dropdown is currently saving */
  isSaving?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional class name */
  className?: string;
}

/**
 * Inline dropdown for editing project count
 * Requirements: 2.2, 2.3, 2.5
 * 
 * Features:
 * - Dropdown with values 0 to requiredProjects
 * - Auto-save on selection
 * - Validation feedback
 */
export function ProjectsDropdown({
  value,
  maxValue,
  onChange,
  onClose,
  isSaving = false,
  error = null,
  className,
}: ProjectsDropdownProps): JSX.Element {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Generate options from 0 to maxValue
  const options = Array.from({ length: maxValue + 1 }, (_, i) => i);

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  /**
   * Handle escape key to close dropdown
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  /**
   * Focus select on mount
   */
  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  /**
   * Handle selection change - auto-save
   * Requirements: 2.3
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = parseInt(event.target.value, 10);
      if (!isNaN(newValue) && newValue >= 0 && newValue <= maxValue) {
        onChange(newValue);
      }
    },
    [onChange, maxValue]
  );

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute z-10 rounded-md border border-secondary-200 bg-white p-2 shadow-lg',
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-secondary-600">
          Số dự án đã nộp
        </label>
        
        <select
          ref={selectRef}
          value={value}
          onChange={handleChange}
          disabled={isSaving}
          className={cn(
            'w-full rounded border px-3 py-1.5 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-secondary-300',
            isSaving && 'cursor-wait opacity-50'
          )}
          aria-label="Chọn số dự án đã nộp"
          aria-invalid={!!error}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt} / {maxValue}
            </option>
          ))}
        </select>

        {/* Error message - Requirements: 2.5 */}
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Saving indicator */}
        {isSaving && (
          <p className="text-xs text-secondary-500">
            Đang lưu...
          </p>
        )}

        {/* Helper text */}
        {!error && !isSaving && (
          <p className="text-xs text-secondary-400">
            Tối đa: {maxValue} dự án
          </p>
        )}
      </div>
    </div>
  );
}
