import { FirebaseError } from 'firebase/app';
import { AppError, ErrorCode, type ErrorCodeType } from '@tdc/types';

/**
 * Network error types for categorization
 */
export type NetworkErrorType = 'timeout' | 'connection' | 'offline' | 'server' | 'unknown';

/**
 * Error severity levels for UI display
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Error category for grouping similar errors
 */
export type ErrorCategory = 'network' | 'auth' | 'validation' | 'permission' | 'notFound' | 'system';

/**
 * Extended error details for network errors
 */
export interface NetworkErrorDetails {
  type: NetworkErrorType;
  retryable: boolean;
  statusCode?: number;
  originalError?: unknown;
  firebaseCode?: string;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  retryCount?: number;
  lastRetryAt?: Date;
}

/**
 * Network error class with enhanced details
 */
export class NetworkError extends AppError {
  public readonly networkType: NetworkErrorType;
  public readonly retryable: boolean;
  public readonly statusCode?: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;

  constructor(
    type: NetworkErrorType,
    message?: string,
    details?: Partial<NetworkErrorDetails>
  ) {
    const code = type === 'offline' ? ErrorCode.NETWORK_ERROR : ErrorCode.NETWORK_ERROR;
    super(code, message || getNetworkErrorMessage(type), {
      ...details,
      type,
      retryable: details?.retryable ?? isRetryableNetworkType(type),
    });
    this.networkType = type;
    this.retryable = details?.retryable ?? isRetryableNetworkType(type);
    this.statusCode = details?.statusCode;
    this.category = 'network';
    this.severity = type === 'server' ? 'error' : 'warning';
  }

  /**
   * Check if this error can be retried
   */
  canRetry(): boolean {
    return this.retryable;
  }
}

/**
 * Check if a network error type is retryable
 */
function isRetryableNetworkType(type: NetworkErrorType): boolean {
  return type !== 'offline'; // Offline errors should wait for connection
}

/**
 * Transient error codes that should be retried
 */
const TRANSIENT_ERROR_CODES = new Set([
  'unavailable',
  'deadline-exceeded',
  'resource-exhausted',
  'aborted',
  'internal',
  'auth/network-request-failed',
  'auth/too-many-requests',
]);

/**
 * Check if an error is transient and should be retried
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    return TRANSIENT_ERROR_CODES.has(error.code);
  }
  if (error instanceof AppError) {
    return (
      error.code === ErrorCode.NETWORK_ERROR ||
      error.code === ErrorCode.DATABASE_ERROR ||
      (error.details?.retryable === true)
    );
  }
  // Check for network-related errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch failed')
    );
  }
  return false;
}

/**
 * Get network error type from error
 */
export function getNetworkErrorType(error: unknown): NetworkErrorType {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'unavailable':
      case 'auth/network-request-failed':
        return navigator?.onLine === false ? 'offline' : 'connection';
      case 'deadline-exceeded':
        return 'timeout';
      case 'resource-exhausted':
      case 'internal':
        return 'server';
      default:
        return 'unknown';
    }
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('offline') || !navigator?.onLine) return 'offline';
    if (message.includes('network') || message.includes('connection')) return 'connection';
    if (message.includes('500') || message.includes('503')) return 'server';
  }
  return 'unknown';
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Calculate delay for retry attempt with exponential backoff
 */
