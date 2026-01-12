# Requirements Document

## Introduction

Phase 4 - Tracking & Progress xây dựng hệ thống tracking để Admin theo dõi và quản lý tiến độ học viên. Bao gồm: bảng tracking học viên theo môn, cập nhật số buổi/dự án hoàn thành, logic pass môn, Quick Track bulk pass, và tự động mở khóa môn/học kỳ tiếp theo. Phase này là core feature giúp Admin quản lý hiệu quả tiến trình học tập của học viên trong hệ thống The Design Council.

## Glossary

- **Admin_Dashboard**: Ứng dụng web dành cho admin tại `apps/admin`
- **Tracking_Table**: Bảng hiển thị tiến độ học viên theo môn học
- **Progress**: Tiến độ học tập của học viên (số buổi, số dự án, trạng thái)
- **Pass_Condition**: Điều kiện để học viên pass môn (đủ buổi + đủ dự án + có link kết quả)
- **Quick_Track**: Tính năng pass nhanh nhiều học viên cùng lúc
- **Bulk_Pass**: Hành động duyệt pass cho nhiều học viên đã chọn
- **Unlock_Logic**: Logic tự động mở khóa môn/học kỳ tiếp theo khi hoàn thành
- **Pending_Approval**: Trạng thái chờ admin duyệt khi học viên đủ điều kiện pass
- **Rejected**: Trạng thái bị từ chối với lý do cụ thể
- **Tracking_Log**: Lịch sử thay đổi tiến độ (audit trail)
- **Inline_Edit**: Chỉnh sửa trực tiếp trên bảng không cần mở form riêng
- **Project_Link**: Link kết quả dự án học viên nộp

## Requirements

### Requirement 1: Tracking Table Display

**User Story:** As an admin, I want to view student progress in a tracking table, so that I can monitor learning progress by course.

#### Acceptance Criteria

1. WHEN an admin navigates to the tracking page THEN the Admin_Dashboard SHALL display a tracking table with student progress data
2. WHEN displaying the tracking table THEN the Admin_Dashboard SHALL show columns: student name, email, completed sessions, submitted projects, project links, and status
3. WHEN an admin selects a semester filter THEN the Admin_Dashboard SHALL display only courses belonging to that semester
4. WHEN an admin selects a course filter THEN the Admin_Dashboard SHALL display only students enrolled in that course
5. WHEN an admin enters a search term THEN the Admin_Dashboard SHALL filter students by name or email containing the search term
6. WHEN displaying more than 20 students THEN the Admin_Dashboard SHALL paginate results with navigation controls
7. WHEN an admin clicks a column header THEN the Admin_Dashboard SHALL sort the table by that column

### Requirement 2: Inline Progress Update

**User Story:** As an admin, I want to update student progress inline, so that I can quickly adjust session and project counts.

#### Acceptance Criteria

1. WHEN an admin clicks on the sessions count THEN the Admin_Dashboard SHALL display an inline dropdown to select a new value
2. WHEN an admin clicks on the projects count THEN the Admin_Dashboard SHALL display an inline dropdown to select a new value
3. WHEN an admin selects a new value THEN the Admin_Dashboard SHALL auto-save the change without requiring a submit button
4. WHEN an admin attempts to set sessions above the required count THEN the Admin_Dashboard SHALL prevent the change and display a validation error
5. WHEN an admin attempts to set projects above the required count THEN the Admin_Dashboard SHALL prevent the change and display a validation error
6. WHEN an admin adds a project link THEN the Admin_Dashboard SHALL validate the URL format before saving
7. WHEN a progress update is saved THEN the Admin_Dashboard SHALL display a success notification

### Requirement 3: Pass Condition Logic

**User Story:** As an admin, I want the system to detect when students meet pass conditions, so that I can efficiently approve completions.

#### Acceptance Criteria

1. WHEN a student has completed all required sessions AND submitted all required projects AND has at least one project link THEN the Admin_Dashboard SHALL automatically change status to pending_approval
2. WHEN a student status changes to pending_approval THEN the Admin_Dashboard SHALL display an "Approve" button for that student
3. WHEN an admin clicks the Approve button THEN the Admin_Dashboard SHALL change the student status to completed and record the approval timestamp
4. WHEN an admin clicks the Reject button THEN the Admin_Dashboard SHALL display a modal to enter rejection reason
5. WHEN an admin submits a rejection THEN the Admin_Dashboard SHALL change status to rejected and store the rejection reason
6. WHEN displaying a student who does not meet pass conditions THEN the Admin_Dashboard SHALL show which conditions are not met

### Requirement 4: Quick Track Bulk Pass

**User Story:** As an admin, I want to pass multiple students at once, so that I can save time when many students complete a course.

#### Acceptance Criteria

