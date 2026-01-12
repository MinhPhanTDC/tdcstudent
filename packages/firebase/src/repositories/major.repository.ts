import { where, orderBy } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import { MajorSchema, type Major, type CreateMajorInput } from '@tdc/schemas';
import { BaseRepository } from './base.repository';

/**
 * Major repository for Firestore operations
 * Handles CRUD operations for design specializations (Graphic Design, UI/UX, etc.)
 */
class MajorRepository extends BaseRepository<Major> {
  constructor() {
    super('majors', MajorSchema);
  }

  /**
   * Find all majors sorted by active status (active first) then by name
   */
  async findAllSorted(): Promise<Result<Major[]>> {
    return super.findAll([orderBy('isActive', 'desc'), orderBy('name', 'asc')]);
  }

  /**
   * Find all active majors sorted by name
   */
  async findActive(): Promise<Result<Major[]>> {
    return super.findAll([where('isActive', '==', true), orderBy('name', 'asc')]);
  }

  /**
   * Find major by name (case-sensitive exact match)
   */
  async findByName(name: string): Promise<Result<Major | null>> {
    const result = await super.findAll([where('name', '==', name)]);

    if (!result.success) {
      return failure(result.error);
    }

    return success(result.data.length > 0 ? result.data[0] : null);
  }

  /**
   * Create a new major with name uniqueness validation
   */
  async createMajor(data: CreateMajorInput): Promise<Result<Major>> {
    // Validate name is not empty or whitespace only
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Tên chuyên ngành không được để trống', {
          field: 'name',
        })
      );
    }

    // Check for duplicate name
    const existingResult = await this.findByName(trimmedName);
    if (!existingResult.success) {
      return failure(existingResult.error);
    }

    if (existingResult.data) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Chuyên ngành đã tồn tại', {
          field: 'name',
          existingId: existingResult.data.id,
        })
      );
    }

    return this.create({
      ...data,
      name: trimmedName,
    });
  }

  /**
   * Update major with name uniqueness validation
   */
  async updateMajor(id: string, data: Partial<Omit<Major, 'id' | 'createdAt'>>): Promise<Result<Major>> {
    // If updating name, validate uniqueness
    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Tên chuyên ngành không được để trống', {
            field: 'name',
          })
        );
      }

      const existingResult = await this.findByName(trimmedName);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Allow if no existing major with this name, or if it's the same major
      if (existingResult.data && existingResult.data.id !== id) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Chuyên ngành đã tồn tại', {
            field: 'name',
            existingId: existingResult.data.id,
          })
        );
      }

      data.name = trimmedName;
    }

    return this.update(id, data);
  }

  /**
   * Soft delete major by setting isActive to false
   * Preserves all data for historical reference
   */
  async softDelete(id: string): Promise<Result<Major>> {
    const existingResult = await this.findById(id);
    if (!existingResult.success) {
      return existingResult;
    }

    return this.update(id, { isActive: false });
  }

  /**
   * Restore a soft-deleted major
   */
  async restore(id: string): Promise<Result<Major>> {
    return this.update(id, { isActive: true });
  }
}

// Singleton export
export const majorRepository = new MajorRepository();
