'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labRequirementService } from '@tdc/firebase';
import type { LabRequirement, CreateLabRequirementInput, UpdateLabRequirementInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const labRequirementAdminKeys = {
  all: ['lab-requirements-admin'] as const,
  lists: () => [...labRequirementAdminKeys.all, 'list'] as const,
  list: () => [...labRequirementAdminKeys.lists()] as const,
  details: () => [...labRequirementAdminKeys.all, 'detail'] as const,
  detail: (id: string) => [...labRequirementAdminKeys.details(), id] as const,
};

/**
 * Hook to fetch all lab requirements (active and inactive) for admin
 * Requirements: 3.1
 */
export function useLabRequirementsAdmin() {
  return useQuery({
    queryKey: labRequirementAdminKeys.list(),
    queryFn: async (): Promise<LabRequirement[]> => {
      const result = await labRequirementService.getAllRequirements();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}

/**
 * Hook to fetch a single lab requirement by ID
 */
export function useLabRequirement(id: string) {
  return useQuery({
    queryKey: labRequirementAdminKeys.detail(id),
    queryFn: async (): Promise<LabRequirement> => {
      const result = await labRequirementService.getRequirementById(id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new lab requirement
 * Requirements: 3.2
 */
export function useCreateLabRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLabRequirementInput): Promise<Result<LabRequirement>> => {
      return labRequirementService.createRequirement(input);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.lists() });
      }
    },
  });
}


/**
 * Hook to update an existing lab requirement
 * Requirements: 3.3
 */
export function useUpdateLabRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdateLabRequirementInput, 'id'>;
    }): Promise<Result<LabRequirement>> => {
      return labRequirementService.updateRequirement(id, data);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.lists() });
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.detail(variables.id) });
      }
    },
  });
}

/**
 * Hook to delete a lab requirement with cascade delete of progress records
 * Requirements: 3.4
 */
export function useDeleteLabRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return labRequirementService.deleteRequirement(id);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.lists() });
      }
    },
  });
}

/**
 * Hook to toggle active status of a lab requirement
 * Requirements: 3.5
 */
export function useToggleLabRequirementActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Result<LabRequirement>> => {
      return labRequirementService.toggleActive(id);
    },
    onSuccess: (result, id) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.lists() });
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.detail(id) });
      }
    },
  });
}

/**
 * Hook to reorder lab requirements
 * Requirements: 3.6
 */
export function useReorderLabRequirements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requirementIds: string[]) => {
      return labRequirementService.reorderRequirements(requirementIds);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: labRequirementAdminKeys.lists() });
      }
    },
  });
}
