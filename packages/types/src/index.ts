// Result type pattern
export {
  type Result,
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
} from './result.types';

// Error types
export { ErrorCode, AppError, type ErrorCodeType } from './error.types';

// Common types
export type {
  UserRole,
  BaseEntity,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  SortDirection,
  SortParams,
  FilterOperator,
  FilterCondition,
} from './common.types';
