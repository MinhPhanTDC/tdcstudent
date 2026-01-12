import { where, orderBy } from 'firebase/firestore';
import { type Result } from '@tdc/types';
import {
  TrackingLogSchema,
  type TrackingLog,
  type CreateTrackingLogInput,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';

/**
 * Tracking log repository for audit trail of progress changes
 * Requirements: 7.1, 7.2, 7.3
 */
class TrackingLogRepository extends BaseRepository<TrackingLog> {
  constructor() {
    super('trackingLogs', TrackingLogSchema);
  }

  /**
   * Create a new tracking log entry
   * Requirements: 7.1, 7.2, 7.3
   */
  async createLog(data: CreateTrackingLogInput): Promise<Result<TrackingLog>> {
    return this.create(data);
  }

  /**
   * Find tracking logs by student and course
   * Requirements: 7.4
   */
  async findByStudentCourse(
    studentId: string,
    courseId: string
  ): Promise<Result<TrackingLog[]>> {
    return this.findAll([
      where('studentId', '==', studentId),
      where('courseId', '==', courseId),
      orderBy('performedAt', 'desc'),
    ]);
  }

  /**
   * Find all tracking logs for a student
   * Requirements: 7.4
   */
  async findByStudent(studentId: string): Promise<Result<TrackingLog[]>> {
    return this.findAll([
      where('studentId', '==', studentId),
      orderBy('performedAt', 'desc'),
    ]);
  }

  /**
   * Find tracking logs by admin who performed the action
   */
  async findByPerformedBy(adminId: string): Promise<Result<TrackingLog[]>> {
    return this.findAll([
      where('performedBy', '==', adminId),
      orderBy('performedAt', 'desc'),
    ]);
  }

  /**
   * Find recent tracking logs for a course
   */
  async findByCourse(courseId: string): Promise<Result<TrackingLog[]>> {
    return this.findAll([
      where('courseId', '==', courseId),
      orderBy('performedAt', 'desc'),
    ]);
  }
}

// Singleton export
export const trackingLogRepository = new TrackingLogRepository();
