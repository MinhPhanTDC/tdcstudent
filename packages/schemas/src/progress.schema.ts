import { z } from 'zod';
import { BaseEntitySchema, IdSchema } from './common.schema';

/**
 * Progress status enum - tracks student's progress state for a course
 * Extended in Phase 4 with pending_approval and rejected statuses
 */
export const ProgressStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'pending_approval',
  'completed',
  'rejected',
  'locked',
]);
export type ProgressStatus = z.infer<typeof ProgressStatusSchema>;

/**
 * Nullable timestamp preprocessor for optional date fields
 */
const NullableTimestampSchema = z.preprocess((val) => {
  if (val === null || val === undefined) return null;
  if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
    return val.toDate();
  }
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return val;
}, z.date().nullable());

/**
 * Project link schema - validates URLs for project submissions
 */
export const ProjectLinkSchema = z.string().url('Link dự án không hợp lệ');

/**
 * Student progress schema - tracks individual course progress
 * Extended in Phase 4 with approval workflow fields
 */
export const StudentProgressSchema = BaseEntitySchema.extend({
  studentId: IdSchema,
  courseId: IdSchema,
  completedSessions: z.number().int().nonnegative().default(0),
  projectsSubmitted: z.number().int().nonnegative().default(0),
  projectLinks: z.array(ProjectLinkSchema).default([]),
  status: ProgressStatusSchema.default('not_started'),
  
  // Approval workflow fields (Phase 4)
  rejectionReason: z.string().optional(),
  approvedAt: NullableTimestampSchema.default(null),
  approvedBy: IdSchema.optional(),
  
  completedAt: NullableTimestampSchema.default(null),
});

export type StudentProgress = z.infer<typeof StudentProgressSchema>;

/**
 * Create progress input schema
 */
export const CreateProgressInputSchema = StudentProgressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProgressInput = z.infer<typeof CreateProgressInputSchema>;

/**
 * Update progress input schema - extended for Phase 4
 */
export const UpdateProgressInputSchema = z.object({
  completedSessions: z.number().int().nonnegative().optional(),
  projectsSubmitted: z.number().int().nonnegative().optional(),
  projectLinks: z.array(ProjectLinkSchema).optional(),
  status: ProgressStatusSchema.optional(),
  rejectionReason: z.string().optional(),
  approvedAt: NullableTimestampSchema.optional(),
  approvedBy: IdSchema.optional(),
});

export type UpdateProgressInput = z.infer<typeof UpdateProgressInputSchema>;

/**
 * Approve progress input schema
 */
export const ApproveProgressInputSchema = z.object({
  approvedBy: IdSchema,
});

export type ApproveProgressInput = z.infer<typeof ApproveProgressInputSchema>;

/**
 * Reject progress input schema
 */
export const RejectProgressInputSchema = z.object({
  rejectionReason: z.string().min(1, 'Lý do từ chối không được để trống'),
});

export type RejectProgressInput = z.infer<typeof RejectProgressInputSchema>;
