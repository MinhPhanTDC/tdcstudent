// Config - initialization and getters
export {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseRtdb,
  getFirebaseStorage,
  getFirebaseConfig,
  rtdb,
  storage,
  type FirebaseConfig,
} from './config';

// Auth functions
export {
  signIn,
  signOut,
  resetPassword,
  onAuthChange,
  getCurrentFirebaseUser,
  getCurrentUser,
  getIdToken,
  verifyIdToken,
  exchangeToken,
  signInWithToken,
} from './auth';

// Error handling
export {
  mapFirebaseError,
  PHASE2_ERROR_CODES,
  createSemesterError,
  createCourseError,
  createStudentError,
  createImportError,
} from './errors';

// Repositories
export { userRepository } from './repositories/user.repository';
export { studentRepository } from './repositories/student.repository';
export { courseRepository } from './repositories/course.repository';
export { semesterRepository } from './repositories/semester.repository';
export { progressRepository } from './repositories/progress.repository';
export { projectSubmissionRepository } from './repositories/project-submission.repository';
export { trackingLogRepository } from './repositories/tracking-log.repository';
export { notificationRepository } from './repositories/notification.repository';
export { labRequirementRepository } from './repositories/lab-requirement.repository';
export { labProgressRepository } from './repositories/lab-progress.repository';
export {
  activityRepository,
  parseActivityData,
  sortActivitiesByTimestamp,
  ActivityRepositoryErrorCode,
} from './repositories/activity.repository';

// Major repositories (Phase 5)
export { majorRepository } from './repositories/major.repository';
export { majorCourseRepository } from './repositories/major-course.repository';

// Base repository for extension
export { BaseRepository, where, orderBy, limit, startAfter } from './repositories/base.repository';

// Services
export { studentService, type CreateStudentResult } from './services/student.service';
export {
  trackingService,
  checkPassCondition,
  validateSessionCount,
  validateProjectCount,
  validateProjectUrl,
  type CourseRequirements,
  type PassConditionResult,
  type ProgressUpdateResult,
  type ApprovalResult,
} from './services/tracking.service';
export {
  unlockService,
  findNextCourseInSemester,
  areAllCoursesCompleted,
  findNextSemester,
  type UnlockResult,
} from './services/unlock.service';
export {
  notificationService,
  createCompletionNotificationData,
  createRejectionNotificationData,
  createCourseUnlockNotificationData,
  createSemesterUnlockNotificationData,
  type CompletionNotificationInput,
  type RejectionNotificationInput,
  type CourseUnlockNotificationInput,
  type SemesterUnlockNotificationInput,
} from './services/notification.service';
export {
  bulkPassService,
  processSinglePass,
  aggregateBulkPassResults,
  type SinglePassResult,
  type BulkPassResult,
  type BulkPassInput,
} from './services/bulk-pass.service';

// Lab Requirement Service (Phase 6)
export {
  labRequirementService,
  validateTitleBounds,
  validateOrderSequence,
  generateOrderSequence,
  type DeleteRequirementResult,
  type ReorderResult,
} from './services/lab-requirement.service';

// Lab Progress Service (Phase 6)
export {
  labProgressService,
  determineStatusOnComplete,
  isPendingVerification,
  createApprovalState,
  createRejectionState,
  validateRejectionReason,
  LabProgressErrorCode,
  type MarkCompleteResult,
  type VerificationResult,
} from './services/lab-progress.service';

// Presence Service (Phase 6)
export {
  presenceService,
  calculateOnlineCount,
  PresenceErrorCode,
  type PresenceRole,
  type PresenceState,
  type UserPresence,
  type OnlineCount,
} from './services/presence.service';

// Activity Service (Phase 6)
export {
  activityService,
  createCourseCompletionActivity,
  createProjectSubmissionActivity,
  createLoginActivity,
  createLabRequirementActivity,
  ActivityServiceErrorCode,
  type CourseCompletionActivityInput,
  type ProjectSubmissionActivityInput,
  type LoginActivityInput,
  type LabRequirementActivityInput,
} from './services/activity.service';

// Handbook Service (Phase 6)
export {
  handbookService,
  validatePdfMetadata,
  isValidPdfSize,
  isValidPdfHeader,
  validatePdfConstraints,
  isValidReplacement,
  HandbookErrorCode,
  MAX_PDF_SIZE,
  type UploadHandbookInput,
  type UploadHandbookResult,
} from './services/handbook.service';

// Major Service (Phase 5)
export {
  majorService,
  sortMajors,
} from './services/major.service';

// MajorCourse Service (Phase 5)
export {
  majorCourseService,
  sortMajorCoursesByOrder,
  normalizeOrderSequence,
} from './services/major-course.service';

// Password Service (Phase 7)
export { passwordService } from './services/password.service';

// Utilities
export { generateSecurePassword, validatePasswordStrength } from './utils/password';