export function calculateRetryDelay(attempt: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  // Add jitter (±10%) to prevent thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Retry state for tracking retry attempts
 */
export interface RetryState {
  attempt: number;
  lastError: unknown;
  startedAt: Date;
  aborted: boolean;
}

/**
 * Retry result with state information
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  state: RetryState;
}

/**
 * Execute a function with retry logic for transient errors
 * Supports abort signal for cancellation
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  abortSignal?: AbortSignal
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    // Check if aborted
    if (abortSignal?.aborted) {
      throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Operation was cancelled');
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a transient error or we've exhausted retries
      if (!isTransientError(error) || attempt === retryConfig.maxRetries) {
        throw error;
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, retryConfig);
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delay);
        
        // Handle abort during delay
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new AppError(ErrorCode.UNKNOWN_ERROR, 'Operation was cancelled'));
          }, { once: true });
        }
      });
    }
  }

  throw lastError;
}

/**
 * Execute a function with retry logic and return detailed result
 */
export async function withRetryResult<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  abortSignal?: AbortSignal
): Promise<RetryResult<T>> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const state: RetryState = {
    attempt: 0,
    lastError: null,
    startedAt: new Date(),
    aborted: false,
  };

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    state.attempt = attempt;

    // Check if aborted
    if (abortSignal?.aborted) {
      state.aborted = true;
      return {
        success: false,
        error: new AppError(ErrorCode.UNKNOWN_ERROR, 'Operation was cancelled'),
        state,
      };
    }

    try {
      const data = await fn();
      return { success: true, data, state };
    } catch (error) {
      state.lastError = error;

      // Don't retry if it's not a transient error or we've exhausted retries
      if (!isTransientError(error) || attempt === retryConfig.maxRetries) {
        return { success: false, error, state };
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, retryConfig);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: state.lastError, state };
}

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
      const details = {
        type: getNetworkErrorType(error),
        retryable: isTransientError(error),
        firebaseCode: error.code,
      } as Record<string, unknown>;
      return new AppError(authCode, error.message, details);
    }

    // Check firestore errors
    const firestoreCode = FIREBASE_FIRESTORE_ERROR_MAP[error.code];
    if (firestoreCode) {
      const details = {
        type: getNetworkErrorType(error),
        retryable: isTransientError(error),
        firebaseCode: error.code,
      } as Record<string, unknown>;
      return new AppError(firestoreCode, error.message, details);
    }

    // Unknown Firebase error
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, { 
      firebaseCode: error.code,
      type: 'unknown',
      retryable: false,
    });
  }

  if (error instanceof Error) {
    // Check for network-related errors
    const isNetwork = isTransientError(error);
    if (isNetwork) {
      const details = {
        type: getNetworkErrorType(error),
        retryable: true,
      } as Record<string, unknown>;
      return new AppError(ErrorCode.NETWORK_ERROR, error.message, details);
    }
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message);
  }

  return new AppError(ErrorCode.UNKNOWN_ERROR, String(error));
}

/**
 * User-friendly error messages in Vietnamese
 */
