# Implementation Plan

- [x] 1. Create Lab Requirement and Progress schemas





  - [x] 1.1 Create LabRequirementSchema with title, description, helpUrl, order, isActive, requiresVerification fields


    - Define schema in packages/schemas/src/lab-requirement.schema.ts
    - Export CreateLabRequirementInput and UpdateLabRequirementInput types
    - _Requirements: 3.2, 9.1_
  - [x] 1.2 Write property test for Lab requirement schema round-trip


    - **Property 13: Lab requirement schema round-trip**
    - **Validates: Requirements 9.1, 9.2, 9.4**
  - [x] 1.3 Create StudentLabProgressSchema with studentId, requirementId, status, completedAt, verifiedBy, rejectionReason fields


    - Define schema in packages/schemas/src/lab-progress.schema.ts
    - Include LabProgressStatusSchema enum
    - _Requirements: 9.3_
  - [x] 1.4 Write property test for Student progress schema round-trip


    - **Property 14: Student progress schema round-trip**
    - **Validates: Requirements 9.3, 9.4**
  - [x] 1.5 Create ActivitySchema and HandbookSettingsSchema


    - Define in packages/schemas/src/activity.schema.ts and handbook.schema.ts
    - Include ActivityTypeSchema enum
    - _Requirements: 6.2, 6.3, 6.4, 7.2_
  - [x] 1.6 Export all new schemas from packages/schemas/src/index.ts


    - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Implement Lab Requirement repository and service








  - [x] 2.1 Create lab-requirement.repository.ts extending BaseRepository


    - Implement findAll, findActive, findById, create, update, delete, reorder methods
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [x] 2.2 Write property test for title validation bounds


    - **Property 4: Title validation bounds**
    - **Validates: Requirements 3.2**
  - [x] 2.3 Create lab-requirement.service.ts with business logic

    - Implement createRequirement, updateRequirement, deleteRequirement, toggleActive, reorderRequirements
    - Handle cascade delete of related progress records
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 2.4 Write property test for requirement ordering consistency


    - **Property 5: Requirement ordering consistency**
    - **Validates: Requirements 3.6**
  - [x] 2.5 Write property test for cascade delete integrity


    - **Property 6: Cascade delete integrity**
    - **Validates: Requirements 3.4**

- [x] 3. Implement Lab Progress repository and service







  - [x] 3.1 Create lab-progress.repository.ts extending BaseRepository


    - Implement findByStudent, findByRequirement, findPending, create, update methods
    - _Requirements: 1.2, 2.1, 2.2, 4.1_
  - [x] 3.2 Create lab-progress.service.ts with business logic


    - Implement markComplete (handles verification flow), approve, reject methods
    - Create notifications on status changes
    - _Requirements: 2.1, 2.2, 4.3, 4.4_

  - [x] 3.3 Write property test for verification flow status transition

    - **Property 3: Verification flow status transition**

    - **Validates: Requirements 2.1, 2.2**
  - [x] 3.4 Write property test for verification approval state

    - **Property 7: Verification approval state**
    - **Validates: Requirements 4.3**
  - [x] 3.5 Write property test for verification rejection state


    - **Property 8: Verification rejection state**
    - **Validates: Requirements 4.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build Student Lab Training page





  - [x] 5.1 Create useLabRequirements hook


    - Fetch active requirements ordered by order field
    - _Requirements: 1.1, 1.5_
  - [x] 5.2 Create useStudentLabProgress hook


    - Fetch progress for current student, provide markComplete mutation
    - _Requirements: 1.2, 2.1, 2.2, 2.4_
  - [x] 5.3 Create LabProgressBar component


    - Display percentage based on completed/total
    - _Requirements: 1.3, 2.3_
  - [x] 5.4 Write property test for progress percentage calculation


    - **Property 1: Progress percentage calculation**
    - **Validates: Requirements 1.3, 2.3**
  - [x] 5.5 Create RequirementCard component


    - Display title, description, helpUrl link, status badge, mark complete button
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2_
  - [x] 5.6 Create RequirementList component


    - Render list of RequirementCard components
    - _Requirements: 1.1, 1.5_
  - [x] 5.7 Write property test for active requirements filtering


    - **Property 2: Active requirements filtering**
    - **Validates: Requirements 1.1, 1.5, 3.5**
  - [x] 5.8 Create Lab Training page at apps/student/src/app/(portal)/lab-training/page.tsx


    - Compose RequirementList, LabProgressBar
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 6. Build Admin Lab Settings page





  - [x] 6.1 Create useLabRequirementsAdmin hook


    - Fetch all requirements (active and inactive), provide CRUD mutations
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 6.2 Create RequirementForm component


    - Form with title, description, helpUrl, requiresVerification fields
    - Zod validation with react-hook-form
    - _Requirements: 3.2, 3.3_
  - [x] 6.3 Create RequirementManager component with drag-drop reordering







    - Use @dnd-kit/core for drag-drop
    - Display active toggle, edit, delete buttons
    - _Requirements: 3.1, 3.5, 3.6_
  - [x] 6.4 Create Lab Settings page at apps/admin/src/app/(dashboard)/lab-settings/page.tsx




    - Compose RequirementManager, RequirementForm modal
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 7. Build Admin Verification Queue








  - [x] 7.1 Create useLabVerification hook


    - Fetch pending verifications, provide approve/reject mutations
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 7.2 Create VerificationQueue component


    - Display pending items with student name, requirement, submission date
    - Approve/Reject buttons with rejection reason modal
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 7.3 Add Verification Queue section to Lab Settings page or create separate page


    - _Requirements: 4.1, 4.2_



