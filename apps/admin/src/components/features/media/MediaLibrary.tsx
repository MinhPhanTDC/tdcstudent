'use client';

import { useState } from 'react';
import { Button, Input } from '@tdc/ui';
import type { MediaFile, MediaFilter, MediaCategory } from '@tdc/schemas';
import { MediaGrid } from './MediaGrid';
import { MediaUploader } from './MediaUploader';
import { useMediaFiles } from '@/hooks/useMediaFiles';

const CATEGORY_OPTIONS: { value: MediaCategory | ''; label: string; description: string }[] = [
  { value: '', label: 'Tất cả', description: 'Hiển thị tất cả file' },
  { value: 'login-background', label: 'Ảnh nền đăng nhập', description: 'Ảnh hiển thị trên trang login' },
  { value: 'general', label: 'Chung', description: 'File dùng chung' },
  { value: 'course', label: 'Khóa học', description: 'Ảnh và tài liệu khóa học' },
  { value: 'handbook', label: 'Sổ tay', description: 'File sổ tay học viên' },
];

/**
 * MediaLibrary component - main media management interface
 */
export function MediaLibrary(): JSX.Element {
  const [filter, setFilter] = useState<MediaFilter>({});
  const [showUploader, setShowUploader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('login-background');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { files, isLoading, error, refetch, deleteFile, toggleActive, uploadFile, isUploading } = useMediaFiles(filter);

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

  const currentCategory = CATEGORY_OPTIONS.find((opt) => opt.value === filter.category);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-secondary-200 bg-white p-4">
          <div className="text-sm text-secondary-600">Tổng số file</div>
          <div className="mt-1 text-2xl font-bold text-secondary-900">{files.length}</div>
        </div>
        <div className="rounded-lg border border-secondary-200 bg-white p-4">
          <div className="text-sm text-secondary-600">Dung lượng</div>
          <div className="mt-1 text-2xl font-bold text-secondary-900">{formatSize(totalSize)}</div>
        </div>
        <div className="rounded-lg border border-secondary-200 bg-white p-4">
          <div className="text-sm text-secondary-600">Danh mục</div>
          <div className="mt-1 text-2xl font-bold text-secondary-900">
            {currentCategory?.label || 'Tất cả'}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Tìm kiếm file..."
            value={filter.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
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

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-secondary-300">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm ${
              viewMode === 'grid'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
            title="Grid view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
            title="List view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <Button onClick={() => setShowUploader(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">Lỗi</h4>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
                    {opt.label} - {opt.description}
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
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Ảnh nền trang đăng nhập</p>
              <p className="mt-1 text-sm text-blue-700">
                Các ảnh được đánh dấu &quot;Active&quot; sẽ hiển thị ngẫu nhiên trên trang đăng nhập.
                Click vào ảnh để bật/tắt trạng thái active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <MediaGrid
        files={files}
        isLoading={isLoading}
        onDelete={handleDelete}
        onToggleActive={filter.category === 'login-background' ? handleToggleActive : undefined}
        showActiveStatus={filter.category === 'login-background'}
        viewMode={viewMode}
      />
    </div>
  );
}
