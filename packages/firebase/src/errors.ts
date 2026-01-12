import { FirebaseError } from 'firebase/app';
import { AppError, ErrorCode, type ErrorCodeType } from '@tdc/types';

/**
 * Phase 2 error codes - exported for use in other modules
 */
export const PHASE2_ERROR_CODES = {
  // Semester errors
  SEMESTER_NOT_FOUND: ErrorCode.SEMESTER_NOT_FOUND,
  SEMESTER_HAS_COURSES: ErrorCode.SEMESTER_HAS_COURSES,
  DUPLICATE_SEMESTER_ORDER: ErrorCode.DUPLICATE_SEMESTER_ORDER,

  // Course errors
  COURSE_NOT_FOUND: ErrorCode.COURSE_NOT_FOUND,
  INVALID_SEMESTER_REFERENCE: ErrorCode.INVALID_SEMESTER_REFERENCE,
  INVALID_GENIALLY_URL: ErrorCode.INVALID_GENIALLY_URL,

  // Student errors
  STUDENT_NOT_FOUND: ErrorCode.STUDENT_NOT_FOUND,
  EMAIL_ALREADY_EXISTS: ErrorCode.EMAIL_EXISTS,
  INVALID_EMAIL_FORMAT: ErrorCode.INVALID_EMAIL_FORMAT,
  STUDENT_ALREADY_EXISTS: ErrorCode.STUDENT_ALREADY_EXISTS,

  // Import errors
  INVALID_FILE_FORMAT: ErrorCode.INVALID_FILE_FORMAT,
  IMPORT_RATE_LIMITED: ErrorCode.IMPORT_RATE_LIMITED,
  IMPORT_PARTIAL_FAILURE: ErrorCode.IMPORT_PARTIAL_FAILURE,
  MISSING_REQUIRED_FIELD: ErrorCode.MISSING_REQUIRED_FIELD,
  DUPLICATE_EMAIL_IN_FILE: ErrorCode.DUPLICATE_EMAIL_IN_FILE,
} as const;

/**
 * Firebase Auth error code mapping
 */
const FIREBASE_AUTH_ERROR_MAP: Record<string, ErrorCodeType> = {
  'auth/user-not-found': ErrorCode.USER_NOT_FOUND,
  'auth/wrong-password': ErrorCode.INVALID_CREDENTIALS,
  'auth/invalid-credential': ErrorCode.INVALID_CREDENTIALS,
  'auth/invalid-email': ErrorCode.INVALID_EMAIL_FORMAT,
  'auth/email-already-in-use': ErrorCode.EMAIL_EXISTS,
  'auth/weak-password': ErrorCode.INVALID_INPUT,
  'auth/too-many-requests': ErrorCode.TOO_MANY_ATTEMPTS,
  'auth/user-disabled': ErrorCode.STUDENT_INACTIVE,
  'auth/requires-recent-login': ErrorCode.SESSION_EXPIRED,
  'auth/network-request-failed': ErrorCode.NETWORK_ERROR,
  'auth/uid-already-exists': ErrorCode.STUDENT_ALREADY_EXISTS,
  'auth/operation-not-allowed': ErrorCode.PERMISSION_DENIED,
  'auth/internal-error': ErrorCode.UNKNOWN_ERROR,
  'auth/invalid-password': ErrorCode.INVALID_INPUT,
  'auth/quota-exceeded': ErrorCode.IMPORT_RATE_LIMITED,
};

/**
 * Firebase Firestore error code mapping
 */
const FIREBASE_FIRESTORE_ERROR_MAP: Record<string, ErrorCodeType> = {
  'permission-denied': ErrorCode.PERMISSION_DENIED,
  'not-found': ErrorCode.USER_NOT_FOUND,
  unavailable: ErrorCode.NETWORK_ERROR,
  'deadline-exceeded': ErrorCode.NETWORK_ERROR,
  cancelled: ErrorCode.UNKNOWN_ERROR,
  'already-exists': ErrorCode.EMAIL_EXISTS,
  'failed-precondition': ErrorCode.VALIDATION_ERROR,
  'invalid-argument': ErrorCode.INVALID_INPUT,
  'resource-exhausted': ErrorCode.IMPORT_RATE_LIMITED,
  aborted: ErrorCode.UNKNOWN_ERROR,
  'out-of-range': ErrorCode.INVALID_INPUT,
  unimplemented: ErrorCode.UNKNOWN_ERROR,
  internal: ErrorCode.DATABASE_ERROR,
  'data-loss': ErrorCode.DATABASE_ERROR,
  unauthenticated: ErrorCode.UNAUTHORIZED,
};

/**
 * Map Firebase error to AppError
 */
export function mapFirebaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof FirebaseError) {
    // Check auth errors
    const authCode = FIREBASE_AUTH_ERROR_MAP[error.code];
    if (authCode) {
      return new AppError(authCode, error.message, { firebaseCode: error.code });
    }

    // Check firestore errors
    const firestoreCode = FIREBASE_FIRESTORE_ERROR_MAP[error.code];
    if (firestoreCode) {
      return new AppError(firestoreCode, error.message, { firebaseCode: error.code });
    }

    // Unknown Firebase error
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, { firebaseCode: error.code });
  }

  if (error instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message);
  }

  return new AppError(ErrorCode.UNKNOWN_ERROR, String(error));
}

/**
 * Create a semester-specific error
 */
export function createSemesterError(
  code: keyof typeof PHASE2_ERROR_CODES,
  details?: Record<string, unknown>
): AppError {
  return new AppError(PHASE2_ERROR_CODES[code], undefined, details);
}

/**
 * Create a course-specific error
 */
export function createCourseError(
  code: keyof typeof PHASE2_ERROR_CODES,
  details?: Record<string, unknown>
): AppError {
  return new AppError(PHASE2_ERROR_CODES[code], undefined, details);
}

/**
 * Create a student-specific error
 */
export function createStudentError(
  code: keyof typeof PHASE2_ERROR_CODES,
  details?: Record<string, unknown>
): AppError {
  return new AppError(PHASE2_ERROR_CODES[code], undefined, details);
}

/**
 * Create an import-specific error
 */
export function createImportError(
  code: keyof typeof PHASE2_ERROR_CODES,
  details?: Record<string, unknown>
): AppError {
  return new AppError(PHASE2_ERROR_CODES[code], undefined, details);
}
