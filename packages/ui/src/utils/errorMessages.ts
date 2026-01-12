import { ErrorCode, type ErrorCodeType } from '@tdc/types';

/**
 * Map error codes to translation keys
 */
const ERROR_CODE_TO_TRANSLATION_KEY: Record<ErrorCodeType, string> = {
  // Auth errors
  [ErrorCode.UNAUTHORIZED]: 'errors.unauthorized',
  [ErrorCode.INVALID_CREDENTIALS]: 'errors.invalidCredentials',
  [ErrorCode.SESSION_EXPIRED]: 'errors.sessionExpired',
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'errors.emailNotVerified',
  [ErrorCode.TOO_MANY_ATTEMPTS]: 'errors.tooManyAttempts',

  // User errors
  [ErrorCode.USER_NOT_FOUND]: 'errors.userNotFound',
  [ErrorCode.EMAIL_EXISTS]: 'errors.emailExists',
  [ErrorCode.INVALID_ROLE]: 'errors.invalidRole',

  // Student errors
  [ErrorCode.STUDENT_NOT_FOUND]: 'errors.studentNotFound',
  [ErrorCode.STUDENT_INACTIVE]: 'errors.studentInactive',
  [ErrorCode.STUDENT_ALREADY_EXISTS]: 'errors.studentAlreadyExists',

  // Course errors
  [ErrorCode.COURSE_NOT_FOUND]: 'errors.courseNotFound',
  [ErrorCode.COURSE_NOT_PUBLISHED]: 'errors.courseNotPublished',
  [ErrorCode.NOT_ENROLLED]: 'errors.notEnrolled',
  [ErrorCode.INVALID_SEMESTER_REFERENCE]: 'errors.invalidSemesterReference',
  [ErrorCode.INVALID_GENIALLY_URL]: 'errors.invalidGeniallyUrl',

  // Semester errors
  [ErrorCode.SEMESTER_NOT_FOUND]: 'errors.semesterNotFound',
  [ErrorCode.SEMESTER_HAS_COURSES]: 'errors.semesterHasCourses',
  [ErrorCode.DUPLICATE_SEMESTER_ORDER]: 'errors.duplicateSemesterOrder',

  // Import errors
  [ErrorCode.INVALID_FILE_FORMAT]: 'errors.invalidFileFormat',
  [ErrorCode.IMPORT_RATE_LIMITED]: 'errors.importRateLimited',
  [ErrorCode.IMPORT_PARTIAL_FAILURE]: 'errors.importPartialFailure',
  [ErrorCode.INVALID_EMAIL_FORMAT]: 'errors.invalidEmailFormat',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'errors.missingRequiredField',
  [ErrorCode.DUPLICATE_EMAIL_IN_FILE]: 'errors.duplicateEmailInFile',

  // Validation errors
  [ErrorCode.VALIDATION_ERROR]: 'errors.validationError',
  [ErrorCode.INVALID_INPUT]: 'errors.validationError',

  // System errors
  [ErrorCode.UNKNOWN_ERROR]: 'errors.unknownError',
  [ErrorCode.NETWORK_ERROR]: 'errors.networkError',
  [ErrorCode.DATABASE_ERROR]: 'errors.databaseError',
  [ErrorCode.PERMISSION_DENIED]: 'errors.permissionDenied',

  // Progress errors (Phase 3)
  [ErrorCode.PROGRESS_NOT_FOUND]: 'errors.progressNotFound',
  [ErrorCode.PROGRESS_UPDATE_FAILED]: 'errors.progressUpdateFailed',

  // Project submission errors (Phase 3)
  [ErrorCode.SUBMISSION_NOT_FOUND]: 'errors.submissionNotFound',
  [ErrorCode.SUBMISSION_CREATE_FAILED]: 'errors.submissionCreateFailed',
  [ErrorCode.SUBMISSION_UPDATE_FAILED]: 'errors.submissionUpdateFailed',
  [ErrorCode.SUBMISSION_DELETE_FAILED]: 'errors.submissionDeleteFailed',
  [ErrorCode.INVALID_SUBMISSION_URL]: 'errors.invalidSubmissionUrl',
  [ErrorCode.SUBMISSION_ALREADY_EXISTS]: 'errors.submissionAlreadyExists',

  // Course access errors (Phase 3)
  [ErrorCode.COURSE_LOCKED]: 'errors.courseLocked',
  [ErrorCode.PREREQUISITE_NOT_COMPLETED]: 'errors.prerequisiteNotCompleted',

  // Tracking errors (Phase 4)
  [ErrorCode.SESSIONS_EXCEED_REQUIRED]: 'errors.sessionsExceedRequired',
  [ErrorCode.PROJECTS_EXCEED_REQUIRED]: 'errors.projectsExceedRequired',
  [ErrorCode.INVALID_PROJECT_URL]: 'errors.invalidProjectUrl',
  [ErrorCode.REJECTION_REASON_REQUIRED]: 'errors.rejectionReasonRequired',
  [ErrorCode.INVALID_STATUS_TRANSITION]: 'errors.invalidStatusTransition',
  [ErrorCode.ALREADY_APPROVED]: 'errors.alreadyApproved',
  [ErrorCode.NOT_PENDING_APPROVAL]: 'errors.notPendingApproval',
  [ErrorCode.UNLOCK_FAILED]: 'errors.unlockFailed',
  [ErrorCode.NO_NEXT_COURSE]: 'errors.noNextCourse',
  [ErrorCode.NO_NEXT_SEMESTER]: 'errors.noNextSemester',
  [ErrorCode.BULK_PASS_PARTIAL_FAILURE]: 'errors.bulkPassPartialFailure',
  [ErrorCode.BULK_PASS_FAILED]: 'errors.bulkPassFailed',
  [ErrorCode.TRACKING_LOG_CREATE_FAILED]: 'errors.trackingLogCreateFailed',
  [ErrorCode.NOTIFICATION_CREATE_FAILED]: 'errors.notificationCreateFailed',

  // Major errors (Phase 5)
  [ErrorCode.MAJOR_NOT_FOUND]: 'errors.majorNotFound',
  [ErrorCode.MAJOR_NAME_REQUIRED]: 'errors.majorNameRequired',
  [ErrorCode.MAJOR_ALREADY_EXISTS]: 'errors.majorAlreadyExists',

  // MajorCourse errors (Phase 5)
  [ErrorCode.MAJOR_COURSE_NOT_FOUND]: 'errors.majorCourseNotFound',
  [ErrorCode.MAJOR_COURSE_DUPLICATE]: 'errors.majorCourseDuplicate',

  // Major selection errors (Phase 5)
  [ErrorCode.MAJOR_SELECTION_REQUIRED]: 'errors.majorSelectionRequired',
  [ErrorCode.MAJOR_ALREADY_SELECTED]: 'errors.majorAlreadySelected',
  [ErrorCode.MAJOR_SELECTION_BLOCKED]: 'errors.majorSelectionBlocked',
};

/**
 * Get translation key for an error code
 */
export function getErrorTranslationKey(code: ErrorCodeType): string {
  return ERROR_CODE_TO_TRANSLATION_KEY[code] || 'errors.unknownError';
}

/**
 * Get error message from AppError using translation function
 */
export function getLocalizedErrorMessage(
  code: ErrorCodeType,
  t: (key: string, params?: Record<string, string | number>) => string,
  params?: Record<string, string | number>
): string {
  const key = getErrorTranslationKey(code);
  return t(key, params);
}
