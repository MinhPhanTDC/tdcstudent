import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type Major,
  type CreateMajorInput,
  type UpdateMajorInput,
} from '@tdc/schemas';
import { majorRepository } from '../repositories/major.repository';
import { majorCourseRepository } from '../repositories/major-course.repository';

/**
 * Sort majors: active first, then alphabetically by name
 * Requirements: 1.6
 */
export function sortMajors(majors: Major[]): Major[] {
  return [...majors].sort((a, b) => {
    // Active majors first
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    // Then alphabetically by name
    return a.name.localeCompare(b.name, 'vi');
  });
}

/**
 * Major service for business logic operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6
 */
export const majorService = {
  /**
   * Get all majors sorted by active status and name
   * Requirements: 1.2, 1.6
   * 
   * @returns Sorted list of majors (active first, then alphabetically)
   */
  async getMajors(): Promise<Result<Major[]>> {
    const result = await majorRepository.findAllSorted();
    if (!result.success) {
      return failure(result.error);
    }
    // Apply additional sorting to ensure consistency
    return success(sortMajors(result.data));
  },

  /**
   * Get only active majors sorted by name
   * Requirements: 1.2, 1.6
   * 
   * @returns List of active majors sorted alphabetically
   */
  async getActiveMajors(): Promise<Result<Major[]>> {
    return majorRepository.findActive();
  },

  /**
   * Get a single major by ID
   * Requirements: 1.2
   * 
   * @param id - Major ID
   * @returns Major if found
   */
  async getMajor(id: string): Promise<Result<Major>> {
    const result = await majorRepository.findById(id);
    if (!result.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId: id }
      ));
    }
    return result;
  },

  /**
   * Create a new major
   * Requirements: 1.1, 1.5
   * 
   * Validates:
   * - Name is not empty or whitespace only
   * - Name is unique
   * 
   * @param input - Major creation data
   * @returns Created major
   */
  async createMajor(input: CreateMajorInput): Promise<Result<Major>> {
    // Validate name is not empty or whitespace
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return failure(new AppError(
        ErrorCode.MAJOR_NAME_REQUIRED,
        'Tên chuyên ngành không được để trống',
        { field: 'name' }
      ));
    }

    // Create major (repository handles uniqueness check)
    return majorRepository.createMajor({
      ...input,
      name: trimmedName,
    });
  },

  /**
   * Update an existing major
   * Requirements: 1.3
   * 
   * Validates:
   * - Major exists
   * - Name is not empty if provided
   * - Name is unique if changed
   * 
   * @param input - Major update data with ID
   * @returns Updated major
   */
  async updateMajor(input: UpdateMajorInput): Promise<Result<Major>> {
    const { id, ...updateData } = input;

    // Check major exists
    const existingResult = await majorRepository.findById(id);
    if (!existingResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId: id }
      ));
    }

    // Validate name if provided
    if (updateData.name !== undefined) {
      const trimmedName = updateData.name.trim();
      if (!trimmedName) {
        return failure(new AppError(
          ErrorCode.MAJOR_NAME_REQUIRED,
          'Tên chuyên ngành không được để trống',
          { field: 'name' }
        ));
      }
      updateData.name = trimmedName;
    }

    // Update major (repository handles uniqueness check)
    return majorRepository.updateMajor(id, updateData);
  },

  /**
   * Soft delete a major
   * Requirements: 1.4
   * 
   * Sets isActive to false while preserving all data.
   * Does NOT delete associated MajorCourse records.
   * 
   * @param id - Major ID to delete
   * @returns Updated major with isActive=false
   */
  async deleteMajor(id: string): Promise<Result<Major>> {
    // Check major exists
    const existingResult = await majorRepository.findById(id);
    if (!existingResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId: id }
      ));
    }

    // Soft delete (preserves data)
    return majorRepository.softDelete(id);
  },

  /**
   * Restore a soft-deleted major
   * 
   * @param id - Major ID to restore
   * @returns Updated major with isActive=true
   */
  async restoreMajor(id: string): Promise<Result<Major>> {
    // Check major exists
    const existingResult = await majorRepository.findById(id);
    if (!existingResult.success) {
      return failure(new AppError(
        ErrorCode.MAJOR_NOT_FOUND,
        'Không tìm thấy chuyên ngành',
        { majorId: id }
      ));
    }

    return majorRepository.restore(id);
  },

  /**
   * Get course count for a major
   * 
   * @param majorId - Major ID
   * @returns Number of courses in the major
   */
  async getCourseCount(majorId: string): Promise<Result<number>> {
    const coursesResult = await majorCourseRepository.findByMajorId(majorId);
    if (!coursesResult.success) {
      return failure(coursesResult.error);
    }
    return success(coursesResult.data.length);
  },
};
