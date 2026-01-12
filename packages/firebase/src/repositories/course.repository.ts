import { where, orderBy, writeBatch, doc, getDocs, query, collection } from 'firebase/firestore';
import { updateDoc, arrayUnion } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import { CourseSchema, type Course, type Lesson, type CreateCourseInput } from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Course repository for Firestore operations
 */
class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super('courses', CourseSchema);
  }

  /**
   * Find all courses sorted by order
   */
  async findAllSorted(): Promise<Result<Course[]>> {
    return this.findAll([orderBy('order', 'asc')]);
  }

  /**
   * Find courses by semester ID sorted by order
   */
  async findBySemester(semesterId: string): Promise<Result<Course[]>> {
    return this.findAll([where('semesterId', '==', semesterId), orderBy('order', 'asc')]);
  }

  /**
   * Find active courses by semester
   */
  async findActiveBySemester(semesterId: string): Promise<Result<Course[]>> {
    return this.findAll([
      where('semesterId', '==', semesterId),
      where('isActive', '==', true),
      orderBy('order', 'asc'),
    ]);
  }

  /**
   * Find published courses (legacy support)
   */
  async findPublished(): Promise<Result<Course[]>> {
    return this.findAll([where('isActive', '==', true), orderBy('createdAt', 'desc')]);
  }

  /**
   * Find courses by IDs
   */
  async findByIds(ids: string[]): Promise<Result<Course[]>> {
    if (ids.length === 0) {
      return success([]);
    }

    // Firestore 'in' query limited to 10 items
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }

    const allCourses: Course[] = [];

    for (const chunk of chunks) {
      const result = await this.findAll([where('__name__', 'in', chunk)]);
      if (result.success) {
        allCourses.push(...result.data);
      }
    }

    return success(allCourses);
  }

  /**
   * Create course with semester validation
   */
  async createCourse(data: CreateCourseInput): Promise<Result<Course>> {
    // Validate semester exists
    const db = getFirebaseDb();
    const semesterSnap = await getDocs(query(collection(db, 'semesters'), where('__name__', '==', data.semesterId)));

    if (semesterSnap.empty) {
      return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Học kỳ không tồn tại', { field: 'semesterId' }));
    }

    // Get next order if not provided
    let order = data.order;
    if (order === undefined || order === 0) {
      const nextOrderResult = await this.getNextOrderInSemester(data.semesterId);
      if (nextOrderResult.success) {
        order = nextOrderResult.data;
      }
    }

    return this.create({ ...data, order, lessons: [] });
  }

  /**
   * Get next available order number in a semester
   */
  async getNextOrderInSemester(semesterId: string): Promise<Result<number>> {
    const result = await this.findBySemester(semesterId);
    if (!result.success) {
      return failure(result.error);
    }

    if (result.data.length === 0) {
      return success(0);
    }

    const maxOrder = Math.max(...result.data.map((c) => c.order));
    return success(maxOrder + 1);
  }

  /**
   * Reorder courses within a semester atomically
   * @param _semesterId Semester ID (for documentation)
   * @param courseIds Array of course IDs in new order
   */
  async reorderInSemester(_semesterId: string, courseIds: string[]): Promise<Result<void>> {
    try {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      courseIds.forEach((id, index) => {
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
   * Move course to different semester
   * Sets order to last position in target semester
   */
  async moveToSemester(courseId: string, newSemesterId: string): Promise<Result<Course>> {
    // Validate target semester exists
    const db = getFirebaseDb();
    const semesterSnap = await getDocs(
      query(collection(db, 'semesters'), where('__name__', '==', newSemesterId))
    );

    if (semesterSnap.empty) {
      return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Học kỳ đích không tồn tại'));
    }

    // Get next order in target semester
    const nextOrderResult = await this.getNextOrderInSemester(newSemesterId);
    if (!nextOrderResult.success) {
      return failure(nextOrderResult.error);
    }

    return this.update(courseId, {
      semesterId: newSemesterId,
      order: nextOrderResult.data,
    });
  }

  /**
   * Add lesson to course
   */
  async addLesson(courseId: string, lesson: Lesson): Promise<Result<void>> {
    try {
      const docRef = doc(getFirebaseDb(), this.collectionName, courseId);

      await updateDoc(docRef, {
        lessons: arrayUnion(lesson),
      });

      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Update course lessons
   */
  async updateLessons(courseId: string, lessons: Lesson[]): Promise<Result<void>> {
    try {
      const docRef = doc(getFirebaseDb(), this.collectionName, courseId);

      await updateDoc(docRef, { lessons });

      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Toggle course active status
   */
  async toggleActive(id: string): Promise<Result<Course>> {
    const courseResult = await this.findById(id);
    if (!courseResult.success) {
      return courseResult;
    }

    return this.update(id, { isActive: !courseResult.data.isActive });
  }

  /**
   * Publish/unpublish course (legacy support)
   */
  async setPublished(courseId: string, isPublished: boolean): Promise<Result<void>> {
    try {
      const docRef = doc(getFirebaseDb(), this.collectionName, courseId);

      await updateDoc(docRef, { isActive: isPublished });

      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }
}

// Singleton export
export const courseRepository = new CourseRepository();
