'use client';

import { useState } from 'react';
import { Card, Spinner } from '@tdc/ui';
import { useLabRequirements } from '@/hooks/useLabRequirements';
import { useStudentLabProgress } from '@/hooks/useStudentLabProgress';
import {
  LabProgressBar,
  RequirementList,
} from '@/components/features/lab-training';

/**
 * Lab Training page - displays checklist of requirements for students
 * Requirements: 1.1, 1.2, 1.3
 */
export default function LabTrainingPage(): JSX.Element {
  const [loadingRequirementId, setLoadingRequirementId] = useState<string | null>(null);
  
  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    error: requirementsError,
  } = useLabRequirements();

  const {
    progress,
    isLoading: isLoadingProgress,
    markComplete,
  } = useStudentLabProgress();

  const isLoading = isLoadingRequirements || isLoadingProgress;

  // Calculate completed count
  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const totalCount = requirements?.length || 0;

  const handleMarkComplete = async (requirementId: string): Promise<void> => {
    setLoadingRequirementId(requirementId);
    try {
      await markComplete({ requirementId });
    } catch (error) {
      console.error('Failed to mark requirement as complete:', error);
    } finally {
      setLoadingRequirementId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (requirementsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-red-700">
          Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Lab Training</h1>
        <p className="mt-1 text-secondary-500">
          Hoàn thành các yêu cầu dưới đây trước khi bắt đầu giai đoạn Lab.
        </p>
      </div>

      {/* Progress bar - Requirement 1.3 */}
      <Card className="p-4">
        <LabProgressBar completed={completedCount} total={totalCount} />
      </Card>

      {/* Requirements list - Requirements 1.1, 1.2 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-secondary-900">
          Danh sách yêu cầu
        </h2>
        <RequirementList
          requirements={requirements || []}
          progress={progress}
          onMarkComplete={handleMarkComplete}
          loadingRequirementId={loadingRequirementId}
        />
      </div>
    </div>
  );
}
