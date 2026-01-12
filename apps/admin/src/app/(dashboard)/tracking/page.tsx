'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@tdc/ui';
import { useAuth } from '@/contexts/AuthContext';
import { TrackingTable } from '@/components/features/tracking/TrackingTable';
import { TrackingFilters } from '@/components/features/tracking/TrackingFilters';
import { TrackingPagination } from '@/components/features/tracking/TrackingPagination';
import {
  QuickTrackTable,
  QuickTrackActions,
  BulkPassModal,
  BulkPassReport,
} from '@/components/features/tracking/QuickTrack';
import { RejectModal } from '@/components/features/tracking/StatusActions/RejectModal';
import {
  useTracking,
  usePendingApproval,
  useApproveProgress,
  useRejectProgress,
  type TrackingData,
} from '@/hooks/useTracking';
import { useTrackingFilters, type TrackingTab } from '@/hooks/useTrackingFilters';
import { useBulkPass } from '@/hooks/useBulkPass';

/**
 * Tab button component for switching between Tracking and Quick Track
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-b-2 border-primary-600 text-primary-600'
          : 'text-secondary-600 hover:text-secondary-900'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Tracking page with tab navigation
 * Requirements: 1.1, 4.1
 */
export default function TrackingPage(): JSX.Element {
  const { user } = useAuth();
  const adminId = user?.id || '';

  // Filter and pagination state - preserved across tab switches (Requirement 10.4)
  const {
    activeTab,
    switchTab,
    filters,
    setSemesterId,
    setCourseId,
    setSearch,
    pagination,
    setPage,
    setLimit,
    setSort,
    trackingFilters,
    trackingPagination,
  } = useTrackingFilters();

  // Tracking data for main table
  const {
    data: trackingData,
    isLoading: isTrackingLoading,
  } = useTracking(trackingFilters, trackingPagination);

  // Pending approval data for Quick Track
  const {
    data: pendingData = [],
    isLoading: isPendingLoading,
  } = usePendingApproval(filters.courseId || undefined);

  // Bulk pass hook
  const bulkPass = useBulkPass(adminId);

  // Update available IDs when pending data changes
  useEffect(() => {
    if (pendingData) {
      bulkPass.updateAvailableIds(pendingData.map((item) => item.progressId));
    }
  }, [pendingData, bulkPass]);

  // Approve/Reject mutations
  const approveMutation = useApproveProgress();
  const rejectMutation = useRejectProgress();

  // Modal states
  const [bulkPassModalOpen, setBulkPassModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedForReject, setSelectedForReject] = useState<TrackingData | null>(null);

  // Handle tab switch
  const handleTabSwitch = useCallback((tab: TrackingTab) => {
    switchTab(tab);
  }, [switchTab]);

  // Handle sort change
  const handleSort = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSort(key, direction);
  }, [setSort]);

  // Handle approve action
  const handleApprove = useCallback(async (item: TrackingData) => {
    await approveMutation.mutateAsync({
      progressId: item.progressId,
      adminId,
    });
  }, [approveMutation, adminId]);

  // Handle reject action - open modal
  const handleRejectClick = useCallback((item: TrackingData) => {
    setSelectedForReject(item);
    setRejectModalOpen(true);
  }, []);

  // Handle reject submit
  const handleRejectSubmit = useCallback(async (reason: string) => {
    if (!selectedForReject) return;

    await rejectMutation.mutateAsync({
      progressId: selectedForReject.progressId,
      reason,
      adminId,
    });
  }, [selectedForReject, rejectMutation, adminId]);

  // Handle reject modal close
  const handleRejectClose = useCallback(() => {
    setRejectModalOpen(false);
    setSelectedForReject(null);
  }, []);

  // Handle selection change in Quick Track
  const handleSelectionChange = useCallback((progressId: string, selected: boolean) => {
    if (selected) {
      bulkPass.select(progressId);
    } else {
      bulkPass.deselect(progressId);
    }
  }, [bulkPass]);

  // Handle bulk pass click - open confirmation modal
  const handlePassSelectedClick = useCallback(() => {
    setBulkPassModalOpen(true);
  }, []);

  // Handle bulk pass confirm
  const handleBulkPassConfirm = useCallback(async () => {
    await bulkPass.executeBulkPass();
    setBulkPassModalOpen(false);
  }, [bulkPass]);

  // Handle bulk pass cancel
  const handleBulkPassCancel = useCallback(() => {
    if (!bulkPass.isProcessing) {
      setBulkPassModalOpen(false);
    }
  }, [bulkPass.isProcessing]);

  // Handle report close
  const handleReportClose = useCallback(() => {
    bulkPass.clearResult();
  }, [bulkPass]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Tracking</h1>
      </div>

      {/* Tab navigation - Requirements: 1.1, 4.1 */}
      <div className="border-b border-secondary-200">
        <div className="flex gap-4">
          <TabButton
            active={activeTab === 'tracking'}
            onClick={() => handleTabSwitch('tracking')}
          >
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Tracking
            </span>
          </TabButton>
          <TabButton
            active={activeTab === 'quickTrack'}
            onClick={() => handleTabSwitch('quickTrack')}
          >
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Quick Track
              {pendingData.length > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  {pendingData.length}
                </span>
              )}
            </span>
          </TabButton>
        </div>
      </div>

      {/* Filters - shared between tabs (Requirement 10.4) */}
      <Card>
        <TrackingFilters
          semesterId={filters.semesterId}
          courseId={filters.courseId}
          search={filters.search}
          onSemesterChange={setSemesterId}
          onCourseChange={setCourseId}
          onSearchChange={setSearch}
        />
      </Card>

      {/* Tab content */}
      {activeTab === 'tracking' ? (
        /* Tracking Table Tab - Requirements: 1.1 */
        <div className="space-y-4">
          <TrackingTable
            data={trackingData?.items || []}
            isLoading={isTrackingLoading}
            sortKey={pagination.sortBy}
            sortDirection={pagination.sortOrder}
            onSort={handleSort}
            onApprove={handleApprove}
            onReject={handleRejectClick}
          />

          {/* Pagination - Requirements: 1.6 */}
          {trackingData && (
            <TrackingPagination
              page={trackingData.pagination.page}
              limit={trackingData.pagination.limit}
              total={trackingData.pagination.total}
              totalPages={trackingData.pagination.totalPages}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      ) : (
        /* Quick Track Tab - Requirements: 4.1 */
        <div className="space-y-4">
          {/* Quick Track Actions - Requirements: 4.3, 4.4 */}
          <QuickTrackActions
            selectedCount={bulkPass.selectedCount}
            totalCount={pendingData.length}
            isAllSelected={bulkPass.isAllSelected}
            isSomeSelected={bulkPass.isSomeSelected}
            onSelectAll={bulkPass.selectAll}
            onDeselectAll={bulkPass.deselectAll}
            onPassSelected={handlePassSelectedClick}
            isProcessing={bulkPass.isProcessing}
          />

          {/* Quick Track Table - Requirements: 4.1, 4.2 */}
          <QuickTrackTable
            data={pendingData}
            isLoading={isPendingLoading}
            selectedIds={bulkPass.selectedIds}
            onSelectionChange={handleSelectionChange}
            isSelected={bulkPass.isSelected}
          />
        </div>
      )}

      {/* Reject Modal - Requirements: 3.4, 3.5 */}
      <RejectModal
        isOpen={rejectModalOpen}
        studentName={selectedForReject?.studentName || ''}
        courseName={selectedForReject?.courseName || ''}
        onClose={handleRejectClose}
        onReject={handleRejectSubmit}
      />

      {/* Bulk Pass Confirmation Modal - Requirements: 4.4, 4.5 */}
      <BulkPassModal
        isOpen={bulkPassModalOpen}
        selectedCount={bulkPass.selectedCount}
        onConfirm={handleBulkPassConfirm}
        onCancel={handleBulkPassCancel}
        isProcessing={bulkPass.isProcessing}
        progress={bulkPass.progress}
        total={bulkPass.total}
      />

      {/* Bulk Pass Report Modal - Requirements: 4.6, 4.7, 9.2 */}
      <BulkPassReport
        isOpen={bulkPass.result !== null}
        result={bulkPass.result}
        onClose={handleReportClose}
      />
    </div>
  );
}
