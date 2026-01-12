'use client';

import { useId } from 'react';

export interface HelpSearchProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onSearch: (query: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * HelpSearch component
 * Search input to filter help topics
 * Requirements: 5.3
 */
export function HelpSearch({
  value,
  onSearch,
  placeholder = 'Tìm kiếm...',
}: HelpSearchProps): JSX.Element {
  const inputId = useId();

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-5 w-5 text-secondary-400" />
      </div>

      {/* Search Input */}
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-secondary-300 bg-white py-2.5 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label="Tìm kiếm hướng dẫn"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onSearch('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
          aria-label="Xóa tìm kiếm"
        >
          <ClearIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Search icon SVG
 */
function SearchIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

/**
 * Clear/X icon SVG
 */
function ClearIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
