import { where, orderBy, writeBatch, doc, getDocs, query, collection } from 'firebase/firestore';
import { type Result, success, failure } from '@tdc/types';
import {
  StudentLabProgressSchema,
  type StudentLabProgress,
  type CreateStudentLabProgressInput,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Lab Progress repository for Firestore operations
 * Requirements: 1.2, 2.1, 2.2, 4.1
 */
class LabProgressRepository extends BaseRepository<StudentLabProgress> {
  constructor() {
    super('studentLabProgress', StudentLabProgressSchema);
  }

  /**
   * Find all progress records for a student
   * Requirements: 1.2
   */
  async findByStudent(studentId: string): Promise<Result<StudentLabProgress[]>> {
    return this.findAll([where('studentId', '==', studentId)]);
  }

  /**
   * Find all progress records for a requirement
   * Used for cascade delete operations
   */
  async findByRequirement(requirementId: string): Promise<Result<StudentLabProgress[]>> {
    return this.findAll([where('requirementId', '==', requirementId)]);
  }

  /**
   * Find pending verifications (status = 'pending')
   * Requirements: 4.1
   */
  async findPending(): Promise<Result<StudentLabProgress[]>> {
    return this.findAll([where('status', '==', 'pending'), orderBy('updatedAt', 'desc')]);
  }

  /**
   * Find progress record by student and requirement
   */
  async findByStudentAndRequirement(
    studentId: string,
    requirementId: string
  ): Promise<Result<StudentLabProgress | null>> {
    const result = await this.findAll([
      where('studentId', '==', studentId),
      where('requirementId', '==', requirementId),
    ]);

    if (!result.success) {
      return failure(result.error);
    }

    return success(result.data.length > 0 ? result.data[0] : null);
  }

  /**
   * Create a new progress record
   */
  async createProgress(data: CreateStudentLabProgressInput): Promise<Result<StudentLabProgress>> {
    return this.create(data);
  }

  /**
   * Delete all progress records for a requirement (cascade delete)
   * Requirements: 3.4
   */
  async deleteByRequirement(requirementId: string): Promise<Result<number>> {
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, this.collectionName),
        where('requirementId', '==', requirementId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return success(0);
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(doc(db, this.collectionName, docSnap.id));
      });

      await batch.commit();
      return success(snapshot.size);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Update progress status
   */
  async updateStatus(
    id: string,
    status: StudentLabProgress['status'],
    additionalData?: Partial<StudentLabProgress>
  ): Promise<Result<StudentLabProgress>> {
    return this.update(id, { status, ...additionalData });
  }
}

// Singleton export
export const labProgressRepository = new LabProgressRepository();
