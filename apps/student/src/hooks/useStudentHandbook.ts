'use client';

import { useQuery } from '@tanstack/react-query';
import { handbookService } from '@tdc/firebase';
import type { HandbookSettings } from '@tdc/schemas';

// Query keys factory
export const studentHandbookKeys = {
  all: ['student-handbook'] as const,
  settings: () => [...studentHandbookKeys.all, 'settings'] as const,
};

/**
 * Hook to fetch handbook URL for student portal
 * Requirements: 6.2
 */
export function useStudentHandbook() {
  return useQuery({
    queryKey: studentHandbookKeys.settings(),
    queryFn: async (): Promise<HandbookSettings | null> => {
      const result = await handbookService.getHandbook();
      
      if (!result.success) {
        // Return null if handbook not found (not an error state)
        return null;
      }
      
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
