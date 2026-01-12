'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@tdc/firebase';
import type { EmailSettings } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const emailSettingsKeys = {
  all: ['emailSettings'] as const,
  settings: () => [...emailSettingsKeys.all, 'settings'] as const,
};

/**
 * Hook to fetch current email settings
 * Requirements: 2.1
 */
export function useEmailSettings() {
  return useQuery({
    queryKey: emailSettingsKeys.settings(),
    queryFn: async (): Promise<EmailSettings> => {
      const result = await settingsService.getEmailSettings();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}

/**
 * Hook to connect Gmail account
 * Requirements: 2.2, 2.3
 */
export function useConnectGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string): Promise<Result<EmailSettings>> => {
      return settingsService.connectGmail(email);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: emailSettingsKeys.settings() });
      }
    },
  });
}

/**
 * Hook to disconnect Gmail account
 * Requirements: 2.4
 */
export function useDisconnectGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Result<EmailSettings>> => {
      return settingsService.disconnectGmail();
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: emailSettingsKeys.settings() });
      }
    },
  });
}
