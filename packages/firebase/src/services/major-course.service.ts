import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type MajorCourse,
  type CreateMajorCourseInput,
  type UpdateMajorCourseInput,
} from '@tdc/schemas';
import { majorCourseRepository } from '../repositories/major-course.repository';
import { majorRepository } from '../repositories/major.repository';
import { courseRepository } from '../repositories/course.repository';

/**
 * Sort major courses by order field ascending
 * Requirements: 2.6
 */
export function sortMajorCoursesByOrder(courses: MajorCourse[]): MajorCourse[] {
  return [...courses].sort((a, b) => a.order - b.order);
}

/**
 * Normalize order values to form a valid sequence (0, 1, 2, ...)
 * Requirements: 2.3
 */
export function normalizeOrderSequence(courses: MajorCourse[]): MajorCourse[] {
  const sorted = sortMajorCoursesByOrder(courses);
  return sorted.map((course, index) => ({
    ...course,
    order: index,
  }));
}

/**
 * MajorCourse service for business logic operations
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export const majorCourseService = {
  /**
   * Get all courses for a major, sorted by order
   * Requirements: 2.2, 2.6
   * 
   * @param majorId - Major ID
   * @returns List of major courses sorted by order
   */
  async getMajorCourses(majorId: string): Promise<Result<MajorCourse[]>> {
    // Verify major exists
    const majorResult = await majorRepository.findById(majorId);
    if (!majorResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId }
      ));
    }

    const result = await majorCourseRepository.findByMajorId(majorId);
    if (!result.success) {
      return failure(result.error);
    }

    // Ensure sorted by order
    return success(sortMajorCoursesByOrder(result.data));
  },

  /**
   * Add a course to a major
   * Requirements: 2.1, 2.7
   * 
   * Validates:
   * - Major exists
   * - Course exists
   * - Course is not already in the major (duplicate prevention)
   * 
   * @param input - Major course creation data
   * @returns Created major course
   */
  async addCourseToMajor(input: CreateMajorCourseInput): Promise<Result<MajorCourse>> {
    // Verify major exists
    const majorResult = await majorRepository.findById(input.majorId);
    if (!majorResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId: input.majorId }
      ));
    }

    // Verify course exists
    const courseResult = await courseRepository.findById(input.courseId);
    if (!courseResult.success) {
      return failure(new AppError(
        ErrorCode.COURSE_NOT_FOUND,
        'Không tìm thấy môn học',
        { courseId: input.courseId }
      ));
    }

    // Check for duplicate (repository handles this, but we provide better error)
    const existingResult = await majorCourseRepository.findByMajorAndCourse(
      input.majorId,
      input.courseId
    );
    if (existingResult.success && existingResult.data) {
      return failure(new AppError(
        ErrorCode.MAJOR_COURSE_DUPLICATE,
        'Môn học đã có trong chuyên ngành',
        { 
          majorId: input.majorId, 
          courseId: input.courseId,
          existingId: existingResult.data.id 
        }
      ));
    }

    // Create major course (repository assigns next order automatically)
    return majorCourseRepository.create(input);
  },

  /**
   * Update a major course (order and isRequired)
   * Requirements: 2.4
   * 
   * @param input - Update data with ID
   * @returns Updated major course
   */
  async updateMajorCourse(input: UpdateMajorCourseInput): Promise<Result<MajorCourse>> {
    const { id, ...updateData } = input;

    // Verify major course exists
    const existingResult = await majorCourseRepository.findById(id);
    if (!existingResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_COURSE_NOT_FOUND,
        'Không tìm thấy môn học trong chuyên ngành',
        { majorCourseId: id }
      ));
    }

    return majorCourseRepository.update(id, updateData);
  },

  /**
   * Remove a course from a major
   * Requirements: 2.5
   * 
   * @param majorCourseId - MajorCourse ID to remove
   * @returns void on success
   */
  async removeCourseFromMajor(majorCourseId: string): Promise<Result<void>> {
    // Verify major course exists
    const existingResult = await majorCourseRepository.findById(majorCourseId);
    if (!existingResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_COURSE_NOT_FOUND,
        'Không tìm thấy môn học trong chuyên ngành',
        { majorCourseId }
      ));
    }

    return majorCourseRepository.delete(majorCourseId);
  },

  /**
   * Reorder courses within a major
   * Requirements: 2.3
   * 
   * Updates order fields to form a valid sequence (0, 1, 2, ...)
   * 
   * @param majorId - Major ID
   * @param majorCourseIds - Array of MajorCourse IDs in new order
   * @returns void on success
   */
  async reorderCourses(majorId: string, majorCourseIds: string[]): Promise<Result<void>> {
    // Verify major exists
    const majorResult = await majorRepository.findById(majorId);
    if (!majorResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId }
      ));
    }

    // Get existing courses to validate
    const existingResult = await majorCourseRepository.findByMajorId(majorId);
    if (!existingResult.success) {
      return failure(existingResult.error);
    }

    // Validate all IDs are provided (no missing courses)
    const existingIds = new Set(existingResult.data.map(mc => mc.id));
    const providedIds = new Set(majorCourseIds);

    // Check for missing IDs
    for (const id of existingIds) {
      if (!providedIds.has(id)) {
        return failure(new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Danh sách sắp xếp thiếu môn học',
          { missingId: id }
        ));
      }
    }

    // Check for extra IDs (not in this major)
    for (const id of providedIds) {
      if (!existingIds.has(id)) {
        return failure(new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Môn học không thuộc chuyên ngành này',
          { invalidId: id }
        ));
      }
    }

    // Perform reorder
    return majorCourseRepository.reorder(majorId, majorCourseIds);
  },

  /**
   * Toggle required status of a course in a major
   * Requirements: 2.4
   * 
   * @param majorCourseId - MajorCourse ID
   * @returns Updated major course
   */
  async toggleRequired(majorCourseId: string): Promise<Result<MajorCourse>> {
    // Get existing
    const existingResult = await majorCourseRepository.findById(majorCourseId);
    if (!existingResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_COURSE_NOT_FOUND,
        'Không tìm thấy môn học trong chuyên ngành',
        { majorCourseId }
      ));
    }

    // Toggle isRequired
    return majorCourseRepository.update(majorCourseId, {
      isRequired: !existingResult.data.isRequired,
    });
  },

  /**
   * Get required courses count for a major
   * 
   * @param majorId - Major ID
   * @returns Count of required courses
   */
  async getRequiredCoursesCount(majorId: string): Promise<Result<number>> {
    const coursesResult = await majorCourseRepository.findByMajorId(majorId);
    if (!coursesResult.success) {
      return failure(coursesResult.error);
    }

    const requiredCount = coursesResult.data.filter(mc => mc.isRequired).length;
    return success(requiredCount);
  },
};
