'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handbookService, type UploadHandbookResult } from '@tdc/firebase';
import type { HandbookSettings } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const handbookKeys = {
  all: ['handbook'] as const,
  settings: () => [...handbookKeys.all, 'settings'] as const,
};

/**
 * Hook to fetch current handbook settings
 * Requirements: 7.2, 7.4
 */
export function useHandbook() {
  return useQuery({
    queryKey: handbookKeys.settings(),
    queryFn: async (): Promise<HandbookSettings | null> => {
      const result = await handbookService.getHandbook();
      if (!result.success) {
        // Return null if handbook not found (not an error state)
        if (result.error.details?.code === 'HANDBOOK_NOT_FOUND') {
          return null;
        }
        throw result.error;
      }
      return result.data;
    },
  });
}

/**
 * Hook to upload a new handbook PDF
 * Requirements: 7.1, 7.2, 7.3
 */
export function useUploadHandbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      uploadedBy,
    }: {
      file: File;
      uploadedBy: string;
    }): Promise<Result<UploadHandbookResult>> => {
      return handbookService.uploadHandbook({ file, uploadedBy });
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: handbookKeys.settings() });
      }
    },
  });
}

/**
 * Hook to validate a PDF file before upload
 * Requirements: 7.1
 */
export function useValidatePdf() {
  return useMutation({
    mutationFn: async (file: File): Promise<Result<true>> => {
      return handbookService.validatePdf(file);
    },
  });
}

/**
 * Hook to delete the current handbook
 */
export function useDeleteHandbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Result<true>> => {
      return handbookService.deleteHandbook();
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: handbookKeys.settings() });
      }
    },
  });
}
