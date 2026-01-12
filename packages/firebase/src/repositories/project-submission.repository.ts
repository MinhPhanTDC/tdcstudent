import { where, orderBy } from 'firebase/firestore';
import { type Result, success, failure, ErrorCode, AppError } from '@tdc/types';
import {
  ProjectSubmissionSchema,
  type ProjectSubmission,
  type CreateProjectSubmissionInput,
  type UpdateProjectSubmissionInput,
  detectSubmissionType,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';

/**
 * Project submission repository for tracking student project submissions
 * Requirements: 4.3, 4.4
 */
class ProjectSubmissionRepository extends BaseRepository<ProjectSubmission> {
  constructor() {
    super('projectSubmissions', ProjectSubmissionSchema);
  }

  /**
   * Find all submissions for a student and course
   * Requirements: 4.1
   */
  async findByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<Result<ProjectSubmission[]>> {
    return this.findAll([
      where('studentId', '==', studentId),
      where('courseId', '==', courseId),
      orderBy('projectNumber', 'asc'),
    ]);
  }

  /**
   * Find a specific submission by student, course, and project number
   */
  async findByStudentCourseAndProject(
    studentId: string,
    courseId: string,
    projectNumber: number
  ): Promise<Result<ProjectSubmission | null>> {
    const result = await this.findAll([
      where('studentId', '==', studentId),
      where('courseId', '==', courseId),
      where('projectNumber', '==', projectNumber),
    ]);

    if (!result.success) {
      return result;
    }

    return success(result.data[0] || null);
  }

  /**
   * Find all submissions by a student
   */
  async findByStudentId(studentId: string): Promise<Result<ProjectSubmission[]>> {
    return this.findAll([
      where('studentId', '==', studentId),
      orderBy('submittedAt', 'desc'),
    ]);
  }

  /**
   * Create a new project submission
   * Requirements: 4.3
   */
  async createSubmission(
    studentId: string,
    input: CreateProjectSubmissionInput
  ): Promise<Result<ProjectSubmission>> {
    // Check if submission already exists
    const existing = await this.findByStudentCourseAndProject(
      studentId,
      input.courseId,
      input.projectNumber
    );

    if (!existing.success) {
      return failure(existing.error);
    }

    if (existing.data) {
      return failure(
        new AppError(
          ErrorCode.SUBMISSION_CREATE_FAILED,
          'Submission already exists for this project'
        )
      );
    }

    // Detect submission type from URL
    const submissionType = detectSubmissionType(input.submissionUrl);

    return this.create({
      studentId,
      courseId: input.courseId,
      projectNumber: input.projectNumber,
      title: input.title,
      submissionUrl: input.submissionUrl,
      submissionType,
      notes: input.notes,
      submittedAt: new Date(),
    });
  }

  /**
   * Update an existing submission
   * Requirements: 4.4
   */
  async updateSubmission(
    submissionId: string,
    input: UpdateProjectSubmissionInput
  ): Promise<Result<ProjectSubmission>> {
    const existing = await this.findById(submissionId);

    if (!existing.success) {
      return failure(new AppError(ErrorCode.SUBMISSION_NOT_FOUND, 'Submission not found'));
    }

    const updateData: Partial<ProjectSubmission> = { ...input };

    // Update submission type if URL changed
    if (input.submissionUrl) {
      updateData.submissionType = detectSubmissionType(input.submissionUrl);
    }

    return this.update(submissionId, updateData);
  }

  /**
   * Count submissions for a student
   */
  async countByStudent(studentId: string): Promise<Result<number>> {
    const result = await this.findByStudentId(studentId);

    if (!result.success) {
      return result;
    }

    return success(result.data.length);
  }

  /**
   * Count submissions for a student and course
   */
  async countByStudentAndCourse(studentId: string, courseId: string): Promise<Result<number>> {
    const result = await this.findByStudentAndCourse(studentId, courseId);

    if (!result.success) {
      return result;
    }

    return success(result.data.length);
  }
}

export const projectSubmissionRepository = new ProjectSubmissionRepository();
