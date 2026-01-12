import { where, orderBy, arrayUnion, arrayRemove, limit } from 'firebase/firestore';
import { doc, updateDoc, getDocs, query, collection } from 'firebase/firestore';
import { type Result, success, failure, ErrorCode, AppError } from '@tdc/types';
import {
  StudentSchema,
  type Student,
  type StudentFilter,
  type PaginationInput,
  type PaginationMeta,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Paginated result for students
 */
interface PaginatedStudents {
  items: Student[];
  pagination: PaginationMeta;
}

/**
 * Student repository for Firestore operations
 */
class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super('students', StudentSchema);
  }

  /**
   * Find student by user ID
   */
  async findByUserId(userId: string): Promise<Result<Student | null>> {
    const result = await this.findAll([where('userId', '==', userId)]);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data[0] || null };
  }

  /**
   * Find student by email
   */
  async findByEmail(email: string): Promise<Result<Student | null>> {
    const result = await this.findAll([where('email', '==', email.toLowerCase())]);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data[0] || null };
  }

  /**
   * Find students with filters and pagination
   */
  async findWithFilters(
    filters?: StudentFilter,
    pagination?: PaginationInput
  ): Promise<Result<PaginatedStudents>> {
    try {
      const db = getFirebaseDb();
      const studentsRef = collection(db, this.collectionName);

      // Build base query
      let q = query(studentsRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }
      if (filters?.currentSemesterId) {
        q = query(q, where('currentSemesterId', '==', filters.currentSemesterId));
      }

      // Get total count
      const totalSnapshot = await getDocs(q);
      const total = totalSnapshot.size;

      // Apply pagination
      const page = pagination?.page || 1;
      const pageLimit = pagination?.limit || 20;
      const offset = (page - 1) * pageLimit;

      // Get paginated results
      const paginatedQuery = query(q, limit(pageLimit));
      const snapshot = await getDocs(paginatedQuery);

      const items: Student[] = [];
      snapshot.docs.slice(offset, offset + pageLimit).forEach((docSnap) => {
        const result = this.parseDocument(docSnap);
        if (result.success) {
          items.push(result.data);
        }
      });

      return success({
        items,
        pagination: {
          page,
          limit: pageLimit,
          total,
          totalPages: Math.ceil(total / pageLimit),
        },
      });
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Search students by name or email
   */
  async search(searchQuery: string): Promise<Result<Student[]>> {
    try {
      // Firestore doesn't support full-text search, so we fetch all and filter
      // In production, consider using Algolia or similar
      const result = await this.findAll([orderBy('displayName', 'asc')]);

      if (!result.success) {
        return result;
      }

      const query = searchQuery.toLowerCase();
      const filtered = result.data.filter(
        (student) =>
          student.displayName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );

      return success(filtered);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Find students enrolled in a course
   */
  async findByCourse(courseId: string): Promise<Result<Student[]>> {
    return this.findAll([where('enrolledCourses', 'array-contains', courseId)]);
  }

  /**
   * Find students by current semester
   */
  async findBySemester(semesterId: string): Promise<Result<Student[]>> {
    return this.findAll([where('currentSemesterId', '==', semesterId)]);
  }

  /**
   * Find active students
   */
  async findActive(): Promise<Result<Student[]>> {
    return this.findAll([where('isActive', '==', true), orderBy('createdAt', 'desc')]);
  }

  /**
   * Find recent students (for dashboard)
   */
  async findRecent(count: number = 5): Promise<Result<Student[]>> {
    return this.findAll([orderBy('createdAt', 'desc'), limit(count)]);
  }

  /**
   * Count students enrolled this month
   */
  async countNewThisMonth(): Promise<Result<number>> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const result = await this.findAll([where('enrolledAt', '>=', startOfMonth)]);

      if (!result.success) {
        return failure(result.error);
      }

      return success(result.data.length);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Count total students
   */
  async countTotal(): Promise<Result<number>> {
    try {
      const db = getFirebaseDb();
      const snapshot = await getDocs(collection(db, this.collectionName));
      return success(snapshot.size);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Deactivate student account
   */
  async deactivate(studentId: string): Promise<Result<Student>> {
    return this.update(studentId, { isActive: false });
  }

  /**
   * Activate student account
   */
  async activate(studentId: string): Promise<Result<Student>> {
    return this.update(studentId, { isActive: true });
  }

  /**
   * Toggle student active status
   */
  async toggleActive(studentId: string): Promise<Result<Student>> {
    const studentResult = await this.findById(studentId);
    if (!studentResult.success) {
      return studentResult;
    }

    return this.update(studentId, { isActive: !studentResult.data.isActive });
  }

  /**
   * Update student's current semester
   */
  async updateCurrentSemester(studentId: string, semesterId: string): Promise<Result<Student>> {
    return this.update(studentId, { currentSemesterId: semesterId });
  }

  /**
   * Set student's selected major with timestamp
   * Requirements: 4.5 - Updates both selectedMajorId and majorSelectedAt
   */
  async setSelectedMajor(studentId: string, majorId: string): Promise<Result<Student>> {
    return this.update(studentId, { 
      selectedMajorId: majorId,
      majorSelectedAt: new Date(),
    });
  }

  /**
   * Clear student's selected major (admin override)
   * Requirements: 6.3 - Allows re-selection
   */
  async clearSelectedMajor(studentId: string): Promise<Result<Student>> {
    return this.update(studentId, { 
      selectedMajorId: undefined,
      majorSelectedAt: undefined,
    });
  }

  /**
   * Enroll student in a course
   */
  async enrollInCourse(studentId: string, courseId: string): Promise<Result<void>> {
    try {
      const docRef = doc(getFirebaseDb(), this.collectionName, studentId);

      await updateDoc(docRef, {
        enrolledCourses: arrayUnion(courseId),
        [`progress.${courseId}`]: 0,
      });

      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Unenroll student from a course
   */
  async unenrollFromCourse(studentId: string, courseId: string): Promise<Result<void>> {
    try {
      const docRef = doc(getFirebaseDb(), this.collectionName, studentId);

      await updateDoc(docRef, {
        enrolledCourses: arrayRemove(courseId),
      });

      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Update student progress for a course
   */
  async updateProgress(studentId: string, courseId: string, progress: number): Promise<Result<void>> {
    try {
      if (progress < 0 || progress > 100) {
        return failure(new AppError(ErrorCode.INVALID_INPUT, 'Progress must be between 0 and 100'));
      }

      const docRef = doc(getFirebaseDb(), this.collectionName, studentId);

      await updateDoc(docRef, {
        [`progress.${courseId}`]: progress,
      });

      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<Result<boolean>> {
    const result = await this.findByEmail(email);
    if (!result.success) {
      return failure(result.error);
    }
    return success(result.data !== null);
  }
}

// Singleton export
export const studentRepository = new StudentRepository();
