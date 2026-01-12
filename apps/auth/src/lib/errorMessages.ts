import { ErrorCode, type ErrorCodeType } from '@tdc/types';

/**
 * Vietnamese error messages mapping
 */
const ERROR_MESSAGES: Record<ErrorCodeType, string> = {
  // Auth errors
  [ErrorCode.UNAUTHORIZED]: 'Bạn không có quyền truy cập',
  [ErrorCode.INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không đúng',
  [ErrorCode.SESSION_EXPIRED]: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'Email chưa được xác thực',
  [ErrorCode.TOO_MANY_ATTEMPTS]: 'Quá nhiều lần thử, vui lòng thử lại sau',

  // User errors
  [ErrorCode.USER_NOT_FOUND]: 'Không tìm thấy tài khoản',
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
  [ErrorCode.INVALID_SEMESTER_REFERENCE]: 'Học kỳ không hợp lệ',
  [ErrorCode.INVALID_GENIALLY_URL]: 'URL Genially không hợp lệ',

  // Semester errors
  [ErrorCode.SEMESTER_NOT_FOUND]: 'Không tìm thấy học kỳ',
  [ErrorCode.SEMESTER_HAS_COURSES]: 'Không thể xóa học kỳ đang có môn học',
  [ErrorCode.DUPLICATE_SEMESTER_ORDER]: 'Thứ tự học kỳ đã tồn tại',

  // Import errors
  [ErrorCode.INVALID_FILE_FORMAT]: 'Định dạng file không hỗ trợ',
  [ErrorCode.IMPORT_RATE_LIMITED]: 'Đang xử lý, vui lòng đợi',
  [ErrorCode.IMPORT_PARTIAL_FAILURE]: 'Một số bản ghi không thể import',
  [ErrorCode.INVALID_EMAIL_FORMAT]: 'Định dạng email không hợp lệ',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Thiếu trường bắt buộc',
  [ErrorCode.DUPLICATE_EMAIL_IN_FILE]: 'Email bị trùng lặp trong file',

  // Validation errors
  [ErrorCode.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ',
  [ErrorCode.INVALID_INPUT]: 'Thông tin nhập không hợp lệ',

  // System errors
  [ErrorCode.UNKNOWN_ERROR]: 'Đã xảy ra lỗi, vui lòng thử lại',
  [ErrorCode.NETWORK_ERROR]: 'Lỗi kết nối mạng, vui lòng kiểm tra kết nối',
  [ErrorCode.DATABASE_ERROR]: 'Lỗi hệ thống, vui lòng thử lại sau',
  [ErrorCode.PERMISSION_DENIED]: 'Bạn không có quyền thực hiện thao tác này',

  // Progress errors (Phase 3)
  [ErrorCode.PROGRESS_NOT_FOUND]: 'Không tìm thấy tiến độ học tập',
  [ErrorCode.PROGRESS_UPDATE_FAILED]: 'Cập nhật tiến độ thất bại',

  // Project submission errors (Phase 3)
  [ErrorCode.SUBMISSION_NOT_FOUND]: 'Không tìm thấy bài nộp',
  [ErrorCode.SUBMISSION_CREATE_FAILED]: 'Nộp bài thất bại',
  [ErrorCode.SUBMISSION_UPDATE_FAILED]: 'Cập nhật bài nộp thất bại',
  [ErrorCode.SUBMISSION_DELETE_FAILED]: 'Xóa bài nộp thất bại',
  [ErrorCode.INVALID_SUBMISSION_URL]: 'URL không hợp lệ. Vui lòng sử dụng link Google Drive hoặc Behance',
  [ErrorCode.SUBMISSION_ALREADY_EXISTS]: 'Bài nộp đã tồn tại cho dự án này',

  // Course access errors (Phase 3)
  [ErrorCode.COURSE_LOCKED]: 'Môn học chưa được mở khóa',
  [ErrorCode.PREREQUISITE_NOT_COMPLETED]: 'Vui lòng hoàn thành môn trước để mở khóa',

  // Tracking errors (Phase 4) - Validation
  [ErrorCode.SESSIONS_EXCEED_REQUIRED]: 'Số buổi không được vượt quá yêu cầu',
  [ErrorCode.PROJECTS_EXCEED_REQUIRED]: 'Số dự án không được vượt quá yêu cầu',
  [ErrorCode.INVALID_PROJECT_URL]: 'Link dự án không hợp lệ',
  [ErrorCode.REJECTION_REASON_REQUIRED]: 'Vui lòng nhập lý do từ chối',

  // Tracking errors (Phase 4) - State
  [ErrorCode.INVALID_STATUS_TRANSITION]: 'Không thể chuyển trạng thái',
  [ErrorCode.ALREADY_APPROVED]: 'Học viên đã được duyệt',
  [ErrorCode.NOT_PENDING_APPROVAL]: 'Học viên chưa đủ điều kiện duyệt',

  // Tracking errors (Phase 4) - Unlock
  [ErrorCode.UNLOCK_FAILED]: 'Không thể mở khóa môn tiếp theo',
  [ErrorCode.NO_NEXT_COURSE]: 'Không có môn học tiếp theo',
  [ErrorCode.NO_NEXT_SEMESTER]: 'Không có học kỳ tiếp theo',

  // Tracking errors (Phase 4) - Bulk operations
  [ErrorCode.BULK_PASS_PARTIAL_FAILURE]: 'Một số học viên không thể duyệt',
  [ErrorCode.BULK_PASS_FAILED]: 'Duyệt hàng loạt thất bại',

  // Tracking errors (Phase 4) - Logging
  [ErrorCode.TRACKING_LOG_CREATE_FAILED]: 'Không thể tạo log theo dõi',

  // Tracking errors (Phase 4) - Notifications
  [ErrorCode.NOTIFICATION_CREATE_FAILED]: 'Không thể tạo thông báo',

  // Major errors (Phase 5)
  [ErrorCode.MAJOR_NOT_FOUND]: 'Không tìm thấy chuyên ngành',
  [ErrorCode.MAJOR_NAME_REQUIRED]: 'Tên chuyên ngành không được để trống',
  [ErrorCode.MAJOR_ALREADY_EXISTS]: 'Chuyên ngành đã tồn tại',

  // MajorCourse errors (Phase 5)
  [ErrorCode.MAJOR_COURSE_NOT_FOUND]: 'Không tìm thấy môn học trong chuyên ngành',
  [ErrorCode.MAJOR_COURSE_DUPLICATE]: 'Môn học đã có trong chuyên ngành',

  // Major selection errors (Phase 5)
  [ErrorCode.MAJOR_SELECTION_REQUIRED]: 'Bạn cần chọn chuyên ngành để tiếp tục',
  [ErrorCode.MAJOR_ALREADY_SELECTED]: 'Bạn đã chọn chuyên ngành và không thể thay đổi',
  [ErrorCode.MAJOR_SELECTION_BLOCKED]: 'Chưa đến thời điểm chọn chuyên ngành',
};

/**
 * Get localized error message from error code
 */
export function getErrorMessage(code: ErrorCodeType | string): string {
  return ERROR_MESSAGES[code as ErrorCodeType] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}
