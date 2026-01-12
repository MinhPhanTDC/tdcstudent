import {
  where,
  orderBy,
  writeBatch,
  doc,
  getDocs,
  query,
  collection,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  MajorCourseSchema,
  type MajorCourse,
  type CreateMajorCourseInput,
  type UpdateMajorCourseInput,
} from '@tdc/schemas';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * MajorCourse repository for Firestore operations
 * Handles linking courses to majors with ordering and requirement type
 */
class MajorCourseRepository {
  private readonly collectionName = 'majorCourses';
  private readonly schema = MajorCourseSchema;

  /**
   * Get collection reference
   */
  private get collectionRef() {
    return collection(getFirebaseDb(), this.collectionName);
  }

  /**
   * Parse document data with schema validation
   */
  private parseDocument(docSnap: { id: string; data: () => Record<string, unknown> }): Result<MajorCourse> {
    const rawData = docSnap.data();
    const data = {
      id: docSnap.id,
      ...rawData,
      createdAt: (rawData.createdAt as { toDate?: () => Date })?.toDate?.() ?? rawData.createdAt,
    };

    const parsed = this.schema.safeParse(data);

    if (!parsed.success) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid document data', {
          errors: parsed.error.flatten(),
        })
      );
    }

    return success(parsed.data);
  }

  /**
   * Find all courses for a specific major, sorted by order
   */
  async findByMajorId(majorId: string): Promise<Result<MajorCourse[]>> {
    try {
      const q = query(
        this.collectionRef,
        where('majorId', '==', majorId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);

      const items: MajorCourse[] = [];
      for (const docSnap of snapshot.docs) {
        const result = this.parseDocument(docSnap);
        if (result.success) {
          items.push(result.data);
        }
      }

      return success(items);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Find a specific major-course link
   */
  async findById(id: string): Promise<Result<MajorCourse>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return failure(
          new AppError(ErrorCode.USER_NOT_FOUND, 'Không tìm thấy môn học trong chuyên ngành')
        );
      }

      return this.parseDocument(docSnap);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Find by major and course combination
   */
  async findByMajorAndCourse(majorId: string, courseId: string): Promise<Result<MajorCourse | null>> {
    try {
      const q = query(
        this.collectionRef,
        where('majorId', '==', majorId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return success(null);
      }

      return this.parseDocument(snapshot.docs[0]);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Get the next available order number for a major
   */
  async getNextOrder(majorId: string): Promise<Result<number>> {
    const result = await this.findByMajorId(majorId);
    if (!result.success) {
      return failure(result.error);
    }

    if (result.data.length === 0) {
      return success(0);
    }

    const maxOrder = Math.max(...result.data.map((mc) => mc.order));
    return success(maxOrder + 1);
  }

  /**
   * Create a new major-course link
   * Validates no duplicate course in the same major
   */
  async create(data: CreateMajorCourseInput): Promise<Result<MajorCourse>> {
    try {
      // Check for duplicate
      const existingResult = await this.findByMajorAndCourse(data.majorId, data.courseId);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      if (existingResult.data) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Môn học đã có trong chuyên ngành', {
            field: 'courseId',
            existingId: existingResult.data.id,
          })
        );
      }

      // Get next order if not provided or is 0
      let order = data.order;
      if (order === undefined || order === 0) {
        const nextOrderResult = await this.getNextOrder(data.majorId);
        if (nextOrderResult.success) {
          order = nextOrderResult.data;
        }
      }

      const docRef = doc(this.collectionRef);
      const now = new Date();

      const entity: MajorCourse = {
        id: docRef.id,
        majorId: data.majorId,
        courseId: data.courseId,
        order: order ?? 0,
        isRequired: data.isRequired ?? true,
        createdAt: now,
      };

      const parsed = this.schema.safeParse(entity);
      if (!parsed.success) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input data', {
            errors: parsed.error.flatten(),
          })
        );
      }

      await setDoc(docRef, {
        ...parsed.data,
        createdAt: serverTimestamp(),
      });

      return success(parsed.data);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Update a major-course link (order and isRequired only)
   */
  async update(id: string, data: Omit<UpdateMajorCourseInput, 'id'>): Promise<Result<MajorCourse>> {
    try {
      const existingResult = await this.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      const updated: MajorCourse = {
        ...existingResult.data,
        ...data,
      };

      const parsed = this.schema.safeParse(updated);
      if (!parsed.success) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid update data', {
            errors: parsed.error.flatten(),
          })
        );
      }

      const docRef = doc(this.collectionRef, id);
      const updateData: Record<string, unknown> = {};
      
      if (data.order !== undefined) {
        updateData.order = data.order;
      }
      if (data.isRequired !== undefined) {
        updateData.isRequired = data.isRequired;
      }

      if (Object.keys(updateData).length > 0) {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(docRef, updateData);
      }

      return success(parsed.data);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Delete a major-course link
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Reorder courses within a major atomically
   * Updates order fields to form a valid sequence (0, 1, 2, ...)
   * @param majorId Major ID
   * @param majorCourseIds Array of MajorCourse IDs in new order
   */
  async reorder(majorId: string, majorCourseIds: string[]): Promise<Result<void>> {
    try {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      // Validate all IDs belong to the same major
      const existingResult = await this.findByMajorId(majorId);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      const existingIds = new Set(existingResult.data.map((mc) => mc.id));

      // Check that all provided IDs exist in this major
      for (const id of majorCourseIds) {
        if (!existingIds.has(id)) {
          return failure(
            new AppError(ErrorCode.VALIDATION_ERROR, 'Môn học không thuộc chuyên ngành này', {
              invalidId: id,
            })
          );
        }
      }

      // Update order for each course
      majorCourseIds.forEach((id, index) => {
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
   * Remove all courses from a major
   * Used when deleting a major
   */
  async deleteByMajorId(majorId: string): Promise<Result<void>> {
    try {
      const coursesResult = await this.findByMajorId(majorId);
      if (!coursesResult.success) {
        return failure(coursesResult.error);
      }

      if (coursesResult.data.length === 0) {
        return success(undefined);
      }

      const db = getFirebaseDb();
      const batch = writeBatch(db);

      for (const mc of coursesResult.data) {
        const docRef = doc(db, this.collectionName, mc.id);
        batch.delete(docRef);
      }

      await batch.commit();
      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }
}

// Singleton export
export const majorCourseRepository = new MajorCourseRepository();