export const ERROR_MESSAGES: Record<ErrorCodeType, string> = {
  // Auth errors
  [ErrorCode.UNAUTHORIZED]: 'Bạn không có quyền thực hiện thao tác này',
  [ErrorCode.INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không đúng',
  [ErrorCode.SESSION_EXPIRED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'Email chưa được xác thực',
  [ErrorCode.TOO_MANY_ATTEMPTS]: 'Quá nhiều lần thử. Vui lòng thử lại sau',

  // User errors
  [ErrorCode.USER_NOT_FOUND]: 'Không tìm thấy người dùng',
  [ErrorCode.EMAIL_EXISTS]: 'Email đã được sử dụng',
  [ErrorCode.INVALID_ROLE]: 'Vai trò không hợp lệ',

  // Student errors
  [ErrorCode.STUDENT_NOT_FOUND]: 'Không tìm thấy học viên',
  [ErrorCode.STUDENT_INACTIVE]: 'Tài khoản học viên đã bị vô hiệu hóa',
  [ErrorCode.STUDENT_ALREADY_EXISTS]: 'Học viên đã tồn tại trong hệ thống',

  // Course errors
  [ErrorCode.COURSE_NOT_FOUND]: 'Không tìm thấy khóa học',
  [ErrorCode.COURSE_NOT_PUBLISHED]: 'Khóa học chưa được xuất bản',
  [ErrorCode.NOT_ENROLLED]: 'Bạn chưa đăng ký khóa học này',
  [ErrorCode.INVALID_SEMESTER_REFERENCE]: 'Tham chiếu học kỳ không hợp lệ',
  [ErrorCode.INVALID_GENIALLY_URL]: 'URL Genially không hợp lệ',

  // Semester errors
  [ErrorCode.SEMESTER_NOT_FOUND]: 'Không tìm thấy học kỳ',
  [ErrorCode.SEMESTER_HAS_COURSES]: 'Không thể xóa học kỳ đang có khóa học',
  [ErrorCode.DUPLICATE_SEMESTER_ORDER]: 'Thứ tự học kỳ đã tồn tại',

  // Import errors
  [ErrorCode.INVALID_FILE_FORMAT]: 'Định dạng file không hợp lệ',
  [ErrorCode.IMPORT_RATE_LIMITED]: 'Đã vượt quá giới hạn import. Vui lòng thử lại sau',
  [ErrorCode.IMPORT_PARTIAL_FAILURE]: 'Import thành công một phần',
  [ErrorCode.INVALID_EMAIL_FORMAT]: 'Định dạng email không hợp lệ',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Thiếu trường bắt buộc',
  [ErrorCode.DUPLICATE_EMAIL_IN_FILE]: 'Email bị trùng lặp trong file',

  // Validation errors
  [ErrorCode.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ',
  [ErrorCode.INVALID_INPUT]: 'Dữ liệu đầu vào không hợp lệ',

  // System errors
  [ErrorCode.UNKNOWN_ERROR]: 'Đã xảy ra lỗi không xác định',
  [ErrorCode.NETWORK_ERROR]: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet',
  [ErrorCode.DATABASE_ERROR]: 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau',
  [ErrorCode.PERMISSION_DENIED]: 'Bạn không có quyền truy cập',

  // Progress errors
  [ErrorCode.PROGRESS_NOT_FOUND]: 'Không tìm thấy tiến độ học tập',
  [ErrorCode.PROGRESS_UPDATE_FAILED]: 'Cập nhật tiến độ thất bại',

  // Submission errors
  [ErrorCode.SUBMISSION_NOT_FOUND]: 'Không tìm thấy bài nộp',
  [ErrorCode.SUBMISSION_CREATE_FAILED]: 'Tạo bài nộp thất bại',
  [ErrorCode.SUBMISSION_UPDATE_FAILED]: 'Cập nhật bài nộp thất bại',
  [ErrorCode.SUBMISSION_DELETE_FAILED]: 'Xóa bài nộp thất bại',
  [ErrorCode.INVALID_SUBMISSION_URL]: 'URL bài nộp không hợp lệ',
  [ErrorCode.SUBMISSION_ALREADY_EXISTS]: 'Bài nộp đã tồn tại',

  // Course access errors
  [ErrorCode.COURSE_LOCKED]: 'Khóa học đang bị khóa',
  [ErrorCode.PREREQUISITE_NOT_COMPLETED]: 'Chưa hoàn thành khóa học tiên quyết',

  // Tracking errors
  [ErrorCode.SESSIONS_EXCEED_REQUIRED]: 'Số buổi học vượt quá yêu cầu',
  [ErrorCode.PROJECTS_EXCEED_REQUIRED]: 'Số dự án vượt quá yêu cầu',
  [ErrorCode.INVALID_PROJECT_URL]: 'URL dự án không hợp lệ',
  [ErrorCode.REJECTION_REASON_REQUIRED]: 'Cần nhập lý do từ chối',
  [ErrorCode.INVALID_STATUS_TRANSITION]: 'Chuyển trạng thái không hợp lệ',
  [ErrorCode.ALREADY_APPROVED]: 'Đã được duyệt trước đó',
  [ErrorCode.NOT_PENDING_APPROVAL]: 'Không ở trạng thái chờ duyệt',
  [ErrorCode.UNLOCK_FAILED]: 'Mở khóa thất bại',
  [ErrorCode.NO_NEXT_COURSE]: 'Không có khóa học tiếp theo',
  [ErrorCode.NO_NEXT_SEMESTER]: 'Không có học kỳ tiếp theo',
  [ErrorCode.BULK_PASS_PARTIAL_FAILURE]: 'Duyệt hàng loạt thành công một phần',
  [ErrorCode.BULK_PASS_FAILED]: 'Duyệt hàng loạt thất bại',
  [ErrorCode.TRACKING_LOG_CREATE_FAILED]: 'Tạo log theo dõi thất bại',
  [ErrorCode.NOTIFICATION_CREATE_FAILED]: 'Tạo thông báo thất bại',

  // Major errors
  [ErrorCode.MAJOR_NOT_FOUND]: 'Không tìm thấy chuyên ngành',
  [ErrorCode.MAJOR_NAME_REQUIRED]: 'Tên chuyên ngành là bắt buộc',
  [ErrorCode.MAJOR_ALREADY_EXISTS]: 'Chuyên ngành đã tồn tại',
  [ErrorCode.MAJOR_COURSE_NOT_FOUND]: 'Không tìm thấy khóa học chuyên ngành',
  [ErrorCode.MAJOR_COURSE_DUPLICATE]: 'Khóa học đã có trong chuyên ngành',
  [ErrorCode.MAJOR_SELECTION_REQUIRED]: 'Cần chọn chuyên ngành',
  [ErrorCode.MAJOR_ALREADY_SELECTED]: 'Đã chọn chuyên ngành',
  [ErrorCode.MAJOR_SELECTION_BLOCKED]: 'Không thể chọn chuyên ngành lúc này',

  // Password errors
  [ErrorCode.WRONG_PASSWORD]: 'Mật khẩu không đúng',
  [ErrorCode.WEAK_PASSWORD]: 'Mật khẩu quá yếu',
  [ErrorCode.PASSWORD_MISMATCH]: 'Mật khẩu không khớp',
  [ErrorCode.AUTH_REQUIRED]: 'Cần xác thực lại',

  // Email errors
  [ErrorCode.EMAIL_TEMPLATE_NOT_FOUND]: 'Không tìm thấy mẫu email',
  [ErrorCode.EMAIL_TEMPLATE_UPDATE_FAILED]: 'Cập nhật mẫu email thất bại',
  [ErrorCode.INVALID_PLACEHOLDER]: 'Placeholder không hợp lệ',
  [ErrorCode.GMAIL_NOT_CONNECTED]: 'Chưa kết nối Gmail',
  [ErrorCode.EMAIL_SEND_FAILED]: 'Gửi email thất bại',
  [ErrorCode.EMAIL_LOG_CREATE_FAILED]: 'Tạo log email thất bại',
  [ErrorCode.EMAIL_LOG_NOT_FOUND]: 'Không tìm thấy log email',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError | ErrorCodeType): string {
  const code = error instanceof AppError ? error.code : error;
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Get network-specific error message
 */
export function getNetworkErrorMessage(errorType: NetworkErrorType): string {
  switch (errorType) {
    case 'offline':
      return 'Bạn đang offline. Vui lòng kiểm tra kết nối internet';
    case 'timeout':
      return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại';
    case 'connection':
      return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau';
    case 'server':
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau';
    default:
      return 'Đã xảy ra lỗi mạng. Vui lòng thử lại';
  }
}

/**
 * Get error category from error code
 */
export function getErrorCategory(error: AppError | ErrorCodeType): ErrorCategory {
  const code = error instanceof AppError ? error.code : error;
  
  // Network errors
  if (code === ErrorCode.NETWORK_ERROR || code === ErrorCode.DATABASE_ERROR) {
    return 'network';
  }
  
  // Auth errors
  const authErrors: ErrorCodeType[] = [
    ErrorCode.UNAUTHORIZED,
    ErrorCode.INVALID_CREDENTIALS,
    ErrorCode.SESSION_EXPIRED,
    ErrorCode.EMAIL_NOT_VERIFIED,
    ErrorCode.TOO_MANY_ATTEMPTS,
    ErrorCode.WRONG_PASSWORD,
    ErrorCode.AUTH_REQUIRED,
  ];
  if (authErrors.includes(code)) {
    return 'auth';
  }
  
  // Permission errors
  if (code === ErrorCode.PERMISSION_DENIED) {
    return 'permission';
  }
  
  // Not found errors
  const notFoundErrors: ErrorCodeType[] = [
    ErrorCode.USER_NOT_FOUND,
    ErrorCode.STUDENT_NOT_FOUND,
    ErrorCode.COURSE_NOT_FOUND,
    ErrorCode.SEMESTER_NOT_FOUND,
    ErrorCode.MAJOR_NOT_FOUND,
    ErrorCode.SUBMISSION_NOT_FOUND,
    ErrorCode.PROGRESS_NOT_FOUND,
    ErrorCode.EMAIL_TEMPLATE_NOT_FOUND,
    ErrorCode.EMAIL_LOG_NOT_FOUND,
    ErrorCode.MAJOR_COURSE_NOT_FOUND,
  ];
  if (notFoundErrors.includes(code)) {
    return 'notFound';
  }
  
  // Validation errors
  const validationErrors: ErrorCodeType[] = [
    ErrorCode.VALIDATION_ERROR,
    ErrorCode.INVALID_INPUT,
    ErrorCode.INVALID_EMAIL_FORMAT,
    ErrorCode.INVALID_FILE_FORMAT,
    ErrorCode.INVALID_GENIALLY_URL,
    ErrorCode.INVALID_SUBMISSION_URL,
    ErrorCode.INVALID_PROJECT_URL,
    ErrorCode.INVALID_PLACEHOLDER,
    ErrorCode.MISSING_REQUIRED_FIELD,
    ErrorCode.WEAK_PASSWORD,
    ErrorCode.PASSWORD_MISMATCH,
  ];
  if (validationErrors.includes(code)) {
    return 'validation';
  }
  
  return 'system';
}

/**
 * Get error severity from error
 */
export function getErrorSeverity(error: AppError | ErrorCodeType): ErrorSeverity {
  const category = getErrorCategory(error);
  
  switch (category) {
    case 'validation':
      return 'warning';
    case 'notFound':
      return 'info';
    case 'network':
    case 'auth':
    case 'permission':
    case 'system':
    default:
      return 'error';
  }
}

/**
 * Check if error should show retry button
 */
export function shouldShowRetry(error: AppError | unknown): boolean {
  if (error instanceof NetworkError) {
    return error.canRetry();
  }
  if (error instanceof AppError) {
    const category = getErrorCategory(error);
    return category === 'network' || (error.details?.retryable === true);
  }
  return isTransientError(error);
}

/**
 * Create a network error from an unknown error
 */
export function createNetworkError(error: unknown): NetworkError {
  const type = getNetworkErrorType(error);
  const message = error instanceof Error ? error.message : String(error);
  
  return new NetworkError(type, message, {
    originalError: error,
    firebaseCode: error instanceof FirebaseError ? error.code : undefined,
  });
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
