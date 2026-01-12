import { where, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { type Result, success, failure, ErrorCode, AppError } from '@tdc/types';
import {
  StudentProgressSchema,
  type StudentProgress,
  type UpdateProgressInput,
  type ProgressStatus,
  type ApproveProgressInput,
  type RejectProgressInput,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Progress repository for tracking student course progress
 * Requirements: 7.4, 7.5
 */
export class ProgressRepository extends BaseRepository<StudentProgress> {
  constructor() {
    super('progress', StudentProgressSchema);
  }

  /**
   * Find all progress records for a student
   */
  async findByStudentId(studentId: string): Promise<Result<StudentProgress[]>> {
    return this.findAll([where('studentId', '==', studentId)]);
  }

  /**
   * Find progress for a specific student and course
   */
  async findByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<Result<StudentProgress | null>> {
    const result = await this.findAll([
      where('studentId', '==', studentId),
      where('courseId', '==', courseId),
    ]);

    if (!result.success) {
      return result;
    }

    return success(result.data[0] || null);
  }

  /**
   * Update progress status with automatic completedAt handling
   * Requirements: 7.4, 7.5
   */
  async updateStatus(
    progressId: string,
    status: ProgressStatus
  ): Promise<Result<StudentProgress>> {
    try {
      const existing = await this.findById(progressId);

      if (!existing.success) {
        return failure(new AppError(ErrorCode.PROGRESS_NOT_FOUND, 'Progress record not found'));
      }

      const updateData: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      };

      // Set completedAt when status becomes 'completed'
      // Requirements: 7.5
      if (status === 'completed' && existing.data.status !== 'completed') {
        updateData.completedAt = serverTimestamp();
      }

      // Clear completedAt if status changes from completed to something else
      if (status !== 'completed' && existing.data.status === 'completed') {
        updateData.completedAt = null;
      }

      const docRef = doc(getFirebaseDb(), this.collectionName, progressId);
      await updateDoc(docRef, updateData);

      // Return updated progress
      const updated = await this.findById(progressId);
      if (!updated.success) {
        return failure(new AppError(ErrorCode.PROGRESS_UPDATE_FAILED, 'Failed to fetch updated progress'));
      }

      return updated;
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Update progress with automatic timestamp handling
   * Requirements: 7.4
   */
  async updateProgress(
    progressId: string,
    data: UpdateProgressInput
  ): Promise<Result<StudentProgress>> {
    try {
      const existing = await this.findById(progressId);

      if (!existing.success) {
        return failure(new AppError(ErrorCode.PROGRESS_NOT_FOUND, 'Progress record not found'));
      }

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Handle completedAt based on status change
      if (data.status === 'completed' && existing.data.status !== 'completed') {
        updateData.completedAt = serverTimestamp();
      } else if (data.status && data.status !== 'completed' && existing.data.status === 'completed') {
        updateData.completedAt = null;
      }

      const docRef = doc(getFirebaseDb(), this.collectionName, progressId);
      await updateDoc(docRef, updateData);

      // Return updated progress
      const updated = await this.findById(progressId);
      if (!updated.success) {
        return failure(new AppError(ErrorCode.PROGRESS_UPDATE_FAILED, 'Failed to fetch updated progress'));
      }

      return updated;
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Get or create progress for a student-course pair
   */
  async getOrCreate(
    studentId: string,
    courseId: string
  ): Promise<Result<StudentProgress>> {
    const existing = await this.findByStudentAndCourse(studentId, courseId);

    if (!existing.success) {
      return existing;
    }

    if (existing.data) {
      return success(existing.data);
    }

    // Create new progress record
    return this.create({
      studentId,
      courseId,
      completedSessions: 0,
      projectsSubmitted: 0,
      projectLinks: [],
      status: 'not_started',
      completedAt: null,
      approvedAt: null,
    });
  }

  /**
   * Find all progress records for a course
   * Requirements: 1.4
   */
  async findByCourse(courseId: string): Promise<Result<StudentProgress[]>> {
    return this.findAll([where('courseId', '==', courseId)]);
  }

  /**
   * Find all pending approval progress records
   * Requirements: 4.1 - Quick Track filter
   */
  async findPendingApproval(): Promise<Result<StudentProgress[]>> {
    return this.findAll([where('status', '==', 'pending_approval')]);
  }

  /**
   * Find pending approval progress records for a specific course
   * Requirements: 4.1
   */
  async findPendingApprovalByCourse(courseId: string): Promise<Result<StudentProgress[]>> {
    return this.findAll([
      where('courseId', '==', courseId),
      where('status', '==', 'pending_approval'),
    ]);
  }

  /**
   * Approve a progress record
   * Requirements: 3.3
   */
  async approve(
    progressId: string,
    input: ApproveProgressInput
  ): Promise<Result<StudentProgress>> {
    try {
      const existing = await this.findById(progressId);

      if (!existing.success) {
        return failure(new AppError(ErrorCode.PROGRESS_NOT_FOUND, 'Progress record not found'));
      }

      if (existing.data.status !== 'pending_approval') {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Progress is not pending approval'));
      }

      const docRef = doc(getFirebaseDb(), this.collectionName, progressId);
      await updateDoc(docRef, {
        status: 'completed',
        approvedAt: serverTimestamp(),
        approvedBy: input.approvedBy,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Return updated progress
      const updated = await this.findById(progressId);
      if (!updated.success) {
        return failure(new AppError(ErrorCode.PROGRESS_UPDATE_FAILED, 'Failed to fetch updated progress'));
      }

      return updated;
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Reject a progress record
   * Requirements: 3.5
   */
  async reject(
    progressId: string,
    input: RejectProgressInput
  ): Promise<Result<StudentProgress>> {
    try {
      const existing = await this.findById(progressId);

      if (!existing.success) {
        return failure(new AppError(ErrorCode.PROGRESS_NOT_FOUND, 'Progress record not found'));
      }

      if (existing.data.status !== 'pending_approval') {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Progress is not pending approval'));
      }

      const docRef = doc(getFirebaseDb(), this.collectionName, progressId);
      await updateDoc(docRef, {
        status: 'rejected',
        rejectionReason: input.rejectionReason,
        updatedAt: serverTimestamp(),
      });

      // Return updated progress
      const updated = await this.findById(progressId);
      if (!updated.success) {
        return failure(new AppError(ErrorCode.PROGRESS_UPDATE_FAILED, 'Failed to fetch updated progress'));
      }

      return updated;
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Find all completed courses for a student
   */
  async findCompletedByStudent(studentId: string): Promise<Result<StudentProgress[]>> {
    return this.findAll([
      where('studentId', '==', studentId),
      where('status', '==', 'completed'),
    ]);
  }

  /**
   * Find in-progress courses for a student
   */
  async findInProgressByStudent(studentId: string): Promise<Result<StudentProgress[]>> {
    return this.findAll([
      where('studentId', '==', studentId),
      where('status', '==', 'in_progress'),
    ]);
  }

  /**
   * Count completed courses for a student
   */
  async countCompletedByStudent(studentId: string): Promise<Result<number>> {
    const result = await this.findCompletedByStudent(studentId);

    if (!result.success) {
      return failure(result.error);
    }

    return success(result.data.length);
  }
}

// Singleton export
export const progressRepository = new ProgressRepository();
