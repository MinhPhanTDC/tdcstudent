import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { z } from 'zod';
import { type Result, success, failure, ErrorCode, AppError } from '@tdc/types';
import { type PaginationInput, type PaginationMeta } from '@tdc/schemas';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Base entity interface
 */
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated result
 */
interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Base repository with common CRUD operations
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected readonly collectionName: string;
  protected readonly schema: z.ZodType<T, z.ZodTypeDef, unknown>;

  constructor(collectionName: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
    this.collectionName = collectionName;
    this.schema = schema;
  }

  /**
   * Get collection reference
   */
  protected get collectionRef() {
    return collection(getFirebaseDb(), this.collectionName);
  }

  /**
   * Parse document data with schema validation
   */
  protected parseDocument(docSnap: QueryDocumentSnapshot<DocumentData>): Result<T> {
    const data = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
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
   * Find document by ID
   */
  async findById(id: string): Promise<Result<T>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return failure(new AppError(ErrorCode.USER_NOT_FOUND, `Document not found: ${id}`));
      }

      return this.parseDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Find all documents with optional constraints
   */
  async findAll(constraints: QueryConstraint[] = []): Promise<Result<T[]>> {
    try {
      const q = query(this.collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      const items: T[] = [];
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
   * Find with pagination
   */
  async findPaginated(
    pagination: PaginationInput,
    constraints: QueryConstraint[] = [],
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<Result<PaginatedResult<T>>> {
    try {
      // Build query with pagination
      const baseConstraints = [...constraints, limit(pagination.limit)];

      if (lastDoc) {
        baseConstraints.push(startAfter(lastDoc));
      }

      const q = query(this.collectionRef, ...baseConstraints);
      const snapshot = await getDocs(q);

      const items: T[] = [];
      for (const docSnap of snapshot.docs) {
        const result = this.parseDocument(docSnap);
        if (result.success) {
          items.push(result.data);
        }
      }

      // Get total count (simplified - in production use counter)
      const totalQuery = query(this.collectionRef, ...constraints);
      const totalSnapshot = await getDocs(totalQuery);
      const total = totalSnapshot.size;

      return success({
        items,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      });
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Create new document
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<T>> {
    try {
      const docRef = doc(this.collectionRef);
      const now = new Date();

      const entity = {
        ...data,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
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
        updatedAt: serverTimestamp(),
      });

      return success(parsed.data);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Update existing document
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<Result<T>> {
    try {
      const existing = await this.findById(id);

      if (!existing.success) {
        return existing;
      }

      const updated = {
        ...existing.data,
        ...data,
        updatedAt: new Date(),
      };

      const parsed = this.schema.safeParse(updated);

      if (!parsed.success) {
        return failure(
          new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid update data', {
            errors: parsed.error.flatten(),
          })
        );
      }

      await updateDoc(doc(this.collectionRef, id), {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return success(parsed.data);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }

  /**
   * Delete document
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await deleteDoc(doc(this.collectionRef, id));
      return success(undefined);
    } catch (error) {
      return failure(mapFirebaseError(error));
    }
  }
}

// Re-export query helpers
export { where, orderBy, limit, startAfter };
