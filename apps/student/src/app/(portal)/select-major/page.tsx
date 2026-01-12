'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, EmptyState, useToast } from '@tdc/ui';
import {
  useMajorsForSelection,
  useSelectMajor,
  useCheckMajorRequired,
  useMajorCoursesWithDetails,
} from '@/hooks/useSelectMajor';
import { MajorSelectionList } from '@/components/features/major/MajorSelectionList';
import { MajorCoursePreview } from '@/components/features/major/MajorCoursePreview';
import { MajorConfirmModal } from '@/components/features/major/MajorConfirmModal';

/**
 * Select Major page - allows students to select their major
 * Requirements: 4.1, 4.2, 4.4, 4.5, 4.7
 */
export default function SelectMajorPage(): JSX.Element {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();

  // State
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(null);
  const [previewMajorId, setPreviewMajorId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Queries
  const { data: majors, isLoading: majorsLoading, error: majorsError } = useMajorsForSelection();
  const { data: majorRequired, isLoading: checkLoading } = useCheckMajorRequired();
  const selectMajorMutation = useSelectMajor();

  // Get selected major for confirmation
  const selectedMajor = majors?.find((m) => m.id === selectedMajorId) || null;

  // Handle view details
  const handleViewDetails = (majorId: string): void => {
    setPreviewMajorId(previewMajorId === majorId ? null : majorId);
  };

  // Handle select major (opens confirmation)
  const handleSelect = (majorId: string): void => {
    setSelectedMajorId(majorId);
    setIsConfirmOpen(true);
  };

  // Handle confirm selection
  const handleConfirm = async (): Promise<void> => {
    if (!selectedMajorId) return;

    try {
      await selectMajorMutation.mutateAsync(selectedMajorId);
      showSuccess('Chọn chuyên ngành thành công!');
      setIsConfirmOpen(false);
      // Redirect to dashboard (Requirements: 4.7)
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi chọn chuyên ngành';
      showError(message);
    }
  };

  // Handle close confirmation
  const handleCloseConfirm = (): void => {
    if (!selectMajorMutation.isPending) {
      setIsConfirmOpen(false);
      setSelectedMajorId(null);
    }
  };

  // Loading state
  if (majorsLoading || checkLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <MajorSelectionList
          majors={[]}
          isLoading={true}
          onViewDetails={() => {}}
          onSelect={() => {}}
        />
      </div>
    );
  }

  // Already selected major (Requirements: 4.6)
  if (majorRequired?.hasSelectedMajor) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="Bạn đã chọn chuyên ngành"
            description="Bạn đã chọn chuyên ngành và không thể thay đổi. Hãy xem tiến độ học tập của bạn."
            action={
              <Button variant="primary" onClick={() => router.push('/my-major')}>
                Xem chuyên ngành của tôi
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Error state
  if (majorsError) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
            title="Không thể tải danh sách chuyên ngành"
            description="Đã xảy ra lỗi khi tải danh sách chuyên ngành. Vui lòng thử lại sau."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <svg
          className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="font-medium text-blue-800">Hướng dẫn chọn chuyên ngành</h4>
          <p className="mt-1 text-sm text-blue-700">
            Hãy xem kỹ danh sách môn học của từng chuyên ngành trước khi quyết định.
            Sau khi chọn, bạn sẽ không thể thay đổi chuyên ngành.
          </p>
        </div>
      </div>

      {/* Major selection list */}
      <MajorSelectionList
        majors={majors || []}
        isLoading={false}
        onViewDetails={handleViewDetails}
        onSelect={handleSelect}
        selectedMajorId={selectedMajorId}
      />

      {/* Course preview panel */}
      {previewMajorId && (
        <MajorCoursePreviewPanel
          majorId={previewMajorId}
          majorName={majors?.find((m) => m.id === previewMajorId)?.name}
          onClose={() => setPreviewMajorId(null)}
        />
      )}

      {/* Confirmation modal */}
      <MajorConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
        major={selectedMajor}
        isLoading={selectMajorMutation.isPending}
      />
    </div>
  );
}

/**
 * Page header component
 */
function PageHeader(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Chọn chuyên ngành</h1>
      <p className="mt-1 text-secondary-500">
        Chọn chuyên ngành phù hợp với định hướng nghề nghiệp của bạn
      </p>
    </div>
  );
}

/**
 * Course preview panel component
 */
interface MajorCoursePreviewPanelProps {
  majorId: string;
  majorName?: string;
  onClose: () => void;
}

function MajorCoursePreviewPanel({
  majorId,
  majorName,
  onClose,
}: MajorCoursePreviewPanelProps): JSX.Element {
  const { data: coursesData, isLoading } = useMajorCoursesWithDetails(majorId);

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">
            Chi tiết chuyên ngành
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary-100 transition-colors"
            aria-label="Đóng"
          >
            <svg
              className="h-5 w-5 text-secondary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Course preview */}
        <MajorCoursePreview
          courses={coursesData || []}
          isLoading={isLoading}
          majorName={majorName}
        />
      </div>
    </Card>
  );
}

