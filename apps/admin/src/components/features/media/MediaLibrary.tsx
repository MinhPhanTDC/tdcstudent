'use client';

import { useState } from 'react';
import { Button, Input } from '@tdc/ui';
import type { MediaFile, MediaFilter, MediaCategory } from '@tdc/schemas';
import { MediaGrid } from './MediaGrid';
import { MediaUploader } from './MediaUploader';
import { useMediaFiles } from '@/hooks/useMediaFiles';

const CATEGORY_OPTIONS: { value: MediaCategory | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'login-background', label: 'Ảnh nền đăng nhập' },
  { value: 'general', label: 'Chung' },
  { value: 'course', label: 'Khóa học' },
  { value: 'handbook', label: 'Sổ tay' },
];

/**
 * MediaLibrary component - main media management interface
 */
export function MediaLibrary(): JSX.Element {
  const [filter, setFilter] = useState<MediaFilter>({});
  const [showUploader, setShowUploader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('login-background');

  const { files, isLoading, refetch, deleteFile, toggleActive, uploadFile, isUploading } = useMediaFiles(filter);

  const handleSearch = (search: string): void => {
    setFilter((prev) => ({ ...prev, search: search || undefined }));
  };

  const handleCategoryFilter = (category: string): void => {
    setFilter((prev) => ({
      ...prev,
      category: category ? (category as MediaCategory) : undefined,
    }));
  };

  const handleUpload = async (uploadFiles: File[]): Promise<void> => {
    for (const file of uploadFiles) {
      await uploadFile(file, selectedCategory);
    }
    setShowUploader(false);
    refetch();
  };

  const handleDelete = async (file: MediaFile): Promise<void> => {
    if (confirm(`Bạn có chắc muốn xóa "${file.name}"?`)) {
      await deleteFile(file.id);
    }
  };

  const handleToggleActive = async (file: MediaFile): Promise<void> => {
    await toggleActive(file.id);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Tìm kiếm file..."
            value={filter.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <select
          className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={filter.category || ''}
          onChange={(e) => handleCategoryFilter(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button onClick={() => setShowUploader(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upload Media</h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-secondary-700">
                Danh mục
              </label>
              <select
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MediaCategory)}
              >
                {CATEGORY_OPTIONS.filter((opt) => opt.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <MediaUploader onUpload={handleUpload} isUploading={isUploading} />
          </div>
        </div>
      )}

      {/* Info for login backgrounds */}
      {filter.category === 'login-background' && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium">Ảnh nền trang đăng nhập</p>
          <p className="mt-1">
            Các ảnh được đánh dấu &quot;Active&quot; sẽ hiển thị ngẫu nhiên trên trang đăng nhập.
            Click vào ảnh để bật/tắt trạng thái active.
          </p>
        </div>
      )}

      {/* Media Grid */}
      <MediaGrid
        files={files}
        isLoading={isLoading}
        onDelete={handleDelete}
        onToggleActive={filter.category === 'login-background' ? handleToggleActive : undefined}
        showActiveStatus={filter.category === 'login-background'}
      />
    </div>
  );
}
