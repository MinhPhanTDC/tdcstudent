import { z } from 'zod';
import { BaseEntitySchema, IdSchema, EmailSchema, TimestampSchema } from './common.schema';

/**
 * Student progress record schema
 */
export const ProgressRecordSchema = z.record(
  z.string(), // courseId
  z.number().min(0).max(100) // percentage
);

export type ProgressRecord = z.infer<typeof ProgressRecordSchema>;

/**
 * Student schema - extended for Phase 2 and Phase 5
 * Includes personal info, semester tracking, and major selection
 */
export const StudentSchema = BaseEntitySchema.extend({
  userId: IdSchema, // Reference to users collection
  email: EmailSchema,
  displayName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
  phone: z.string().optional(),
  currentSemesterId: z.string().optional(),
  selectedMajorId: z.string().optional(),
  majorSelectedAt: TimestampSchema.optional(), // Phase 5: Timestamp when major was selected
  enrolledAt: TimestampSchema,
  enrolledCourses: z.array(IdSchema).default([]),
  progress: ProgressRecordSchema.default({}),
  isActive: z.boolean().default(true),
});

export type Student = z.infer<typeof StudentSchema>;

/**
 * Create student input schema
 * Used when admin creates a new student
 */
export const CreateStudentInputSchema = z.object({
  email: EmailSchema,
  displayName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentInputSchema>;

/**
 * Update student input schema
 */
export const UpdateStudentInputSchema = StudentSchema.partial()
  .required({ id: true })
  .omit({ createdAt: true, userId: true, email: true });

export type UpdateStudentInput = z.infer<typeof UpdateStudentInputSchema>;

/**
 * Enroll student in course schema
 */
export const EnrollStudentSchema = z.object({
  studentId: IdSchema,
  courseId: IdSchema,
});

export type EnrollStudent = z.infer<typeof EnrollStudentSchema>;

/**
 * Update progress schema
 */
export const UpdateProgressSchema = z.object({
  studentId: IdSchema,
  courseId: IdSchema,
  progress: z.number().min(0).max(100),
});

export type UpdateProgress = z.infer<typeof UpdateProgressSchema>;

/**
 * Student filter schema for querying
 */
export const StudentFilterSchema = z.object({
  isActive: z.boolean().optional(),
  currentSemesterId: z.string().optional(),
});

export type StudentFilter = z.infer<typeof StudentFilterSchema>;
