# Implementation Plan

- [x] 1. Extend Progress Schema and Create New Schemas



  - [x] 1.1 Extend progress.schema.ts with new status values and approval fields


    - Add pending_approval, rejected to ProgressStatusSchema
    - Add rejectionReason, approvedAt, approvedBy, projectLinks fields
    - Update CreateProgressInputSchema and UpdateProgressInputSchema
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 1.2 Write property test for progress schema serialization round trip


    - **Property 21: Progress Serialization Round Trip**
    - **Validates: Requirements 6.4**
  - [x] 1.3 Create tracking-log.schema.ts


    - Define TrackingActionSchema enum
    - Define TrackingLogSchema with all required fields
    - Export types and create input schemas
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  - [x] 1.4 Create notification.schema.ts


    - Define NotificationTypeSchema enum
    - Define NotificationSchema with all required fields
    - Export types and create input schemas
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 1.5 Update packages/schemas/src/index.ts with new exports


    - Export all new schemas and types
    - _Requirements: 6.1_

- [x] 2. Create Repository Layer



  - [x] 2.1 Create tracking-log.repository.ts


    - Implement create, findByStudentCourse, findByStudent methods
    - Use BaseRepository pattern
    - _Requirements: 7.1, 7.2, 7.3_


  - [x] 2.2 Write property test for tracking log creation

    - **Property 22: Tracking Log Creation on Update**
    - **Validates: Requirements 7.1, 7.2**
  - [x] 2.3 Create notification.repository.ts

    - Implement create, findByUser, markAsRead methods
    - Use BaseRepository pattern
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 2.4 Extend progress.repository.ts


    - Add findByStudentAndCourse, findByCourse, updateStatus methods
    - Add findPendingApproval for Quick Track
    - _Requirements: 1.4, 4.1_
  - [x] 2.5 Write property test for progress repository queries



    - **Property 11: Quick Track Filter**
    - **Validates: Requirements 4.1**

- [x] 3. Create Service Layer





  - [x] 3.1 Create tracking.service.ts


    - Implement updateProgress with validation
    - Implement checkPassCondition logic
    - Implement approve and reject methods
    - Create tracking logs on each action
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 3.1, 3.3, 3.5_
  - [x] 3.2 Write property test for pass condition detection


    - **Property 8: Pass Condition Detection**
    - **Validates: Requirements 3.1**
  - [x] 3.3 Write property test for session count validation

    - **Property 5: Session Count Validation**
    - **Validates: Requirements 2.4**
  - [x] 3.4 Write property test for project count validation

    - **Property 6: Project Count Validation**
    - **Validates: Requirements 2.5**
  - [x] 3.5 Write property test for URL format validation

    - **Property 7: URL Format Validation**
    - **Validates: Requirements 2.6**
  - [x] 3.6 Write property test for approval state transition


    - **Property 9: Approval State Transition**
    - **Validates: Requirements 3.3**
  - [x] 3.7 Write property test for rejection state transition

    - **Property 10: Rejection State Transition**
    - **Validates: Requirements 3.5**
  - [x] 3.8 Create unlock.service.ts


    - Implement unlockNextCourse logic
    - Implement checkUnlockNextSemester logic
    - Create notifications on unlock
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 3.9 Write property test for next course unlock


    - **Property 15: Next Course Unlock**
    - **Validates: Requirements 5.1, 5.2**
  - [x] 3.10 Write property test for semester completion check

    - **Property 16: Semester Completion Check**
    - **Validates: Requirements 5.3, 5.4**
  - [x] 3.11 Write property test for semester transition

    - **Property 17: Semester Transition**
    - **Validates: Requirements 5.5**
  - [x] 3.12 Create notification.service.ts


    - Implement createCompletionNotification
    - Implement createRejectionNotification
    - Implement createUnlockNotification
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 3.13 Write property test for notification on completion


    - **Property 24: Notification on Completion**
    - **Validates: Requirements 8.1**
  - [x] 3.14 Write property test for notification on rejection

    - **Property 25: Notification on Rejection**
    - **Validates: Requirements 8.2**
  - [x] 3.15 Write property test for notification on unlock

    - **Property 26: Notification on Unlock**
    - **Validates: Requirements 8.3, 8.4**

