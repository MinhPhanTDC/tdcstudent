# Requirements Document

## Introduction

Spec này giải quyết các vấn đề về UI integration đã được phát hiện trong quá trình kiểm tra codebase từ Phase 1-7. Các vấn đề bao gồm: thiếu link trong sidebar, services/repositories đã tạo nhưng chưa sử dụng trong UI, components đã tạo nhưng chưa được tích hợp vào pages, và pages có nội dung placeholder.

## Glossary

- **AdminSidebar**: Component navigation chính của admin dashboard
- **StudentSidebar**: Component navigation chính của student portal  
- **StudentLayout**: Layout component chứa header và sidebar cho student portal
- **Notification**: Thông báo gửi đến student khi có sự kiện (hoàn thành khóa học, bị từ chối, mở khóa khóa học mới)
- **NotificationService**: Service xử lý logic tạo và quản lý notifications (đã tồn tại trong packages/firebase)
- **NotificationRepository**: Repository truy cập dữ liệu notifications từ Firestore (đã tồn tại)
- **TrackingLogList**: Component hiển thị lịch sử thay đổi tracking của student (đã tồn tại)
- **TrackingLogModal**: Modal component chứa TrackingLogList để hiển thị trong tracking page
- **Progress Page**: Trang hiển thị tiến độ học tập chi tiết của student
- **useNotifications**: Hook để fetch và quản lý notifications trong UI
- **useTrackingLogs**: Hook để fetch tracking logs cho một student-course cụ thể (đã tồn tại)

## Requirements

### Requirement 1: Admin Sidebar Lab Settings Link

**User Story:** As an admin, I want to access Lab Settings from the sidebar, so that I can manage lab training requirements without manually typing the URL.

#### Acceptance Criteria

1. WHEN an admin views the AdminSidebar THEN the system SHALL display a "Lab Training" menu item with flask/beaker icon in the main navigation section
2. WHEN an admin clicks on "Lab Training" menu item THEN the system SHALL navigate to /lab-settings page
3. WHEN the current route is /lab-settings THEN the system SHALL highlight the "Lab Training" menu item as active
4. WHEN the AdminSidebar renders THEN the system SHALL position "Lab Training" menu item after "Tracking" in the navigation order

### Requirement 2: Student Notifications UI

**User Story:** As a student, I want to view my notifications, so that I can stay informed about course completions, rejections, and new course unlocks.

#### Acceptance Criteria

1. WHEN a student views the StudentSidebar THEN the system SHALL display a "Thông báo" menu item with bell icon
2. WHEN a student has unread notifications THEN the system SHALL display a badge with unread count on the notification menu item
3. WHEN a student clicks on "Thông báo" menu item THEN the system SHALL navigate to /notifications page
4. WHEN a student visits /notifications page THEN the system SHALL render a NotificationsPage component that fetches data using useNotifications hook
5. WHEN a student views the notifications page THEN the system SHALL display a list of notifications sorted by date descending
6. WHEN a student clicks on a notification THEN the system SHALL mark it as read and update the unread count
7. WHEN a notification is about course completion THEN the system SHALL display success styling with checkmark icon
8. WHEN a notification is about rejection THEN the system SHALL display warning styling with alert icon
9. WHEN a notification is about course unlock THEN the system SHALL display info styling with unlock icon
10. WHEN there are no notifications THEN the system SHALL display an empty state with appropriate message
11. WHEN notifications are loading THEN the system SHALL display a skeleton loading state

### Requirement 3: Tracking Log Integration

**User Story:** As an admin, I want to view tracking history for each student-course combination, so that I can audit changes made to student progress.

#### Acceptance Criteria

1. WHEN an admin views a student's tracking row THEN the system SHALL display a "Lịch sử" button in the actions column
2. WHEN an admin clicks the "Lịch sử" button THEN the system SHALL open a TrackingLogModal component
3. WHEN the TrackingLogModal opens THEN the system SHALL fetch tracking logs using useTrackingLogs hook with studentId and courseId parameters
4. WHEN viewing tracking logs in the modal THEN the system SHALL display TrackingLogList component showing action type, old value, new value, timestamp, and admin who performed the action
5. WHEN there are no tracking logs THEN the system SHALL display an empty state message "Chưa có lịch sử thay đổi"
6. WHEN tracking logs are loading THEN the system SHALL display a skeleton loading state
7. WHEN an admin clicks outside the modal or the close button THEN the system SHALL close the TrackingLogModal

### Requirement 4: Student Progress Page Enhancement

**User Story:** As a student, I want to view my detailed learning progress, so that I can track my advancement through all semesters and courses.

#### Acceptance Criteria

1. WHEN a student visits /progress page THEN the system SHALL fetch progress data using useMyProgress hook
2. WHEN a student views progress page THEN the system SHALL display overall completion percentage with progress bar
3. WHEN a student views progress page THEN the system SHALL display statistics: total courses, completed courses, in-progress courses
4. WHEN a student views progress page THEN the system SHALL display progress by semester with expandable sections
5. WHEN a student expands a semester section THEN the system SHALL display courses with individual progress percentages
6. WHEN a course is completed THEN the system SHALL display it with success styling (green) and checkmark icon
7. WHEN a course is in progress THEN the system SHALL display it with primary styling (blue) and progress percentage
8. WHEN a course is locked THEN the system SHALL display it with muted styling (gray) and lock icon
9. WHEN progress data is loading THEN the system SHALL display a skeleton loading state
10. WHEN there is no progress data THEN the system SHALL display an empty state with message "Bắt đầu học để theo dõi tiến độ của bạn"

### Requirement 5: Notification Bell in Student Header

**User Story:** As a student, I want to see notification indicator in the header, so that I can quickly know if I have new notifications.

#### Acceptance Criteria

1. WHEN a student views the StudentSidebar header section THEN the system SHALL display a notification bell icon next to the logo
2. WHEN there are unread notifications THEN the system SHALL display a red dot indicator on the bell icon
3. WHEN a student clicks the bell icon THEN the system SHALL navigate to /notifications page
4. WHEN the unread count changes THEN the system SHALL update the red dot indicator in real-time

### Requirement 6: useNotifications Hook

**User Story:** As a developer, I want a reusable hook to manage notifications, so that I can easily integrate notification features across the student portal.

#### Acceptance Criteria

1. WHEN useNotifications hook is called THEN the system SHALL return notifications array, isLoading state, and error state
2. WHEN useNotifications hook is called THEN the system SHALL fetch notifications from NotificationService using the current user's ID
3. WHEN useNotifications hook is called THEN the system SHALL return unreadCount computed from notifications array
4. WHEN useNotifications hook is called THEN the system SHALL return markAsRead function to mark a single notification as read
5. WHEN useNotifications hook is called THEN the system SHALL return markAllAsRead function to mark all notifications as read
6. WHEN markAsRead is called THEN the system SHALL update the notification's isRead status and invalidate the query cache

