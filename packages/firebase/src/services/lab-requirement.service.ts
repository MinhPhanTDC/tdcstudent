import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type LabRequirement,
  type CreateLabRequirementInput,
  type UpdateLabRequirementInput,
  CreateLabRequirementInputSchema,
} from '@tdc/schemas';
import { labRequirementRepository } from '../repositories/lab-requirement.repository';
import { labProgressRepository } from '../repositories/lab-progress.repository';

/**
 * Result of a delete operation with cascade information
 */
export interface DeleteRequirementResult {
  deletedRequirementId: string;
  deletedProgressCount: number;
}

/**
 * Result of a reorder operation
 */
export interface ReorderResult {
  reorderedIds: string[];
  newOrderMap: Map<string, number>;
}

/**
 * Validates title length bounds
 * Requirements: 3.2
 * 
 * @param title - The title string to validate
 * @returns true if title length is between 1 and 200 characters inclusive
 */
export function validateTitleBounds(title: string): boolean {
  return title.length >= 1 && title.length <= 200;
}

/**
 * Validates that order values form a contiguous sequence starting from 0
 * Requirements: 3.6
 * 
 * @param orders - Array of order values
 * @returns true if orders form a valid contiguous sequence
 */
export function validateOrderSequence(orders: number[]): boolean {
  if (orders.length === 0) return true;
  
  const sorted = [...orders].sort((a, b) => a - b);
  
  // Check that sequence starts at 0 and is contiguous
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generates a contiguous order sequence for a list of IDs
 * Requirements: 3.6
 * 
 * @param ids - Array of requirement IDs in desired order
 * @returns Map of ID to new order value
 */
export function generateOrderSequence(ids: string[]): Map<string, number> {
  const orderMap = new Map<string, number>();
  ids.forEach((id, index) => {
    orderMap.set(id, index);
  });
  return orderMap;
}

/**
 * Lab Requirement Service
 * Handles business logic for lab requirement management
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6
 */
export const labRequirementService = {
  /**
   * Create a new lab requirement
   * Requirements: 3.2
   * 
   * @param data - The requirement data to create
   * @returns Result with created requirement or error
   */
  async createRequirement(
    data: CreateLabRequirementInput
  ): Promise<Result<LabRequirement>> {
    // Validate input with schema
    const validation = CreateLabRequirementInputSchema.safeParse(data);
    if (!validation.success) {
      return failure(
        new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid requirement data', {
          errors: validation.error.flatten(),
        })
      );
    }

    // Validate title bounds explicitly
    if (!validateTitleBounds(data.title)) {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Title must be between 1 and 200 characters',
          { field: 'title', length: data.title.length }
        )
      );
    }

    return labRequirementRepository.createRequirement(validation.data);
  },

  /**
   * Update an existing lab requirement
   * Requirements: 3.3
   * 
   * @param id - The requirement ID to update
   * @param data - The data to update
   * @returns Result with updated requirement or error
   */
  async updateRequirement(
    id: string,
    data: Omit<UpdateLabRequirementInput, 'id'>
  ): Promise<Result<LabRequirement>> {
    // Validate title bounds if title is being updated
    if (data.title !== undefined && !validateTitleBounds(data.title)) {
      return failure(
        new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Title must be between 1 and 200 characters',
          { field: 'title', length: data.title.length }
        )
      );
    }

    return labRequirementRepository.updateRequirement(id, data);
  },

  /**
   * Delete a lab requirement and cascade delete related progress records
   * Requirements: 3.4
   * 
   * @param id - The requirement ID to delete
   * @returns Result with delete information or error
   */
  async deleteRequirement(id: string): Promise<Result<DeleteRequirementResult>> {
    // First, cascade delete all related progress records
    const cascadeResult = await labProgressRepository.deleteByRequirement(id);
    if (!cascadeResult.success) {
      return failure(cascadeResult.error);
    }

    // Then delete the requirement itself
    const deleteResult = await labRequirementRepository.deleteRequirement(id);
    if (!deleteResult.success) {
      return failure(deleteResult.error);
    }

    return success({
      deletedRequirementId: id,
      deletedProgressCount: cascadeResult.data,
    });
  },

  /**
   * Toggle the active status of a requirement
   * Requirements: 3.5
   * 
   * @param id - The requirement ID to toggle
   * @returns Result with updated requirement or error
   */
  async toggleActive(id: string): Promise<Result<LabRequirement>> {
    return labRequirementRepository.toggleActive(id);
  },

  /**
   * Reorder requirements to maintain contiguous sequence
   * Requirements: 3.6
   * 
   * @param requirementIds - Array of requirement IDs in new order
   * @returns Result with reorder information or error
   */
  async reorderRequirements(requirementIds: string[]): Promise<Result<ReorderResult>> {
    if (requirementIds.length === 0) {
      return success({
        reorderedIds: [],
        newOrderMap: new Map(),
      });
    }

    // Generate new order sequence
    const newOrderMap = generateOrderSequence(requirementIds);

    // Perform the reorder operation
    const reorderResult = await labRequirementRepository.reorder(requirementIds);
    if (!reorderResult.success) {
      return failure(reorderResult.error);
    }

    return success({
      reorderedIds: requirementIds,
      newOrderMap,
    });
  },

  /**
   * Get all requirements sorted by order
   * Requirements: 3.1
   */
  async getAllRequirements(): Promise<Result<LabRequirement[]>> {
    return labRequirementRepository.findAllSorted();
  },

  /**
   * Get only active requirements sorted by order
   * Requirements: 1.1, 1.5
   */
  async getActiveRequirements(): Promise<Result<LabRequirement[]>> {
    return labRequirementRepository.findActive();
  },

  /**
   * Get a single requirement by ID
   */
  async getRequirementById(id: string): Promise<Result<LabRequirement>> {
    return labRequirementRepository.findById(id);
  },
};
