import { z } from 'zod';
import { BaseEntitySchema, IdSchema, TimestampSchema } from './common.schema';

/**
 * Tracking action enum - types of actions that can be logged
 */
export const TrackingActionSchema = z.enum([
  'update_sessions',
  'update_projects',
  'add_project_link',
  'remove_project_link',
  'approve',
  'reject',
  'unlock_course',
  'unlock_semester',
]);

export type TrackingAction = z.infer<typeof TrackingActionSchema>;

/**
 * Tracking log schema - audit trail for progress changes
 */
export const TrackingLogSchema = BaseEntitySchema.extend({
  studentId: IdSchema,
  courseId: IdSchema,
  action: TrackingActionSchema,
  previousValue: z.unknown().optional(),
  newValue: z.unknown().optional(),
  performedBy: IdSchema, // admin userId
  performedAt: TimestampSchema,
});

export type TrackingLog = z.infer<typeof TrackingLogSchema>;

/**
 * Create tracking log input schema
 */
export const CreateTrackingLogInputSchema = TrackingLogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTrackingLogInput = z.infer<typeof CreateTrackingLogInputSchema>;

/**
 * Tracking log filter schema for querying
 */
export const TrackingLogFilterSchema = z.object({
  studentId: IdSchema.optional(),
  courseId: IdSchema.optional(),
  action: TrackingActionSchema.optional(),
  performedBy: IdSchema.optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

export type TrackingLogFilter = z.infer<typeof TrackingLogFilterSchema>;
