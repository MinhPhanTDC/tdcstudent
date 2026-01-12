'use client';

import { useState, useCallback } from 'react';
import { Button, Modal, Spinner } from '@tdc/ui';
import type { LabRequirement, CreateLabRequirementInput } from '@tdc/schemas';
import { RequirementManager, RequirementForm } from '@/components/features/lab-settings';
import { VerificationQueue } from '@/components/features/lab-settings/VerificationQueue';
import { HandbookUpload } from '@/components/features/handbook';
import {
  useLabRequirementsAdmin,
  useCreateLabRequirement,
  useUpdateLabRequirement,
  useDeleteLabRequirement,
  useToggleLabRequirementActive,
  useReorderLabRequirements,
} from '@/hooks/useLabRequirementsAdmin';
import { useHandbook, useUploadHandbook } from '@/hooks/useHandbook';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Lab Settings page - Admin management of lab training requirements
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3, 7.4
 */
export default function LabSettingsPage(): JSX.Element {
  // Auth context for user ID
  const { user } = useAuth();

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<LabRequirement | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Data fetching
  const { data: requirements = [], isLoading, error } = useLabRequirementsAdmin();

  // Handbook data and mutations
  const { data: handbook, isLoading: isHandbookLoading } = useHandbook();
  const uploadHandbookMutation = useUploadHandbook();

  // Mutations
  const createMutation = useCreateLabRequirement();
  const updateMutation = useUpdateLabRequirement();
  const deleteMutation = useDeleteLabRequirement();
  const toggleActiveMutation = useToggleLabRequirementActive();
  const reorderMutation = useReorderLabRequirements();

  // Handlers
  const handleOpenCreateModal = useCallback(() => {
    setEditingRequirement(undefined);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((requirement: LabRequirement) => {
    setEditingRequirement(requirement);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingRequirement(undefined);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateLabRequirementInput) => {
      if (editingRequirement) {
        // Update existing requirement
        const result = await updateMutation.mutateAsync({
          id: editingRequirement.id,
          data,
        });
        if (result.success) {
          handleCloseFormModal();
        }
      } else {
        // Create new requirement
        const result = await createMutation.mutateAsync(data);
        if (result.success) {
          handleCloseFormModal();
        }
      }
    },
    [editingRequirement, createMutation, updateMutation, handleCloseFormModal]
  );


  const handleToggleActive = useCallback(
    (id: string) => {
      toggleActiveMutation.mutate(id);
    },
    [toggleActiveMutation]
  );

  const handleReorder = useCallback(
    (requirementIds: string[]) => {
      reorderMutation.mutate(requirementIds);
    },
    [reorderMutation]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirmId) {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, deleteMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  // Handbook upload handler
  const handleHandbookUpload = useCallback(
    async (file: File) => {
      if (!user?.id) return;
      await uploadHandbookMutation.mutateAsync({
        file,
        uploadedBy: user.id,
      });
    },
    [user?.id, uploadHandbookMutation]
  );

  // Calculate next order for new requirements
  const nextOrder = requirements.length > 0 
    ? Math.max(...requirements.map(r => r.order)) + 1 
    : 0;

  // Get form error message
  const formError = editingRequirement
    ? updateMutation.error?.message
    : createMutation.error?.message;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">Không thể tải danh sách yêu cầu.</p>
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Cài đặt Lab Training</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Quản lý các yêu cầu mà học viên cần hoàn thành trước khi vào Lab
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm yêu cầu
        </Button>
      </div>

      {/* Requirements list with drag-drop */}
      <div className="rounded-lg border border-secondary-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">
            Danh sách yêu cầu ({requirements.length})
          </h2>
          <p className="text-sm text-secondary-500">
            Kéo thả để sắp xếp thứ tự hiển thị
          </p>
        </div>
        <RequirementManager
          requirements={requirements}
          onReorder={handleReorder}
          onToggleActive={handleToggleActive}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteClick}
          isReordering={reorderMutation.isPending}
        />
      </div>

      {/* Verification Queue Section */}
      <div className="rounded-lg border border-secondary-200 bg-white p-6">
        <VerificationQueue />
      </div>

      {/* Handbook Upload Section */}
      <div className="rounded-lg border border-secondary-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">
            Sổ tay học viên
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Upload file PDF sổ tay để hiển thị dạng flipbook trên trang đăng nhập
          </p>
        </div>
        {isHandbookLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <HandbookUpload
            currentHandbook={handbook}
            onUpload={handleHandbookUpload}
            isUploading={uploadHandbookMutation.isPending}
            error={
              uploadHandbookMutation.data && !uploadHandbookMutation.data.success
                ? uploadHandbookMutation.data.error.message
                : null
            }
          />
        )}
      </div>


      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingRequirement ? 'Chỉnh sửa yêu cầu' : 'Thêm yêu cầu mới'}
        size="lg"
      >
        <RequirementForm
          requirement={editingRequirement}
          defaultOrder={nextOrder}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={formError}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={handleCancelDelete}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Bạn có chắc chắn muốn xóa yêu cầu này? Tất cả tiến độ của học viên liên quan đến yêu cầu này cũng sẽ bị xóa.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
