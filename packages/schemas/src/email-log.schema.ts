import { z } from 'zod';
import { IdSchema, EmailSchema, TimestampSchema } from './common.schema';

/**
 * Email status enum
 * Requirements: 8.3, 8.4
 */
export const EmailStatusSchema = z.enum(['sent', 'failed']);

export type EmailStatus = z.infer<typeof EmailStatusSchema>;

/**
 * Email log schema
 * Requirements: 8.3
 * 
 * Stores information about sent emails for auditing and debugging
 */
export const EmailLogSchema = z.object({
  id: IdSchema,
  recipientEmail: EmailSchema,
  recipientName: z.string().min(1),
  templateId: IdSchema,
  templateName: z.string().min(1),
  subject: z.string().min(1),
  sentAt: TimestampSchema,
  sentBy: IdSchema, // User ID of admin who sent the email
  status: EmailStatusSchema,
  errorMessage: z.string().nullable(),
});

export type EmailLog = z.infer<typeof EmailLogSchema>;

/**
 * Create email log input schema
 * Requirements: 8.3
 */
export const CreateEmailLogInputSchema = EmailLogSchema.omit({
  id: true,
});

export type CreateEmailLogInput = z.infer<typeof CreateEmailLogInputSchema>;

/**
 * Email log filter schema
 */
export const EmailLogFilterSchema = z.object({
  recipientEmail: EmailSchema.optional(),
  templateId: IdSchema.optional(),
  status: EmailStatusSchema.optional(),
  sentBy: IdSchema.optional(),
  startDate: TimestampSchema.optional(),
  endDate: TimestampSchema.optional(),
});

export type EmailLogFilter = z.infer<typeof EmailLogFilterSchema>;

/**
 * Validates that an email log has all required fields
 * Property 10: Email log completeness
 * 
 * @param log - Email log to validate
 * @returns true if log has all required fields
 */
export function isEmailLogComplete(log: EmailLog): boolean {
  return (
    log.recipientEmail !== undefined &&
    log.recipientEmail.length > 0 &&
    log.templateId !== undefined &&
    log.templateId.length > 0 &&
    log.sentAt !== undefined &&
    log.sentBy !== undefined &&
    log.sentBy.length > 0
  );
}
