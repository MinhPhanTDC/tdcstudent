# Implementation Plan

- [x] 1. Add Lab Training link to AdminSidebar






  - [x] 1.1 Update AdminSidebar navItems array

    - Add "Lab Training" menu item with flask icon after "Tracking"
    - Link to /lab-settings page
    - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [x] 2. Create useNotifications hook




  - [x] 2.1 Implement useNotifications hook with TanStack Query

    - Fetch notifications from notificationService
    - Return notifications, isLoading, error, unreadCount
    - Implement markAsRead and markAllAsRead mutations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ]* 2.2 Write property test for unread count computation
    - **Property 6: Unread count computation**
    - **Validates: Requirements 6.3**

- [x] 3. Create Notifications UI components





  - [x] 3.1 Create NotificationItem component


    - Display notification with type-based styling (success/warning/info)
    - Show appropriate icon based on notification type
    - Handle click to mark as read
    - _Requirements: 2.7, 2.8, 2.9_
  - [x] 3.2 Create NotificationList component


    - Render list of NotificationItem components
    - Handle empty state and loading state
    - _Requirements: 2.5, 2.10, 2.11_
  - [ ]* 3.3 Write property test for notifications sorting
    - **Property 2: Notifications sorted by date descending**
    - **Validates: Requirements 2.5**
  - [x] 3.4 Create notifications page at /notifications


    - Use useNotifications hook to fetch data
    - Display NotificationList component
    - _Requirements: 2.3, 2.4_


- [x] 4. Update StudentSidebar with notification features





  - [x] 4.1 Add notification bell icon to header section

    - Display bell icon next to logo
    - Navigate to /notifications on click
    - _Requirements: 5.1, 5.3_

  - [x] 4.2 Add unread badge indicator
    - Show red dot when unread count > 0
    - Use useNotifications hook for unread count
    - _Requirements: 2.1, 2.2, 5.2, 5.4_
  - [ ]* 4.3 Write property test for unread badge count
    - **Property 1: Unread badge count matches unread notifications**
    - **Validates: Requirements 2.2, 5.2**


- [x] 5. Checkpoint - Ensure all tests pass











  - Ensure all tests pass, ask the user if questions arise.






- [x] 6. Create TrackingLogModal component






  - [x] 6.1 Create TrackingLogModal component


    - Use Modal component from @tdc/ui
    - Fetch tracking logs using useTrackingLogs hook
    - Display TrackingLogList component
    - Handle loading and empty states
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 6.2 Update TrackingRow to add "Lịch sử" button

    - Add button in actions column
    - Open TrackingLogModal on click
    - Pass studentId, courseId, studentName, courseName to modal
    - _Requirements: 3.1_

  - [ ]* 6.3 Write property test for tracking log field display
    - **Property 4: Tracking log displays all required fields**
    - **Validates: Requirements 3.4**



- [x] 7. Enhance Progress page







  - [x] 7.1 Create ProgressOverview component


    - Display overall completion percentage with progress bar
    - Show statistics: total, completed, in-progress courses
    - _Requirements: 4.2, 4.3_
  - [x] 7.2 Create SemesterProgress component


    - Display semester with expandable section
    - Show courses when expanded
    - _Requirements: 4.4, 4.5_
  - [x] 7.3 Create CourseProgressItem component


    - Display course with status-based styling
    - Green/checkmark for completed, blue for in-progress, gray/lock for locked
    - _Requirements: 4.6, 4.7, 4.8_
  - [x] 7.4 Update Progress page to use new components


    - Fetch data using useMyProgress hook
    - Handle loading and empty states
    - _Requirements: 4.1, 4.9, 4.10_
  - [ ]* 7.5 Write property test for progress percentage calculation
    - **Property 5: Progress percentage calculation**
    - **Validates: Requirements 4.2, 4.3**


- [x] 8. Final Checkpoint - Ensure all tests pass







  - Ensure all tests pass, ask the user if questions arise.
