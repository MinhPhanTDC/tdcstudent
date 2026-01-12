'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailTemplateService } from '@tdc/firebase';
import type { EmailTemplate, UpdateEmailTemplateInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';

/**
 * Query keys factory for email templates
 * Requirements: 3.1, 3.6
 */
export const emailTemplateKeys = {
  all: ['emailTemplates'] as const,
  lists: () => [...emailTemplateKeys.all, 'list'] as const,
  details: () => [...emailTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...emailTemplateKeys.details(), id] as const,
  preview: (id: string) => [...emailTemplateKeys.all, 'preview', id] as const,
};

/**
 * Hook to fetch all email templates
 * Requirements: 3.1
 */
export function useEmailTemplates() {
  return useQuery({
    queryKey: emailTemplateKeys.lists(),
    queryFn: async (): Promise<EmailTemplate[]> => {
      const result = await emailTemplateService.getTemplates();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}

/**
 * Hook to fetch a single email template
 * Requirements: 3.1
 */
export function useEmailTemplate(id: string | null) {
  return useQuery({
    queryKey: emailTemplateKeys.detail(id ?? ''),
    queryFn: async (): Promise<EmailTemplate> => {
      if (!id) {
        throw new Error('Template ID is required');
      }
      const result = await emailTemplateService.getTemplate(id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to update an email template
 * Requirements: 3.6
 */
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEmailTemplateInput;
    }): Promise<Result<EmailTemplate>> => {
      return emailTemplateService.updateTemplate(id, data);
    },
    onSuccess: (result, { id }) => {
      if (result.success) {
        // Invalidate both list and detail queries
        queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
        queryClient.invalidateQueries({ queryKey: emailTemplateKeys.detail(id) });
      }
    },
  });
}

/**
 * Hook to preview an email template with sample data
 * Requirements: 3.5
 */
export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: async ({
      id,
      sampleData,
    }: {
      id: string;
      sampleData: Record<string, string>;
    }): Promise<Result<{ subject: string; body: string; missingPlaceholders: string[] }>> => {
      return emailTemplateService.previewTemplate(id, sampleData);
    },
  });
}
