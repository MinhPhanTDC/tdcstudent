import { z } from 'zod';
import { BaseEntitySchema } from './common.schema';

/**
 * Lab Progress Status Enum Schema
 * Defines the possible states of a student's lab requirement progress
 * Requirements: 9.3
 */
export const LabProgressStatusSchema = z.enum([
  'not_started',
  'pending',
  'completed',
  'rejected',
]);

export type LabProgressStatus = z.infer<typeof LabProgressStatusSchema>;

/**
 * Nullable Timestamp Schema for optional date fields
 */
const NullableTimestampSchema = z.preprocess((val) => {
  if (val === null || val === undefined) {
    return null;
  }
  // Handle Firestore Timestamp (has toDate method)
  if (val && typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
    return val.toDate();
  }
  // Handle regular Date or date string
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === 'string' || typeof val === 'number') {
    return new Date(val);
  }
  return val;
}, z.date().nullable());

/**
 * Student Lab Progress Schema
 * Tracks individual student's progress on lab requirements
 * Requirements: 9.3
 */
export const StudentLabProgressSchema = BaseEntitySchema.extend({
  studentId: z.string().min(1, 'Student ID không được để trống'),
  requirementId: z.string().min(1, 'Requirement ID không được để trống'),
  status: LabProgressStatusSchema.default('not_started'),
  completedAt: NullableTimestampSchema.default(null),
  verifiedBy: z.string().nullable().default(null),
  rejectionReason: z
    .string()
    .max(500, 'Lý do từ chối tối đa 500 ký tự')
    .nullable()
    .default(null),
  notes: z
    .string()
    .max(500, 'Ghi chú tối đa 500 ký tự')
    .optional(),
});

export type StudentLabProgress = z.infer<typeof StudentLabProgressSchema>;

/**
 * Create Student Lab Progress Input Schema
 * Omits auto-generated fields
 */
export const CreateStudentLabProgressInputSchema = StudentLabProgressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateStudentLabProgressInput = z.infer<typeof CreateStudentLabProgressInputSchema>;

/**
 * Update Student Lab Progress Input Schema
 * All fields optional except id
 */
export const UpdateStudentLabProgressInputSchema = StudentLabProgressSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true });

export type UpdateStudentLabProgressInput = z.infer<typeof UpdateStudentLabProgressInputSchema>;

/**
 * Mark Complete Input Schema
 * Used when a student marks a requirement as complete
 */
export const MarkCompleteInputSchema = z.object({
  requirementId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export type MarkCompleteInput = z.infer<typeof MarkCompleteInputSchema>;

/**
 * Approve Verification Input Schema
 * Used when admin approves a pending verification
 */
export const ApproveLabVerificationInputSchema = z.object({
  progressId: z.string().min(1),
  verifiedBy: z.string().min(1),
});

export type ApproveLabVerificationInput = z.infer<typeof ApproveLabVerificationInputSchema>;

/**
 * Reject Verification Input Schema
 * Used when admin rejects a pending verification
 */
export const RejectLabVerificationInputSchema = z.object({
  progressId: z.string().min(1),
  rejectionReason: z.string().min(1, 'Lý do từ chối không được để trống').max(500),
});

export type RejectLabVerificationInput = z.infer<typeof RejectLabVerificationInputSchema>;
