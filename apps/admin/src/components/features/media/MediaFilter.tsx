'use client';

import { Input } from '@tdc/ui';
import type { MediaFilter as MediaFilterType, MediaCategory, MediaType } from '@tdc/schemas';

interface MediaFilterProps {
  value: MediaFilterType;
  onChange: (filter: MediaFilterType) => void;
}

const TYPE_OPTIONS: { value: MediaType | ''; label: string }[] = [
  { value: '', label: 'Tất cả loại' },
  { value: 'image', label: 'Hình ảnh' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Tài liệu' },
  { value: 'other', label: 'Khác' },
];

const CATEGORY_OPTIONS: { value: MediaCategory | ''; label: string }[] = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'login-background', label: 'Ảnh nền đăng nhập' },
  { value: 'general', label: 'Chung' },
  { value: 'course', label: 'Khóa học' },
  { value: 'handbook', label: 'Sổ tay' },
];

/**
 * MediaFilter component - filter controls for media library
 */
export function MediaFilter({ value, onChange }: MediaFilterProps): JSX.Element {
  const handleSearchChange = (search: string): void => {
    onChange({ ...value, search: search || undefined });
  };

  const handleTypeChange = (type: string): void => {
    onChange({ ...value, type: type ? (type as MediaType) : undefined });
  };

  const handleCategoryChange = (category: string): void => {
    onChange({ ...value, category: category ? (category as MediaCategory) : undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Tìm kiếm file..."
          value={value.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <select
        className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        value={value.type || ''}
        onChange={(e) => handleTypeChange(e.target.value)}
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        value={value.category || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
