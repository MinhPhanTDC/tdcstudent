import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type StudentLabProgress,
  type LabProgressStatus,
  type MarkCompleteInput,
  type ApproveLabVerificationInput,
  type RejectLabVerificationInput,
  type NotificationType,
  MarkCompleteInputSchema,
  ApproveLabVerificationInputSchema,
  RejectLabVerificationInputSchema,
} from '@tdc/schemas';
import { labProgressRepository } from '../repositories/lab-progress.repository';
import { labRequirementRepository } from '../repositories/lab-requirement.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { studentRepository } from '../repositories/student.repository';
import { activityService } from './activity.service';

/**
 * Lab Progress Error Codes
 */
export const LabProgressErrorCode = {
  PROGRESS_NOT_FOUND: 'PROGRESS_NOT_FOUND',
  PROGRESS_ALREADY_COMPLETED: 'PROGRESS_ALREADY_COMPLETED',
  PROGRESS_PENDING_VERIFICATION: 'PROGRESS_PENDING_VERIFICATION',
  VERIFICATION_NOT_PENDING: 'VERIFICATION_NOT_PENDING',
  REJECTION_REASON_REQUIRED: 'REJECTION_REASON_REQUIRED',
  REQUIREMENT_NOT_FOUND: 'REQUIREMENT_NOT_FOUND',
} as const;

/**
 * Mark complete result
 */
export interface MarkCompleteResult {
  progress: StudentLabProgress;
  requiresVerification: boolean;
}

/**
 * Verification result
 */
export interface VerificationResult {
  progress: StudentLabProgress;
  notificationSent: boolean;
}

/**
 * Determines the status based on verification requirement
 * Requirements: 2.1, 2.2
 * 
 * @param requiresVerification - Whether the requirement needs admin verification
 * @returns The appropriate status
 */
export function determineStatusOnComplete(requiresVerification: boolean): LabProgressStatus {
  return requiresVerification ? 'pending' : 'completed';
}

/**
 * Validates that a progress record is in pending status for verification
 * Requirements: 4.3, 4.4
 * 
 * @param progress - The progress record to validate
 * @returns true if the progress is pending verification
 */
export function isPendingVerification(progress: StudentLabProgress): boolean {
  return progress.status === 'pending';
}

/**
 * Creates approval state for a progress record
 * Requirements: 4.3
 * 
 * @param verifiedBy - The admin ID who approved
 * @param approvalTimestamp - The timestamp of approval
 * @returns The approval state object
 */
export function createApprovalState(
  verifiedBy: string,
  approvalTimestamp: Date
): Pick<StudentLabProgress, 'status' | 'verifiedBy' | 'completedAt'> {
  return {
    status: 'completed',
    verifiedBy,
    completedAt: approvalTimestamp,
  };
}

/**
 * Creates rejection state for a progress record
 * Requirements: 4.4
 * 
 * @param rejectionReason - The reason for rejection
 * @returns The rejection state object
 */
export function createRejectionState(
  rejectionReason: string
): Pick<StudentLabProgress, 'status' | 'rejectionReason'> {
  return {
    status: 'rejected',
    rejectionReason,
  };
}

/**
 * Validates rejection reason is non-empty
 * Requirements: 4.4
 * 
 * @param reason - The rejection reason to validate
 * @returns true if the reason is valid (non-empty)
 */
export function validateRejectionReason(reason: string): boolean {
  return reason.trim().length > 0;
}


/**
 * Lab Progress Service
 * Handles business logic for student lab progress management
 * Requirements: 2.1, 2.2, 4.3, 4.4
 */
