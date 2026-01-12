import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type StudentProgress,
  type UpdateProgressInput,
} from '@tdc/schemas';
import { progressRepository } from '../repositories/progress.repository';
import { trackingLogRepository } from '../repositories/tracking-log.repository';
import { courseRepository } from '../repositories/course.repository';
import { studentRepository } from '../repositories/student.repository';
import { unlockService, type UnlockResult } from './unlock.service';
import { notificationService } from './notification.service';
import { activityService } from './activity.service';

/**
 * Course requirements for pass condition checking
 */
export interface CourseRequirements {
  requiredSessions: number;
  requiredProjects: number;
}

/**
 * Pass condition check result
 */
export interface PassConditionResult {
  canPass: boolean;
  missingConditions: string[];
}

/**
 * Progress update with validation result
 */
export interface ProgressUpdateResult {
  progress: StudentProgress;
  statusChanged: boolean;
  previousStatus: string;
}

/**
 * Approval result with unlock information
 */
export interface ApprovalResult {
  progress: StudentProgress;
  unlockResult?: UnlockResult;
  notificationCreated: boolean;
}

/**
 * Check if a progress record meets pass conditions
 * Requirements: 3.1
 * 
 * @param progress - The student progress record
 * @param requirements - Course requirements (sessions and projects)
 * @returns PassConditionResult with canPass flag and missing conditions
 */
export function checkPassCondition(
  progress: Pick<StudentProgress, 'completedSessions' | 'projectsSubmitted' | 'projectLinks'>,
  requirements: CourseRequirements
): PassConditionResult {
  const missingConditions: string[] = [];

  // Check sessions requirement
  if (progress.completedSessions < requirements.requiredSessions) {
    missingConditions.push(
      `Cần hoàn thành ${requirements.requiredSessions - progress.completedSessions} buổi học nữa`
    );
  }

  // Check projects requirement
  if (progress.projectsSubmitted < requirements.requiredProjects) {
    missingConditions.push(
      `Cần nộp ${requirements.requiredProjects - progress.projectsSubmitted} dự án nữa`
    );
  }

  // Check project links requirement (at least 1 link)
  if (progress.projectLinks.length === 0) {
    missingConditions.push('Cần có ít nhất 1 link dự án');
  }

  return {
    canPass: missingConditions.length === 0,
    missingConditions,
  };
}

/**
 * Validate session count against course requirements
 * Requirements: 2.4
 * 
 * @param sessions - Number of sessions to validate
 * @param requiredSessions - Maximum allowed sessions
 * @returns Result with validation error if invalid
 */
export function validateSessionCount(
  sessions: number,
  requiredSessions: number
): Result<void> {
  if (sessions < 0) {
    return failure(new AppError(
      ErrorCode.VALIDATION_ERROR,
      'Số buổi không được âm',
      { field: 'completedSessions', value: sessions }
    ));
  }

  if (sessions > requiredSessions) {
    return failure(new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Số buổi không được vượt quá ${requiredSessions}`,
      { field: 'completedSessions', value: sessions, max: requiredSessions }
    ));
  }

  return success(undefined);
}

/**
 * Validate project count against course requirements
 * Requirements: 2.5
 * 
 * @param projects - Number of projects to validate
 * @param requiredProjects - Maximum allowed projects
 * @returns Result with validation error if invalid
 */
export function validateProjectCount(
  projects: number,
  requiredProjects: number
): Result<void> {
  if (projects < 0) {
    return failure(new AppError(
      ErrorCode.VALIDATION_ERROR,
      'Số dự án không được âm',
      { field: 'projectsSubmitted', value: projects }
    ));
  }

  if (projects > requiredProjects) {
    return failure(new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Số dự án không được vượt quá ${requiredProjects}`,
      { field: 'projectsSubmitted', value: projects, max: requiredProjects }
    ));
  }

  return success(undefined);
}

/**
 * Validate URL format for project links
 * Requirements: 2.6
 * 
 * @param url - URL string to validate
 * @returns Result with validation error if invalid
 */
export function validateProjectUrl(url: string): Result<void> {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return failure(new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Link dự án phải sử dụng giao thức http hoặc https',
        { field: 'projectLinks', value: url }
      ));
    }
    return success(undefined);
  } catch {
    return failure(new AppError(
      ErrorCode.VALIDATION_ERROR,
      'Link dự án không hợp lệ',
      { field: 'projectLinks', value: url }
    ));
  }
}

/**
 * Tracking service for managing student progress
 * Requirements: 2.3, 2.4, 2.5, 2.6, 3.1, 3.3, 3.5
 */
