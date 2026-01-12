'use client';

import { useQuery } from '@tanstack/react-query';
import { labRequirementService } from '@tdc/firebase';
import type { LabRequirement } from '@tdc/schemas';

// Query keys factory
export const labRequirementKeys = {
  all: ['lab-requirements'] as const,
  active: () => [...labRequirementKeys.all, 'active'] as const,
};

/**
 * Hook to fetch active lab requirements ordered by order field
 * Requirements: 1.1, 1.5
 * 
 * @returns Query result with active lab requirements
 */
export function useLabRequirements() {
  return useQuery({
    queryKey: labRequirementKeys.active(),
    queryFn: async (): Promise<LabRequirement[]> => {
      const result = await labRequirementService.getActiveRequirements();
      if (!result.success) {
        throw result.error;
      }
      // Requirements are already sorted by order field from the service
      return result.data;
    },
  });
}