- [x] 4. Checkpoint - Ensure all service tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create Bulk Pass Service





  - [x] 5.1 Create bulk-pass.service.ts


    - Implement bulkPass method with error handling
    - Process all selected students
    - Collect and report failures
    - _Requirements: 4.5, 4.6, 4.7_
  - [x] 5.2 Write property test for bulk pass processing


    - **Property 13: Bulk Pass Processing**
    - **Validates: Requirements 4.5, 4.6**

  - [x] 5.3 Write property test for bulk pass resilience

    - **Property 14: Bulk Pass Resilience**
    - **Validates: Requirements 4.7**

- [x] 6. Create Admin Hooks





  - [x] 6.1 Create useTracking.ts hook


    - Fetch tracking data with filters
    - Handle pagination and sorting
    - Provide update, approve, reject mutations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 6.2 Create useTrackingFilters.ts hook


    - Manage semester, course, search filter state
    - Preserve state across tab switches
    - _Requirements: 1.3, 1.4, 1.5, 10.4_
  - [x] 6.3 Write property test for filter state preservation


    - **Property 27: Filter State Preservation**
    - **Validates: Requirements 10.4**
  - [x] 6.4 Create useInlineEdit.ts hook


    - Handle inline edit state
    - Auto-save on value change
    - Validation before save
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 6.5 Create useBulkPass.ts hook


    - Manage selection state
    - Handle bulk pass mutation
    - Track processing progress
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 6.6 Write property test for select all completeness


    - **Property 12: Select All Completeness**
    - **Validates: Requirements 4.3**
  - [x] 6.7 Create useTrackingLogs.ts hook


    - Fetch logs by student/course
    - _Requirements: 7.4_

- [x] 7. Create Tracking Table Components



  - [x] 7.1 Create TrackingFilters.tsx


    - Semester dropdown filter
    - Course dropdown filter (filtered by semester)
    - Search input with debounce
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 7.2 Write property test for filter results consistency


    - **Property 1: Filter Results Consistency**
    - **Validates: Requirements 1.3**

  - [x] 7.3 Write property test for search results containment
    - **Property 2: Search Results Containment**

    - **Validates: Requirements 1.5**
  - [x] 7.4 Create TrackingTable.tsx

    - Display columns: name, email, sessions, projects, links, status
    - Sortable column headers
    - Loading skeleton state
    - Empty state
    - _Requirements: 1.1, 1.2, 1.7, 10.1, 10.2_


  - [x] 7.5 Write property test for sort order preservation


    - **Property 4: Sort Order Preservation**
    - **Validates: Requirements 1.7**
  - [x] 7.6 Create TrackingRow.tsx
    - Display student data


    - Inline edit triggers
    - Status badge
    - Action buttons

    - _Requirements: 1.2, 2.1, 2.2_
  - [x] 7.7 Create TrackingPagination.tsx
    - Page navigation controls
    - Page size selector
    - Total count display
    - _Requirements: 1.6_
  - [x] 7.8 Write property test for pagination threshold


    - **Property 3: Pagination Threshold**
    - **Validates: Requirements 1.6**

- [x] 8. Create Inline Edit Components





  - [x] 8.1 Create SessionsDropdown.tsx


    - Dropdown with values 0 to requiredSessions
    - Auto-save on selection
    - Validation feedback


    - _Requirements: 2.1, 2.3, 2.4_
  - [x] 8.2 Create ProjectsDropdown.tsx
    - Dropdown with values 0 to requiredProjects

    - Auto-save on selection
    - Validation feedback
    - _Requirements: 2.2, 2.3, 2.5_
  - [x] 8.3 Create ProjectLinksEditor.tsx

    - List existing links
    - Add new link input with URL validation
    - Remove link button
    - _Requirements: 2.6_

