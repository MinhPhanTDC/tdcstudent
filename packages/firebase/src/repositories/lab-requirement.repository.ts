import { where, orderBy, writeBatch, doc } from 'firebase/firestore';
import { type Result, success, failure } from '@tdc/types';
import {
  LabRequirementSchema,
  type LabRequirement,
  type CreateLabRequirementInput,
  type UpdateLabRequirementInput,
} from '@tdc/schemas';
import { BaseRepository } from './base.repository';
import { getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';

/**
 * Lab Requirement repository for Firestore operations
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6
 */
class LabRequirementRepository extends BaseRepository<LabRequirement> {
  constructor() {
    super('labRequirements', LabRequirementSchema);
  }

  /**
   * Find all lab requirements sorted by order
   * Requirements: 3.1
   */
  async findAllSorted(): Promise<Result<LabRequirement[]>> {
    return this.findAll([orderBy('order', 'asc')]);
  }

  /**
   * Find only active lab requirements sorted by order
   * Requirements: 1.1, 1.5, 3.5
   */
  async findActive(): Promise<Result<LabRequirement[]>> {
    return this.findAll([where('isActive', '==', true), orderBy('order', 'asc')]);
  }

  /**
   * Create a new lab requirement
   * Requirements: 3.2
   */
  async createRequirement(data: CreateLabRequirementInput): Promise<Result<LabRequirement>> {
    // Get next order if not provided or is 0
    let order = data.order;
    if (order === undefined || order === 0) {
      const nextOrderResult = await this.getNextOrder();
      if (nextOrderResult.success) {
        order = nextOrderResult.data;
      }
    }

    return this.create({ ...data, order });
  }

  /**
   * Update an existing lab requirement
   * Requirements: 3.3
   */
  async updateRequirement(
    id: string,
    data: Omit<UpdateLabRequirementInput, 'id'>
  ): Promise<Result<LabRequirement>> {
    return this.update(id, data);
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

    const maxOrder = Math.max(...result.data.map((r) => r.order));
    return success(maxOrder + 1);
  }

  /**
   * Reorder requirements atomically
   * Requirements: 3.6
   * 
   * @param requirementIds Array of requirement IDs in new order
   * @returns Result with void on success
   */
  async reorder(requirementIds: string[]): Promise<Result<void>> {
    try {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      requirementIds.forEach((id, index) => {
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
   * Toggle active status of a requirement
   * Requirements: 3.5
   */
  async toggleActive(id: string): Promise<Result<LabRequirement>> {
    const requirementResult = await this.findById(id);
    if (!requirementResult.success) {
      return requirementResult;
    }

    return this.update(id, { isActive: !requirementResult.data.isActive });
  }

  /**
   * Delete a requirement and return its ID for cascade operations
   * Requirements: 3.4
   */
  async deleteRequirement(id: string): Promise<Result<string>> {
    const deleteResult = await this.delete(id);
    if (!deleteResult.success) {
      return failure(deleteResult.error);
    }
    return success(id);
  }

  /**
   * Get all requirement IDs for cascade delete operations
   */
  async getAllIds(): Promise<Result<string[]>> {
    const result = await this.findAllSorted();
    if (!result.success) {
      return failure(result.error);
    }
    return success(result.data.map((r) => r.id));
  }
}

// Singleton export
export const labRequirementRepository = new LabRequirementRepository();