- [x] 8. Checkpoint - Ensure all tests pass






  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Presence System with Firebase Realtime Database





  - [x] 9.1 Configure Firebase Realtime Database in packages/firebase/src/config.ts


    - Initialize rtdb instance
    - _Requirements: 5.1_
  - [x] 9.2 Create presence.service.ts


    - Implement setupPresence, getOnlineCount, subscribeToOnlineCount
    - Use .info/connected and onDisconnect for presence tracking
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 9.3 Write property test for online count accuracy


    - **Property 9: Online count accuracy**
    - **Validates: Requirements 5.1, 5.4**
  - [x] 9.4 Create usePresence hook


    - Subscribe to realtime online count updates
    - _Requirements: 5.1, 5.4_
  - [x] 9.5 Create OnlineCounter component


    - Display admin and student online counts
    - _Requirements: 5.1, 5.4_
  - [x] 9.6 Integrate presence setup in AuthProvider for both admin and student apps


    - Call setupPresence on login, cleanup on logout
    - _Requirements: 5.2, 5.3_

- [x] 10. Implement Activity Feed







  - [x] 10.1 Create activity.repository.ts


    - Implement create, findRecent methods using Realtime Database
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 10.2 Create activity.service.ts


    - Implement logActivity, subscribeToActivities methods
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [x] 10.3 Write property test for activity feed ordering


    - **Property 10: Activity feed ordering**
    - **Validates: Requirements 6.1**
  - [x] 10.4 Create useActivityFeed hook


    - Subscribe to realtime activity updates with limit
    - _Requirements: 6.1, 6.5_
  - [x] 10.5 Create ActivityFeed component


    - Display recent activities with type icon, user name, details, timestamp
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 10.6 Integrate activity logging in relevant services




    - Log course completion, project submission, login events
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 11. Update Admin Dashboard with Realtime features





  - [x] 11.1 Add OnlineCounter to Dashboard page


    - _Requirements: 5.1_
  - [x] 11.2 Add ActivityFeed to Dashboard page

    - _Requirements: 6.1_


- [x] 12. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.


- [x] 13. Implement Handbook PDF Upload and Storage




  - [x] 13.1 Create handbook.service.ts


    - Implement uploadHandbook, getHandbook, validatePdf methods
    - Use Firebase Storage for PDF storage
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 13.2 Write property test for PDF validation constraints


    - **Property 11: PDF validation constraints**
    - **Validates: Requirements 7.1**
  - [x] 13.3 Write property test for handbook replacement


    - **Property 12: Handbook replacement**
    - **Validates: Requirements 7.3**
  - [x] 13.4 Create useHandbook hook


    - Fetch current handbook settings, provide upload mutation
    - _Requirements: 7.2, 7.4_
  - [x] 13.5 Create HandbookUpload component


    - File input with PDF validation, current handbook info display
    - _Requirements: 7.1, 7.4_
  - [x] 13.6 Add Handbook Upload section to Admin Settings page


    - _Requirements: 7.1, 7.2, 7.3, 7.4_


- [x] 14. Implement Flipbook Viewer






  - [x] 14.1 Install react-pageflip and react-pdf dependencies


    - Add to packages/ui/package.json
    - _Requirements: 8.1_
  - [x] 14.2 Create Flipbook component in packages/ui


    - Use react-pageflip with react-pdf for PDF rendering
    - Handle page navigation, loading state
    - _Requirements: 8.1, 8.2, 8.5_
  - [x] 14.3 Write property test for flipbook responsive dimensions


    - **Property 15: Flipbook responsive dimensions**

    - **Validates: Requirements 8.4**
  - [x] 14.4 Create HandbookViewer component



    - Fetch handbook URL and render Flipbook
    - _Requirements: 8.1, 8.3_
  - [x] 14.5 Add HandbookViewer to Login page in apps/auth


    - Display flipbook alongside login form
    - _Requirements: 8.1_

- [x] 15. Update Firestore Security Rules








  - [x] 15.1 Add rules for labRequirements collection




    - Admin read/write, student read only active
    - _Requirements: 3.1, 1.1_
  - [x] 15.2 Add rules for studentLabProgress collection


    - Student read/write own progress, admin read/write all
    - _Requirements: 2.1, 4.3, 4.4_
  - [x] 15.3 Add rules for settings/handbook document


    - Admin write, public read
    - _Requirements: 7.2, 8.1_



- [x] 16. Final Checkpoint - Ensure all tests pass






  - Ensure all tests pass, ask the user if questions arise.
