import { where, orderBy, writeBatch, doc, getDocs, query, collection } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import { SemesterSchema, type Semester, type CreateSemesterInput } from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Semester repository for Firestore operations
 */
class SemesterRepository extends BaseRepository<Semester> {
  constructor() {
    super('semesters', SemesterSchema);
  }

  /**
   * Find all semesters sorted by order
   */
  async findAllSorted(): Promise<Result<Semester[]>> {
    return this.findAll([orderBy('order', 'asc')]);
  }

  /**
   * Find active semesters sorted by order
   */
  async findActive(): Promise<Result<Semester[]>> {
    return this.findAll([where('isActive', '==', true), orderBy('order', 'asc')]);
  }

  /**
   * Create semester with duplicate order check
   */
  async createSemester(data: CreateSemesterInput): Promise<Result<Semester>> {
    // Check for duplicate order
    const existingResult = await this.findAll([where('order', '==', data.order)]);
    if (existingResult.success && existingResult.data.length > 0) {
      return failure(
        new AppError(ErrorCode.DUPLICATE_SEMESTER_ORDER, 'Thứ tự học kỳ đã tồn tại', {
          field: 'order',
          existingOrder: data.order,
        })
      );
    }

    return this.create(data);
  }

  /**
   * Check if semester has associated courses
   */
  async hasAssociatedCourses(semesterId: string): Promise<Result<boolean>> {
    try {
      const db = getFirebaseDb();
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('semesterId', '==', semesterId));
      const snapshot = await getDocs(q);

      return success(snapshot.size > 0);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Get courses count for a semester
   */
  async getCoursesCount(semesterId: string): Promise<Result<number>> {
    try {
      const db = getFirebaseDb();
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('semesterId', '==', semesterId));
      const snapshot = await getDocs(q);

      return success(snapshot.size);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Delete semester with dependency check
   * Requirements: 1.5, 1.6, 7.4
   */
  async deleteSemester(id: string): Promise<Result<void>> {
    // First check if semester exists
    const semesterResult = await this.findById(id);
    if (!semesterResult.success) {
      return failure(new AppError(ErrorCode.SEMESTER_NOT_FOUND, 'Không tìm thấy học kỳ'));
    }

    // Check for associated courses
    const hasCoursesResult = await this.hasAssociatedCourses(id);
    if (!hasCoursesResult.success) {
      return failure(hasCoursesResult.error);
    }

    if (hasCoursesResult.data) {
      // Get course count for better error message
      const countResult = await this.getCoursesCount(id);
      const courseCount = countResult.success ? countResult.data : 0;
      
      return failure(
        new AppError(
          ErrorCode.SEMESTER_HAS_COURSES,
          `Không thể xóa học kỳ đang có ${courseCount} môn học. Vui lòng xóa hoặc chuyển các môn học trước.`,
          { courseCount }
        )
      );
    }

    return this.delete(id);
  }

  /**
   * Reorder semesters atomically
   * @param ids Array of semester IDs in new order
   */
  async reorder(ids: string[]): Promise<Result<void>> {
    try {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      ids.forEach((id, index) => {
        const docRef = doc(db, this.collectionName, id);
        batch.update(docRef, { order: index });
      });

      await batch.commit();
      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Toggle semester active status
   */
  async toggleActive(id: string): Promise<Result<Semester>> {
    const semesterResult = await this.findById(id);
    if (!semesterResult.success) {
      return failure(new AppError(ErrorCode.SEMESTER_NOT_FOUND, 'Không tìm thấy học kỳ'));
    }

    return this.update(id, { isActive: !semesterResult.data.isActive });
  }

  /**
   * Set major selection requirement
   */
  async setRequiresMajorSelection(id: string, requires: boolean): Promise<Result<Semester>> {
    return this.update(id, { requiresMajorSelection: requires });
  }

  /**
   * Get next available order number
   */
  async getNextOrder(): Promise<Result<number>> {
    const result = await this.findAllSorted();
    if (!result.success) {
      return failure(result.error);
    }

    if (result.data.length === 0) {
      return success(0);
    }

    const maxOrder = Math.max(...result.data.map((s) => s.order));
    return success(maxOrder + 1);
  }
}

// Singleton export
export const semesterRepository = new SemesterRepository();
