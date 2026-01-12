import { z } from 'zod';
import { BaseEntitySchema, IdSchema, TimestampSchema } from './common.schema';

/**
 * Submission type enum schema
 * Categorizes project submissions by platform
 * Requirements: 8.3
 */
export const SubmissionTypeSchema = z.enum(['drive', 'behance', 'other']);

export type SubmissionType = z.infer<typeof SubmissionTypeSchema>;

/**
 * Helper function to detect submission type from URL
 * Requirements: 8.3
 */
export function detectSubmissionType(url: string): SubmissionType {
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return 'drive';
  }
  if (url.includes('behance.net')) {
    return 'behance';
  }
  return 'other';
}

/**
 * Project submission schema
 * Tracks student project submissions for courses
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export const ProjectSubmissionSchema = BaseEntitySchema.extend({
  studentId: IdSchema,
  courseId: IdSchema,
  projectNumber: z.number().int('Số dự án phải là số nguyên').positive('Số dự án phải là số dương'),
  title: z.string().max(200, 'Tiêu đề tối đa 200 ký tự').optional(),
  submissionUrl: z.string().url('URL không hợp lệ'),
  submissionType: SubmissionTypeSchema,
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
  submittedAt: TimestampSchema,
});

export type ProjectSubmission = z.infer<typeof ProjectSubmissionSchema>;

/**
 * Create project submission input schema
 * Used when student submits a project
 * Requirements: 8.1, 8.2
 */
export const CreateProjectSubmissionInputSchema = z.object({
  courseId: IdSchema,
  projectNumber: z.number().int('Số dự án phải là số nguyên').positive('Số dự án phải là số dương'),
  title: z.string().max(200, 'Tiêu đề tối đa 200 ký tự').optional(),
  submissionUrl: z.string().url('URL không hợp lệ'),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

export type CreateProjectSubmissionInput = z.infer<typeof CreateProjectSubmissionInputSchema>;

/**
 * Update project submission input schema
 * All fields optional for partial updates
 */
export const UpdateProjectSubmissionInputSchema = CreateProjectSubmissionInputSchema.partial();

export type UpdateProjectSubmissionInput = z.infer<typeof UpdateProjectSubmissionInputSchema>;