- [x] 9. Create Status Action Components





  - [x] 9.1 Create StatusBadge.tsx


    - Display status with icon and color
    - Show missing conditions tooltip
    - _Requirements: 3.6, 10.5_
  - [x] 9.2 Create ApproveButton.tsx


    - Visible only for pending_approval status
    - Confirm action
    - Success/error feedback
    - _Requirements: 3.2, 3.3_
  - [x] 9.3 Create RejectModal.tsx


    - Modal with reason textarea
    - Required validation for reason
    - Submit and cancel buttons
    - _Requirements: 3.4, 3.5_
  - [x] 9.4 Write property test for rejection reason required


    - **Property 19: Rejection Reason Required**
    - **Validates: Requirements 6.2**
  - [x] 9.5 Write property test for approval metadata required


    - **Property 20: Approval Metadata Required**
    - **Validates: Requirements 6.3**

- [x] 10. Checkpoint - Ensure tracking table tests pass





  - Ensure all tests pass, ask the user if questions arise.



- [x] 11. Create Quick Track Components





  - [x] 11.1 Create QuickTrackTable.tsx


    - Display only pending_approval students
    - Checkbox column for selection
    - Student info columns
    - _Requirements: 4.1, 4.2_
  - [x] 11.2 Create QuickTrackActions.tsx


    - Select All / Deselect All buttons
    - Pass Selected button with count
    - Disabled state when none selected
    - _Requirements: 4.3, 4.4_
  - [x] 11.3 Create BulkPassModal.tsx


    - Confirmation dialog with selected count
    - Processing progress indicator
    - Cancel button during processing

    - _Requirements: 4.4, 4.5_
  - [x] 11.4 Create BulkPassReport.tsx



    - Summary of success/failure counts
    - List of failed students with reasons
    - Close button
    - _Requirements: 4.6, 4.7, 9.2_







- [x] 12. Create Tracking Logs Components


  - [x] 12.1 Create TrackingLogList.tsx
    - Display recent log entries
    - Show action, values, admin, timestamp
    - _Requirements: 7.4_
  - [x] 12.2 Write property test for tracking log creation on approval

    - **Property 23: Tracking Log Creation on Approval**

    - **Validates: Requirements 7.3**


- [x] 13. Create Tracking Page



  - [x] 13.1 Create apps/admin/src/app/(dashboard)/tracking/page.tsx


    - Tab navigation: Tracking | Quick Track
    - Integrate TrackingFilters
    - Integrate TrackingTable or QuickTrackTable based on tab
    - _Requirements: 1.1, 4.1_

  - [x] 13.2 Add tracking route to admin sidebar navigation


    - Add menu item with icon
    - _Requirements: 1.1_


- [x] 14. Update Firestore Security Rules

  - [x] 14.1 Add rules for progress collection
    - Read: admin or owner student
    - Write: admin only
    - _Requirements: 6.1_

  - [x] 14.2 Add rules for trackingLogs collection
    - Read/Write: admin only
    - _Requirements: 7.1_

  - [x] 14.3 Add rules for notifications collection
    - Read: owner only
    - Update isRead: owner only
    - Write: admin only
    - _Requirements: 8.1_

- [x] 15. Integration and Error Handling





  - [x] 15.1 Add tracking error codes to error.types.ts


    - Add all TrackingErrorCode values
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 15.2 Add tracking error messages to errorMessages.ts


    - Add Vietnamese messages for all error codes
    - _Requirements: 9.1_


  - [x] 15.3 Integrate unlock service with approve action








    - Call unlockNextCourse after successful approval
    - Handle unlock errors gracefully


    - _Requirements: 5.1, 5.2, 9.3_




- [x] 16. Final Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