export const trackingService = {
  /**
   * Update student progress with validation and auto status change
   * Requirements: 2.3, 2.4, 2.5, 2.6, 3.1
   */
  async updateProgress(
    progressId: string,
    data: UpdateProgressInput,
    adminId: string
  ): Promise<Result<ProgressUpdateResult>> {
    // Get existing progress
    const existingResult = await progressRepository.findById(progressId);
    if (!existingResult.success) {
      return failure(existingResult.error);
    }
    const existing = existingResult.data;

    // Get course for requirements
    const courseResult = await courseRepository.findById(existing.courseId);
    if (!courseResult.success) {
      return failure(new AppError(ErrorCode.COURSE_NOT_FOUND, 'Không tìm thấy môn học'));
    }
    const course = courseResult.data;

    // Validate session count if provided
    if (data.completedSessions !== undefined) {
      const sessionValidation = validateSessionCount(
        data.completedSessions,
        course.requiredSessions
      );
      if (!sessionValidation.success) {
        return failure(sessionValidation.error);
      }
    }

    // Validate project count if provided
    if (data.projectsSubmitted !== undefined) {
      const projectValidation = validateProjectCount(
        data.projectsSubmitted,
        course.requiredProjects
      );
      if (!projectValidation.success) {
        return failure(projectValidation.error);
      }
    }

    // Validate project URLs if provided
    if (data.projectLinks) {
      for (const url of data.projectLinks) {
        const urlValidation = validateProjectUrl(url);
        if (!urlValidation.success) {
          return failure(urlValidation.error);
        }
      }
    }

    // Create tracking logs for changes
    const now = new Date();
    
    if (data.completedSessions !== undefined && data.completedSessions !== existing.completedSessions) {
      await trackingLogRepository.createLog({
        studentId: existing.studentId,
        courseId: existing.courseId,
        action: 'update_sessions',
        previousValue: existing.completedSessions,
        newValue: data.completedSessions,
        performedBy: adminId,
        performedAt: now,
      });
    }

    if (data.projectsSubmitted !== undefined && data.projectsSubmitted !== existing.projectsSubmitted) {
      await trackingLogRepository.createLog({
        studentId: existing.studentId,
        courseId: existing.courseId,
        action: 'update_projects',
        previousValue: existing.projectsSubmitted,
        newValue: data.projectsSubmitted,
        performedBy: adminId,
        performedAt: now,
      });
    }

    // Check for added/removed project links
    if (data.projectLinks) {
      const addedLinks = data.projectLinks.filter(
        (link) => !existing.projectLinks.includes(link)
      );
      const removedLinks = existing.projectLinks.filter(
        (link) => !data.projectLinks!.includes(link)
      );

      for (const link of addedLinks) {
        await trackingLogRepository.createLog({
          studentId: existing.studentId,
          courseId: existing.courseId,
          action: 'add_project_link',
          newValue: link,
          performedBy: adminId,
          performedAt: now,
        });
      }

      for (const link of removedLinks) {
        await trackingLogRepository.createLog({
          studentId: existing.studentId,
          courseId: existing.courseId,
          action: 'remove_project_link',
          previousValue: link,
          performedBy: adminId,
          performedAt: now,
        });
      }
    }

    // Update progress
    const updateResult = await progressRepository.updateProgress(progressId, data);
    if (!updateResult.success) {
      return failure(updateResult.error);
    }

    const updatedProgress = updateResult.data;
    const previousStatus = existing.status;

    // Check if should auto-transition to pending_approval
    // Only if current status is in_progress or not_started
    if (
      updatedProgress.status === 'in_progress' ||
      updatedProgress.status === 'not_started'
    ) {
      const passCheck = checkPassCondition(updatedProgress, {
        requiredSessions: course.requiredSessions,
        requiredProjects: course.requiredProjects,
      });

      if (passCheck.canPass) {
        // Auto-transition to pending_approval
        const statusResult = await progressRepository.updateStatus(
          progressId,
          'pending_approval'
        );
        if (statusResult.success) {
          return success({
            progress: statusResult.data,
            statusChanged: true,
            previousStatus,
          });
        }
      }
    }

    // Update status to in_progress if currently not_started and has some progress
    if (
      updatedProgress.status === 'not_started' &&
      (updatedProgress.completedSessions > 0 ||
        updatedProgress.projectsSubmitted > 0 ||
        updatedProgress.projectLinks.length > 0)
    ) {
      const statusResult = await progressRepository.updateStatus(progressId, 'in_progress');
      if (statusResult.success) {
        return success({
          progress: statusResult.data,
          statusChanged: true,
          previousStatus,
        });
      }
    }

    return success({
      progress: updatedProgress,
      statusChanged: updatedProgress.status !== previousStatus,
      previousStatus,
    });
  },

  /**
   * Approve a student's progress
   * Requirements: 3.3, 5.1, 5.2, 8.1
   * 
   * After approval:
   * 1. Updates progress status to completed
   * 2. Creates tracking log
   * 3. Creates completion notification for student
   * 4. Triggers unlock of next course/semester
   */
  async approve(
    progressId: string,
    adminId: string
  ): Promise<Result<ApprovalResult>> {
    // Get existing progress
    const existingResult = await progressRepository.findById(progressId);
    if (!existingResult.success) {
      return failure(existingResult.error);
    }
    const existing = existingResult.data;

    // Validate status is pending_approval
    if (existing.status !== 'pending_approval') {
      return failure(new AppError(
        ErrorCode.NOT_PENDING_APPROVAL,
        'Chỉ có thể duyệt học viên đang chờ duyệt',
        { currentStatus: existing.status }
      ));
    }

    // Approve progress
    const approveResult = await progressRepository.approve(progressId, {
      approvedBy: adminId,
    });

    if (!approveResult.success) {
      return failure(approveResult.error);
    }

    // Create tracking log
    await trackingLogRepository.createLog({
      studentId: existing.studentId,
      courseId: existing.courseId,
      action: 'approve',
      previousValue: existing.status,
      newValue: 'completed',
      performedBy: adminId,
      performedAt: new Date(),
    });

    // Get course name for notification
    const courseResult = await courseRepository.findById(existing.courseId);
    const courseName = courseResult.success ? courseResult.data.title : 'Môn học';

    // Create completion notification for student (Requirements: 8.1)
    let notificationCreated = false;
    const notificationResult = await notificationService.createCompletionNotification({
      studentId: existing.studentId,
      courseId: existing.courseId,
      courseName,
    });
    if (notificationResult.success) {
      notificationCreated = true;
    }

    // Log course completion activity (Requirements: 6.2)
    try {
      const studentResult = await studentRepository.findById(existing.studentId);
      const studentName = studentResult.success
        ? studentResult.data.displayName
        : 'Unknown Student';

      await activityService.logCourseCompletion({
        userId: existing.studentId,
        userName: studentName,
        courseId: existing.courseId,
        courseTitle: courseName,
      });
    } catch (activityError) {
      // Don't fail the approval if activity logging fails
      console.error('Failed to log course completion activity:', activityError);
    }

    // Trigger unlock of next course/semester (Requirements: 5.1, 5.2)
    // Handle unlock errors gracefully - don't fail the approval if unlock fails
    let unlockResult: UnlockResult | undefined;
    try {
      const unlockResponse = await unlockService.unlockNextCourse(
        existing.studentId,
        existing.courseId,
        adminId
      );
      
      if (unlockResponse.success) {
        unlockResult = unlockResponse.data;
      }
      // If unlock fails, we log but don't fail the approval
      // The approval itself was successful
    } catch (error) {
      // Log error but don't fail the approval
      console.error('Unlock failed after approval:', error);
    }

    return success({
      progress: approveResult.data,
      unlockResult,
      notificationCreated,
    });
  },

  /**
   * Reject a student's progress
   * Requirements: 3.5, 8.2
   * 
   * After rejection:
   * 1. Updates progress status to rejected with reason
   * 2. Creates tracking log
   * 3. Creates rejection notification for student
   */
  async reject(
    progressId: string,
    reason: string,
    adminId: string
  ): Promise<Result<StudentProgress>> {
    // Validate reason is not empty
    if (!reason || reason.trim().length === 0) {
      return failure(new AppError(
        ErrorCode.REJECTION_REASON_REQUIRED,
        'Lý do từ chối không được để trống',
        { field: 'rejectionReason' }
      ));
    }

    // Get existing progress
    const existingResult = await progressRepository.findById(progressId);
    if (!existingResult.success) {
      return failure(existingResult.error);
    }
    const existing = existingResult.data;

    // Validate status is pending_approval
    if (existing.status !== 'pending_approval') {
      return failure(new AppError(
        ErrorCode.NOT_PENDING_APPROVAL,
        'Chỉ có thể từ chối học viên đang chờ duyệt',
        { currentStatus: existing.status }
      ));
    }

    // Reject progress
    const rejectResult = await progressRepository.reject(progressId, {
      rejectionReason: reason.trim(),
    });

    if (!rejectResult.success) {
      return failure(rejectResult.error);
    }

    // Create tracking log
    await trackingLogRepository.createLog({
      studentId: existing.studentId,
      courseId: existing.courseId,
      action: 'reject',
      previousValue: existing.status,
      newValue: 'rejected',
      performedBy: adminId,
      performedAt: new Date(),
    });

    // Get course name for notification
    const courseResult = await courseRepository.findById(existing.courseId);
    const courseName = courseResult.success ? courseResult.data.title : 'Môn học';

    // Create rejection notification for student (Requirements: 8.2)
    await notificationService.createRejectionNotification({
      studentId: existing.studentId,
      courseId: existing.courseId,
      courseName,
      rejectionReason: reason.trim(),
    });

    return rejectResult;
  },

  /**
   * Get pass condition status for a progress record
   * Requirements: 3.6
   */
  async getPassConditionStatus(
    progressId: string
  ): Promise<Result<PassConditionResult>> {
    // Get progress
    const progressResult = await progressRepository.findById(progressId);
    if (!progressResult.success) {
      return failure(progressResult.error);
    }
    const progress = progressResult.data;

    // Get course requirements
    const courseResult = await courseRepository.findById(progress.courseId);
    if (!courseResult.success) {
      return failure(new AppError(ErrorCode.COURSE_NOT_FOUND, 'Không tìm thấy môn học'));
    }
    const course = courseResult.data;

    return success(checkPassCondition(progress, {
      requiredSessions: course.requiredSessions,
      requiredProjects: course.requiredProjects,
    }));
  },
};
