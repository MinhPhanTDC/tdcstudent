import { z } from 'zod';

/**
 * Pagination input schema
 */
export const PaginationInputSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationInputSchema>;

/**
 * Pagination metadata schema
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Factory function to create paginated response schema
 */
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: PaginationMetaSchema,
  });
}

/**
 * API error response schema
 */
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Sort direction schema
 */
export const SortDirectionSchema = z.enum(['asc', 'desc']);

export type SortDirection = z.infer<typeof SortDirectionSchema>;

/**
 * Generic sort input schema factory
 */
export function createSortSchema<T extends readonly [string, ...string[]]>(fields: T) {
  return z.object({
    field: z.enum(fields),
    direction: SortDirectionSchema.default('asc'),
  });
}

/**
 * Search input schema
 */
export const SearchInputSchema = z.object({
  query: z.string().min(1).max(100),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
