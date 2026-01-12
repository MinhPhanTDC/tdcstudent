// Common schemas
export {
  IdSchema,
  EmailSchema,
  TimestampSchema,
  UrlSchema,
  BaseEntitySchema,
  UserRoleSchema,
  type BaseEntity,
  type UserRole,
} from './common.schema';

// User schemas
export {
  UserSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
  LoginCredentialsSchema,
  PasswordResetRequestSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  type LoginCredentials,
  type PasswordResetRequest,
} from './user.schema';

// Student schemas
export {
  ProgressRecordSchema,
  StudentSchema,
  CreateStudentInputSchema,
  UpdateStudentInputSchema,
  EnrollStudentSchema,
  UpdateProgressSchema,
  StudentFilterSchema,
  type ProgressRecord,
  type Student,
  type CreateStudentInput,
  type UpdateStudentInput,
  type EnrollStudent,
  type UpdateProgress,
  type StudentFilter,
} from './student.schema';

// Course schemas
export {
  GeniallyUrlSchema,
  LessonSchema,
  CreateLessonInputSchema,
  CourseSchema,
  CreateCourseInputSchema,
  UpdateCourseInputSchema,
  CourseFilterSchema,
  type Lesson,
  type CreateLessonInput,
  type Course,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseFilter,
} from './course.schema';

// Semester schemas
export {
  SemesterSchema,
  CreateSemesterInputSchema,
  UpdateSemesterInputSchema,
  SemesterFilterSchema,
  type Semester,
  type CreateSemesterInput,
  type UpdateSemesterInput,
  type SemesterFilter,
} from './semester.schema';

// API schemas
export {
  PaginationInputSchema,
  PaginationMetaSchema,
  createPaginatedSchema,
  ApiErrorSchema,
  SortDirectionSchema,
  createSortSchema,
  SearchInputSchema,
  type PaginationInput,
  type PaginationMeta,
  type ApiError,
  type SortDirection,
  type SearchInput,
} from './api.schema';

// Import schemas
export {
  ImportRowSchema,
  ValidatedImportRowSchema,
  ImportFailureSchema,
  ImportResultSchema,
  ImportStatusSchema,
  ImportProgressSchema,
  type ImportRow,
  type ValidatedImportRow,
  type ImportFailure,
  type ImportResult,
  type ImportStatus,
  type ImportProgress,
} from './import.schema';

// Progress schemas (Phase 3, extended in Phase 4)
export {
  ProgressStatusSchema,
  StudentProgressSchema,
  CreateProgressInputSchema,
  UpdateProgressInputSchema,
  ApproveProgressInputSchema,
  RejectProgressInputSchema,
  ProjectLinkSchema,
  type ProgressStatus,
  type StudentProgress,
  type CreateProgressInput,
  type UpdateProgressInput,
  type ApproveProgressInput,
  type RejectProgressInput,
} from './progress.schema';

// Project submission schemas (Phase 3)
export {
  SubmissionTypeSchema,
  ProjectSubmissionSchema,
  CreateProjectSubmissionInputSchema,
  UpdateProjectSubmissionInputSchema,
  detectSubmissionType,
  type SubmissionType,
  type ProjectSubmission,
  type CreateProjectSubmissionInput,
  type UpdateProjectSubmissionInput,
} from './project.schema';

// Tracking log schemas (Phase 4)
export {
  TrackingActionSchema,
  TrackingLogSchema,
  CreateTrackingLogInputSchema,
  TrackingLogFilterSchema,
  type TrackingAction,
  type TrackingLog,
  type CreateTrackingLogInput,
  type TrackingLogFilter,
} from './tracking-log.schema';

// Notification schemas (Phase 4)
export {
  NotificationTypeSchema,
  NotificationSchema,
  CreateNotificationInputSchema,
  MarkNotificationReadInputSchema,
  NotificationFilterSchema,
  type NotificationType,
  type Notification,
  type CreateNotificationInput,
  type MarkNotificationReadInput,
  type NotificationFilter,
} from './notification.schema';

// Student portal types (Phase 3)
export type {
  SemesterWithStatus,
  CourseWithProgress,
  OverallProgress,
  LearningTreeNode,
} from './student-portal.types';


// Lab Requirement schemas (Phase 6)
export {
  LabRequirementSchema,
  CreateLabRequirementInputSchema,
  UpdateLabRequirementInputSchema,
  type LabRequirement,
  type CreateLabRequirementInput,
  type UpdateLabRequirementInput,
} from './lab-requirement.schema';

// Lab Progress schemas (Phase 6)
export {
  LabProgressStatusSchema,
  StudentLabProgressSchema,
  CreateStudentLabProgressInputSchema,
  UpdateStudentLabProgressInputSchema,
  MarkCompleteInputSchema,
  ApproveLabVerificationInputSchema,
  RejectLabVerificationInputSchema,
  type LabProgressStatus,
  type StudentLabProgress,
  type CreateStudentLabProgressInput,
  type UpdateStudentLabProgressInput,
  type MarkCompleteInput,
  type ApproveLabVerificationInput,
  type RejectLabVerificationInput,
} from './lab-progress.schema';

// Activity schemas (Phase 6)
export {
  ActivityTypeSchema,
  ActivitySchema,
  CreateActivityInputSchema,
  ActivityFilterSchema,
  type ActivityType,
  type Activity,
  type CreateActivityInput,
  type ActivityFilter,
} from './activity.schema';

// Handbook schemas (Phase 6)
export {
  HandbookSettingsSchema,
  UploadHandbookInputSchema,
  PdfValidationSchema,
  type HandbookSettings,
  type UploadHandbookInput,
  type PdfValidation,
} from './handbook.schema';

// Major schemas (Phase 5)
export {
  HexColorSchema,
  MajorSchema,
  CreateMajorInputSchema,
  UpdateMajorInputSchema,
  MajorFilterSchema,
  type Major,
  type CreateMajorInput,
  type UpdateMajorInput,
  type MajorFilter,
} from './major.schema';

// MajorCourse schemas (Phase 5)
export {
  MajorCourseSchema,
  CreateMajorCourseInputSchema,
  UpdateMajorCourseInputSchema,
  MajorCourseFilterSchema,
  type MajorCourse,
  type CreateMajorCourseInput,
  type UpdateMajorCourseInput,
  type MajorCourseFilter,
} from './major-course.schema';

// Settings schemas (Phase 7)
export {
  PasswordSchema,
  PasswordChangeInputSchema,
  EmailSettingsSchema,
  validatePasswordStrength,
  type PasswordChangeInput,
  type PasswordValidationResult,
  type EmailSettings,
} from './settings.schema';