export const labProgressService = {
  /**
   * Mark a requirement as complete for a student
   * Handles verification flow based on requirement settings
   * Requirements: 2.1, 2.2
   * 
   * @param studentId - The student's ID
   * @param input - The mark complete input
   * @returns Result with progress and verification status
   */
  async markComplete(
    studentId: string,
    input: MarkCompleteInput
  ): Promise<Result<MarkCompleteResult>> {
    // Validate input
    const validation = MarkCompleteInputSchema.safeParse(input);
    if (!validation.success) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input data', {
          errors: validation.error.flatten(),
        })
      );
    }

    // Get the requirement to check if verification is needed
    const requirementResult = await labRequirementRepository.findById(input.requirementId);
    if (!requirementResult.success) {
      return failure(
        new AppError(
          ErrorCode.USER_NOT_FOUND,
          'Requirement not found',
          { requirementId: input.requirementId }
        )
      );
    }

    const requirement = requirementResult.data;

    // Check if progress already exists
    const existingResult = await labProgressRepository.findByStudentAndRequirement(
      studentId,
      input.requirementId
    );
    if (!existingResult.success) {
      return failure(existingResult.error);
    }

    // Determine the new status based on verification requirement
    const newStatus = determineStatusOnComplete(requirement.requiresVerification);
    const now = new Date();

    let progress: StudentLabProgress;

    if (existingResult.data) {
      // Check if already completed
      if (existingResult.data.status === 'completed') {
        return failure(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Requirement already completed',
            { code: LabProgressErrorCode.PROGRESS_ALREADY_COMPLETED }
          )
        );
      }

      // Update existing progress
      const updateResult = await labProgressRepository.updateStatus(
        existingResult.data.id,
        newStatus,
        {
          notes: input.notes,
          completedAt: newStatus === 'completed' ? now : null,
        }
      );
      if (!updateResult.success) {
        return failure(updateResult.error);
      }
      progress = updateResult.data;
    } else {
      // Create new progress record
      const createResult = await labProgressRepository.createProgress({
        studentId,
        requirementId: input.requirementId,
        status: newStatus,
        completedAt: newStatus === 'completed' ? now : null,
        verifiedBy: null,
        rejectionReason: null,
        notes: input.notes,
      });
      if (!createResult.success) {
        return failure(createResult.error);
      }
      progress = createResult.data;
    }

    // Create notification if pending verification
    if (newStatus === 'pending') {
      await notificationRepository.createNotification({
        userId: studentId,
        type: 'lab_verification_pending' as NotificationType,
        title: 'Yêu cầu xác nhận đã được gửi',
        message: `Yêu cầu hoàn thành "${requirement.title}" đang chờ admin xác nhận.`,
        metadata: {
          requirementId: input.requirementId,
          requirementTitle: requirement.title,
        },
      });
    } else if (newStatus === 'completed') {
      // Log lab requirement completion activity for non-verification requirements
      try {
        const studentResult = await studentRepository.findById(studentId);
        const studentName = studentResult.success
          ? studentResult.data.displayName
          : 'Unknown Student';

        await activityService.logLabRequirementCompletion({
          userId: studentId,
          userName: studentName,
          requirementId: input.requirementId,
          requirementTitle: requirement.title,
        });
      } catch (activityError) {
        // Don't fail the completion if activity logging fails
        console.error('Failed to log lab requirement completion activity:', activityError);
      }
    }

    return success({
      progress,
      requiresVerification: requirement.requiresVerification,
    });
  },

  /**
   * Approve a pending verification
   * Requirements: 4.3
   * 
   * @param input - The approval input
   * @returns Result with updated progress
   */
  async approve(input: ApproveLabVerificationInput): Promise<Result<VerificationResult>> {
    // Validate input
    const validation = ApproveLabVerificationInputSchema.safeParse(input);
    if (!validation.success) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input data', {
          errors: validation.error.flatten(),
        })
      );
    }

    // Get the progress record
    const progressResult = await labProgressRepository.findById(input.progressId);
    if (!progressResult.success) {
      return failure(
        new AppError(
          ErrorCode.USER_NOT_FOUND,
          'Progress record not found',
          { code: LabProgressErrorCode.PROGRESS_NOT_FOUND }
        )
      );
    }

    const existingProgress = progressResult.data;

    // Validate that progress is pending
    if (!isPendingVerification(existingProgress)) {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Progress is not pending verification',
          { code: LabProgressErrorCode.VERIFICATION_NOT_PENDING }
        )
      );
    }

    // Create approval state
    const now = new Date();
    const approvalState = createApprovalState(input.verifiedBy, now);

    // Update progress
    const updateResult = await labProgressRepository.updateStatus(
      input.progressId,
      approvalState.status,
      {
        verifiedBy: approvalState.verifiedBy,
        completedAt: approvalState.completedAt,
      }
    );
    if (!updateResult.success) {
      return failure(updateResult.error);
    }

    // Get requirement for notification
    const requirementResult = await labRequirementRepository.findById(
      existingProgress.requirementId
    );
    const requirementTitle = requirementResult.success
      ? requirementResult.data.title
      : 'Lab requirement';

    // Create notification for student
    await notificationRepository.createNotification({
      userId: existingProgress.studentId,
      type: 'lab_verification_approved' as NotificationType,
      title: 'Yêu cầu đã được phê duyệt',
      message: `Yêu cầu hoàn thành "${requirementTitle}" đã được admin phê duyệt.`,
      metadata: {
        requirementId: existingProgress.requirementId,
        requirementTitle,
        verifiedBy: input.verifiedBy,
      },
    });

    // Log lab requirement completion activity (Requirements: 6.2)
    try {
      const studentResult = await studentRepository.findById(existingProgress.studentId);
      const studentName = studentResult.success
        ? studentResult.data.displayName
        : 'Unknown Student';

      await activityService.logLabRequirementCompletion({
        userId: existingProgress.studentId,
        userName: studentName,
        requirementId: existingProgress.requirementId,
        requirementTitle,
      });
    } catch (activityError) {
      // Don't fail the approval if activity logging fails
      console.error('Failed to log lab requirement completion activity:', activityError);
    }

    return success({
      progress: updateResult.data,
      notificationSent: true,
    });
  },

  /**
   * Reject a pending verification
   * Requirements: 4.4
   * 
   * @param input - The rejection input
   * @returns Result with updated progress
   */
  async reject(input: RejectLabVerificationInput): Promise<Result<VerificationResult>> {
    // Validate input
    const validation = RejectLabVerificationInputSchema.safeParse(input);
    if (!validation.success) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input data', {
          errors: validation.error.flatten(),
        })
      );
    }

    // Validate rejection reason
    if (!validateRejectionReason(input.rejectionReason)) {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Rejection reason is required',
          { code: LabProgressErrorCode.REJECTION_REASON_REQUIRED }
        )
      );
    }

    // Get the progress record
    const progressResult = await labProgressRepository.findById(input.progressId);
    if (!progressResult.success) {
      return failure(
        new AppError(
          ErrorCode.USER_NOT_FOUND,
          'Progress record not found',
          { code: LabProgressErrorCode.PROGRESS_NOT_FOUND }
        )
      );
    }

    const existingProgress = progressResult.data;

    // Validate that progress is pending
    if (!isPendingVerification(existingProgress)) {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Progress is not pending verification',
          { code: LabProgressErrorCode.VERIFICATION_NOT_PENDING }
        )
      );
    }

    // Create rejection state
    const rejectionState = createRejectionState(input.rejectionReason);

    // Update progress
    const updateResult = await labProgressRepository.updateStatus(
      input.progressId,
      rejectionState.status,
      {
        rejectionReason: rejectionState.rejectionReason,
      }
    );
    if (!updateResult.success) {
      return failure(updateResult.error);
    }

    // Get requirement for notification
    const requirementResult = await labRequirementRepository.findById(
      existingProgress.requirementId
    );
    const requirementTitle = requirementResult.success
      ? requirementResult.data.title
      : 'Lab requirement';

    // Create notification for student
    await notificationRepository.createNotification({
      userId: existingProgress.studentId,
      type: 'lab_verification_rejected' as NotificationType,
      title: 'Yêu cầu bị từ chối',
      message: `Yêu cầu hoàn thành "${requirementTitle}" đã bị từ chối. Lý do: ${input.rejectionReason}`,
      metadata: {
        requirementId: existingProgress.requirementId,
        requirementTitle,
        rejectionReason: input.rejectionReason,
      },
    });

    return success({
      progress: updateResult.data,
      notificationSent: true,
    });
  },

  /**
   * Get all progress records for a student
   * Requirements: 1.2
   */
  async getStudentProgress(studentId: string): Promise<Result<StudentLabProgress[]>> {
    return labProgressRepository.findByStudent(studentId);
  },

  /**
   * Get all pending verifications
   * Requirements: 4.1
   */
  async getPendingVerifications(): Promise<Result<StudentLabProgress[]>> {
    return labProgressRepository.findPending();
  },

  /**
   * Get progress by ID
   */
  async getProgressById(progressId: string): Promise<Result<StudentLabProgress>> {
    return labProgressRepository.findById(progressId);
  },
};