1. WHEN an admin navigates to the Quick Track tab THEN the Admin_Dashboard SHALL display only students with pending_approval status
2. WHEN displaying the Quick Track list THEN the Admin_Dashboard SHALL show checkboxes for each student row
3. WHEN an admin clicks "Select All" THEN the Admin_Dashboard SHALL check all visible student checkboxes
4. WHEN an admin clicks "Pass Selected" with students selected THEN the Admin_Dashboard SHALL display a confirmation dialog showing the count
5. WHEN an admin confirms bulk pass THEN the Admin_Dashboard SHALL process all selected students and display a progress indicator
6. WHEN bulk pass completes THEN the Admin_Dashboard SHALL display a summary report with success and failure counts
7. IF any student fails to pass during bulk operation THEN the Admin_Dashboard SHALL continue processing remaining students and include failures in the report

### Requirement 5: Automatic Course Unlock

**User Story:** As an admin, I want the system to automatically unlock the next course when a student passes, so that students can continue learning without manual intervention.

#### Acceptance Criteria

1. WHEN a student status changes to completed THEN the Admin_Dashboard SHALL identify the next course in the same semester by order
2. WHEN a next course exists in the same semester THEN the Admin_Dashboard SHALL change that course progress status from locked to not_started
3. WHEN no next course exists in the semester THEN the Admin_Dashboard SHALL check if all courses in the semester are completed
4. WHEN all courses in a semester are completed THEN the Admin_Dashboard SHALL identify the next semester by order
5. WHEN a next semester exists THEN the Admin_Dashboard SHALL update the student currentSemesterId and unlock the first course

### Requirement 6: Progress Status Schema Extension

**User Story:** As a system architect, I want to extend the progress schema to support approval workflow, so that pass/reject actions can be tracked.

#### Acceptance Criteria

1. WHEN creating a progress record THEN the Admin_Dashboard SHALL validate status as one of: not_started, in_progress, pending_approval, completed, rejected, locked
2. WHEN a progress is rejected THEN the Admin_Dashboard SHALL store the rejectionReason as a non-empty string
3. WHEN a progress is approved THEN the Admin_Dashboard SHALL store the approvedAt timestamp and approvedBy admin userId
4. WHEN serializing progress data THEN the Admin_Dashboard SHALL produce valid JSON that can be deserialized back to the original structure
5. WHEN updating progress status THEN the Admin_Dashboard SHALL automatically update the updatedAt timestamp

### Requirement 7: Tracking Log Audit Trail

**User Story:** As an admin, I want to see the history of progress changes, so that I can audit modifications for compliance.

#### Acceptance Criteria

1. WHEN an admin updates session count THEN the Admin_Dashboard SHALL create a tracking log entry with previous and new values
2. WHEN an admin updates project count THEN the Admin_Dashboard SHALL create a tracking log entry with previous and new values
3. WHEN an admin approves or rejects a student THEN the Admin_Dashboard SHALL create a tracking log entry with the action
4. WHEN displaying a student detail THEN the Admin_Dashboard SHALL show recent tracking log entries for that student
5. WHEN creating a tracking log THEN the Admin_Dashboard SHALL record the admin userId and timestamp

### Requirement 8: Notification on Status Change

**User Story:** As a student, I want to be notified when my course status changes, so that I know when I pass or need to take action.

#### Acceptance Criteria

1. WHEN a student status changes to completed THEN the Admin_Dashboard SHALL create a notification for the student
2. WHEN a student status changes to rejected THEN the Admin_Dashboard SHALL create a notification with the rejection reason
3. WHEN a new course is unlocked THEN the Admin_Dashboard SHALL create a notification informing the student
4. WHEN a new semester is unlocked THEN the Admin_Dashboard SHALL create a notification informing the student

### Requirement 9: Error Handling

**User Story:** As an admin, I want clear error messages when operations fail, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN a progress update fails THEN the Admin_Dashboard SHALL display a user-friendly error message in Vietnamese
2. WHEN bulk pass encounters errors THEN the Admin_Dashboard SHALL display which students failed and why
3. WHEN unlock logic fails THEN the Admin_Dashboard SHALL log the error and display a notification to retry
4. WHEN validation fails THEN the Admin_Dashboard SHALL highlight the invalid field with a specific error message

### Requirement 10: UI/UX Standards

**User Story:** As an admin, I want a consistent and efficient interface, so that I can manage tracking quickly.

#### Acceptance Criteria

1. WHEN loading tracking data THEN the Admin_Dashboard SHALL display skeleton loading states
2. WHEN no students match filters THEN the Admin_Dashboard SHALL display an empty state with guidance
3. WHEN an operation succeeds THEN the Admin_Dashboard SHALL display a success toast notification
4. WHEN switching between Tracking and Quick Track tabs THEN the Admin_Dashboard SHALL preserve filter selections
5. WHEN displaying status THEN the Admin_Dashboard SHALL use consistent icons and colors: green checkmark for completed, yellow clock for pending_approval, red X for rejected, blue spinner for in_progress, gray lock for locked

