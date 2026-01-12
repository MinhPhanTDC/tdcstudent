import { z } from 'zod';

/**
 * Activity Type Enum Schema
 * Defines the types of activities that can be logged
 * Requirements: 6.2, 6.3, 6.4
 */
export const ActivityTypeSchema = z.enum([
  'course_completed',
  'project_submitted',
  'login',
  'lab_requirement_completed',
]);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

/**
 * Timestamp Schema for Activity (handles both Date and Firestore Timestamp)
 */
const ActivityTimestampSchema = z.preprocess((val) => {
  if (val === null || val === undefined) {
    return new Date();
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
}, z.date());

/**
 * Activity Schema
 * Represents a single activity entry in the activity feed
 * Requirements: 6.2, 6.3, 6.4
 */
export const ActivitySchema = z.object({
  id: z.string().min(1),
  type: ActivityTypeSchema,
  userId: z.string().min(1),
  userName: z.string().min(1),
  details: z.record(z.string()).optional(),
  timestamp: ActivityTimestampSchema,
});

export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Create Activity Input Schema
 * Used when logging a new activity
 */
export const CreateActivityInputSchema = ActivitySchema.omit({
  id: true,
  timestamp: true,
}).extend({
  timestamp: ActivityTimestampSchema.optional(),
});

export type CreateActivityInput = z.infer<typeof CreateActivityInputSchema>;

/**
 * Activity Filter Schema
 * Used for querying activities
 */
export const ActivityFilterSchema = z.object({
  type: ActivityTypeSchema.optional(),
  userId: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
});

export type ActivityFilter = z.infer<typeof ActivityFilterSchema>;
