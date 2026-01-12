/**
 * Error codes enum - single source of truth for all error codes
 */
export const ErrorCode = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INVALID_ROLE: 'INVALID_ROLE',

  // Student errors
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  STUDENT_INACTIVE: 'STUDENT_INACTIVE',
  STUDENT_ALREADY_EXISTS: 'STUDENT_ALREADY_EXISTS',

  // Course errors
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  COURSE_NOT_PUBLISHED: 'COURSE_NOT_PUBLISHED',
  NOT_ENROLLED: 'NOT_ENROLLED',
  INVALID_SEMESTER_REFERENCE: 'INVALID_SEMESTER_REFERENCE',
  INVALID_GENIALLY_URL: 'INVALID_GENIALLY_URL',

  // Semester errors
  SEMESTER_NOT_FOUND: 'SEMESTER_NOT_FOUND',
  SEMESTER_HAS_COURSES: 'SEMESTER_HAS_COURSES',
  DUPLICATE_SEMESTER_ORDER: 'DUPLICATE_SEMESTER_ORDER',

  // Import errors
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  IMPORT_RATE_LIMITED: 'IMPORT_RATE_LIMITED',
  IMPORT_PARTIAL_FAILURE: 'IMPORT_PARTIAL_FAILURE',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  DUPLICATE_EMAIL_IN_FILE: 'DUPLICATE_EMAIL_IN_FILE',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Progress errors (Phase 3)
  PROGRESS_NOT_FOUND: 'PROGRESS_NOT_FOUND',
  PROGRESS_UPDATE_FAILED: 'PROGRESS_UPDATE_FAILED',

  // Project submission errors (Phase 3)
  SUBMISSION_NOT_FOUND: 'SUBMISSION_NOT_FOUND',
  SUBMISSION_CREATE_FAILED: 'SUBMISSION_CREATE_FAILED',
  SUBMISSION_UPDATE_FAILED: 'SUBMISSION_UPDATE_FAILED',
  SUBMISSION_DELETE_FAILED: 'SUBMISSION_DELETE_FAILED',
  INVALID_SUBMISSION_URL: 'INVALID_SUBMISSION_URL',
  SUBMISSION_ALREADY_EXISTS: 'SUBMISSION_ALREADY_EXISTS',

  // Course access errors (Phase 3)
  COURSE_LOCKED: 'COURSE_LOCKED',
  PREREQUISITE_NOT_COMPLETED: 'PREREQUISITE_NOT_COMPLETED',

  // Tracking errors (Phase 4)
  // Validation errors
  SESSIONS_EXCEED_REQUIRED: 'SESSIONS_EXCEED_REQUIRED',
  PROJECTS_EXCEED_REQUIRED: 'PROJECTS_EXCEED_REQUIRED',
  INVALID_PROJECT_URL: 'INVALID_PROJECT_URL',
  REJECTION_REASON_REQUIRED: 'REJECTION_REASON_REQUIRED',

  // State errors
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  ALREADY_APPROVED: 'ALREADY_APPROVED',
  NOT_PENDING_APPROVAL: 'NOT_PENDING_APPROVAL',

  // Unlock errors
  UNLOCK_FAILED: 'UNLOCK_FAILED',
  NO_NEXT_COURSE: 'NO_NEXT_COURSE',
  NO_NEXT_SEMESTER: 'NO_NEXT_SEMESTER',

  // Bulk operation errors
  BULK_PASS_PARTIAL_FAILURE: 'BULK_PASS_PARTIAL_FAILURE',
  BULK_PASS_FAILED: 'BULK_PASS_FAILED',

  // Tracking log errors
  TRACKING_LOG_CREATE_FAILED: 'TRACKING_LOG_CREATE_FAILED',

  // Notification errors
  NOTIFICATION_CREATE_FAILED: 'NOTIFICATION_CREATE_FAILED',

  // Major errors (Phase 5)
  MAJOR_NOT_FOUND: 'MAJOR_NOT_FOUND',
  MAJOR_NAME_REQUIRED: 'MAJOR_NAME_REQUIRED',
  MAJOR_ALREADY_EXISTS: 'MAJOR_ALREADY_EXISTS',

  // MajorCourse errors (Phase 5)
  MAJOR_COURSE_NOT_FOUND: 'MAJOR_COURSE_NOT_FOUND',
  MAJOR_COURSE_DUPLICATE: 'MAJOR_COURSE_DUPLICATE',

  // Major selection errors (Phase 5)
  MAJOR_SELECTION_REQUIRED: 'MAJOR_SELECTION_REQUIRED',
  MAJOR_ALREADY_SELECTED: 'MAJOR_ALREADY_SELECTED',
  MAJOR_SELECTION_BLOCKED: 'MAJOR_SELECTION_BLOCKED',

  // Password errors (Phase 7)
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
  AUTH_REQUIRED: 'AUTH_REQUIRED',

  // Email template errors (Phase 7)
  EMAIL_TEMPLATE_NOT_FOUND: 'EMAIL_TEMPLATE_NOT_FOUND',
  EMAIL_TEMPLATE_UPDATE_FAILED: 'EMAIL_TEMPLATE_UPDATE_FAILED',
  INVALID_PLACEHOLDER: 'INVALID_PLACEHOLDER',

  // Email sending errors (Phase 7)
  GMAIL_NOT_CONNECTED: 'GMAIL_NOT_CONNECTED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  EMAIL_LOG_CREATE_FAILED: 'EMAIL_LOG_CREATE_FAILED',
  EMAIL_LOG_NOT_FOUND: 'EMAIL_LOG_NOT_FOUND',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Application error class with typed error codes
 */
export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(code: ErrorCodeType, message?: string, details?: Record<string, unknown>) {
    super(message || code);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Serialize error to JSON (safe for logging/API responses)
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Create AppError from unknown error
   */
  static from(error: unknown, fallbackCode: ErrorCodeType = ErrorCode.UNKNOWN_ERROR): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(fallbackCode, error.message);
    }

    return new AppError(fallbackCode, String(error));
  }
}
