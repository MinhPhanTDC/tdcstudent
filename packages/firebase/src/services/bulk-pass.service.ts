import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import { type StudentProgress } from '@tdc/schemas';
import { progressRepository } from '../repositories/progress.repository';
import { trackingLogRepository } from '../repositories/tracking-log.repository';
import { courseRepository } from '../repositories/course.repository';
import { unlockService } from './unlock.service';
import { notificationService } from './notification.service';

/**
 * Result of a single student pass operation
 */
export interface SinglePassResult {
  studentId: string;
  progressId: string;
  success: boolean;
  error?: string;
}

/**
 * Result of bulk pass operation
 * Requirements: 4.5, 4.6, 4.7
 */
export interface BulkPassResult {
  total: number;
  success: number;
  failed: number;
  results: SinglePassResult[];
  failures: Array<{
    studentId: string;
    progressId: string;
    reason: string;
  }>;
}

/**
 * Input for bulk pass operation
 */
export interface BulkPassInput {
  progressIds: string[];
  adminId: string;
}

/**
 * Process a single student pass operation
 * This is extracted for testability and reuse
 * 
 * @param progressId - The progress record ID to approve
 * @param adminId - The admin performing the approval
 * @returns SinglePassResult with success/failure info
 */
export async function processSinglePass(
  progressId: string,
  adminId: string
): Promise<SinglePassResult> {
  // Get the progress record
  const progressResult = await progressRepository.findById(progressId);
  if (!progressResult.success) {
    return {
      studentId: '',
      progressId,
      success: false,
      error: 'Không tìm thấy tiến độ học viên',
    };
  }

  const progress = progressResult.data;

  // Validate status is pending_approval
  if (progress.status !== 'pending_approval') {
    return {
      studentId: progress.studentId,
      progressId,
      success: false,
      error: `Trạng thái không hợp lệ: ${progress.status}`,
    };
  }

  // Approve the progress
  const approveResult = await progressRepository.approve(progressId, {
    approvedBy: adminId,
  });

  if (!approveResult.success) {
    return {
      studentId: progress.studentId,
      progressId,
      success: false,
      error: approveResult.error.message,
    };
  }

  // Create tracking log
  await trackingLogRepository.createLog({
    studentId: progress.studentId,
    courseId: progress.courseId,
    action: 'approve',
    previousValue: progress.status,
    newValue: 'completed',
    performedBy: adminId,
    performedAt: new Date(),
  });

  // Get course info for notification
  const courseResult = await courseRepository.findById(progress.courseId);
  if (courseResult.success) {
    // Create completion notification
    await notificationService.createCompletionNotification({
      studentId: progress.studentId,
      courseId: progress.courseId,
      courseName: courseResult.data.title,
    });

    // Trigger unlock logic
    await unlockService.unlockNextCourse(
      progress.studentId,
      progress.courseId,
      adminId
    );
  }

  return {
    studentId: progress.studentId,
    progressId,
    success: true,
  };
}

/**
 * Aggregate results from individual pass operations into BulkPassResult
 * This is a pure function for testability
 * 
 * @param results - Array of individual pass results
 * @returns Aggregated BulkPassResult
 */
export function aggregateBulkPassResults(
  results: SinglePassResult[]
): BulkPassResult {
  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  const failures = results
    .filter((r) => !r.success)
    .map((r) => ({
      studentId: r.studentId,
      progressId: r.progressId,
      reason: r.error || 'Lỗi không xác định',
    }));

  return {
    total: results.length,
    success: successCount,
    failed: failedCount,
    results,
    failures,
  };
}

/**
 * Bulk pass service for processing multiple student approvals
 * Requirements: 4.5, 4.6, 4.7
 */
export const bulkPassService = {
  /**
   * Process bulk pass for multiple students
   * Requirements: 4.5, 4.6, 4.7
   * 
   * - Processes all selected students
   * - Continues processing even if some fail (resilience)
   * - Collects and reports all failures
   * 
   * @param input - BulkPassInput with progressIds and adminId
   * @returns BulkPassResult with success/failure counts and details
   */
  async bulkPass(input: BulkPassInput): Promise<Result<BulkPassResult>> {
    const { progressIds, adminId } = input;

    // Validate input
    if (!progressIds || progressIds.length === 0) {
      return failure(new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Không có học viên nào được chọn',
        { field: 'progressIds' }
      ));
    }

    if (!adminId) {
      return failure(new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Thiếu thông tin admin',
        { field: 'adminId' }
      ));
    }

    // Process each student - continue on error (resilience)
    const results: SinglePassResult[] = [];

    for (const progressId of progressIds) {
      try {
        const result = await processSinglePass(progressId, adminId);
        results.push(result);
      } catch (error) {
        // Catch unexpected errors and continue processing
        results.push({
          studentId: '',
          progressId,
          success: false,
          error: error instanceof Error ? error.message : 'Lỗi không xác định',
        });
      }
    }

    // Aggregate results
    const bulkResult = aggregateBulkPassResults(results);

    return success(bulkResult);
  },

  /**
   * Get pending approval progress records for bulk pass
   * Requirements: 4.1
   * 
   * @param courseId - Optional course ID to filter by
   * @returns List of pending approval progress records
   */
  async getPendingApprovalList(
    courseId?: string
  ): Promise<Result<StudentProgress[]>> {
    if (courseId) {
      return progressRepository.findPendingApprovalByCourse(courseId);
    }
    return progressRepository.findPendingApproval();
  },
};
