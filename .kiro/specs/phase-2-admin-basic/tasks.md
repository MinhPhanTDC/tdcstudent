# Implementation Plan

- [x] 1. Setup Schemas and Types
  - [x] 1.1 Create Semester schema
    - Create `packages/schemas/src/semester.schema.ts`
    - Define SemesterSchema with Zod validation
    - Export CreateSemesterInputSchema and UpdateSemesterInputSchema
    - Add barrel exports to `packages/schemas/index.ts`
    - _Requirements: 1.2, 6.1_
  - [ ]* 1.2 Write property test for Semester schema validation
    - **Property 2: Semester schema validation**
    - **Validates: Requirements 1.2, 6.1**
  - [x] 1.3 Extend Course schema for Phase 2
    - Update `packages/schemas/src/course.schema.ts`
    - Add semesterId, geniallyUrl, order, requiredSessions, requiredProjects fields
    - Add URL validation for geniallyUrl
    - _Requirements: 2.2, 2.3, 6.2_
  - [ ]* 1.4 Write property test for Course schema with defaults
    - **Property 6: Course schema validation with defaults**
    - **Validates: Requirements 2.4, 6.2**
  - [ ]* 1.5 Write property test for Genially URL validation
    - **Property 7: URL validation for Genially**
    - **Validates: Requirements 2.3**
  - [x] 1.6 Extend Student schema for Phase 2
    - Update `packages/schemas/src/student.schema.ts`
    - Add currentSemesterId, selectedMajorId, enrolledAt fields
    - Create CreateStudentInputSchema with optional password
    - _Requirements: 3.2, 6.3_
  - [x] 1.7 Create Import schema
    - Create `packages/schemas/src/import.schema.ts`
    - Define ImportRowSchema and ImportResultSchema
    - _Requirements: 4.3, 4.8_
  - [ ] 1.8 Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x] 2. Implement Repositories
  - [x] 2.1 Create Semester repository
    - Create `packages/firebase/src/repositories/semester.repository.ts`
    - Implement findAll, findById, create, update, delete methods
    - Implement reorder method with atomic batch updates
    - Implement hasAssociatedCourses method
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7_
  - [x]* 2.2 Write property test for Semester ordering
    - **Property 1: Semester list ordering consistency**
    - **Validates: Requirements 1.1, 1.7**
  - [x]* 2.3 Write property test for timestamp management
    - **Property 3: Timestamp management**
    - **Validates: Requirements 1.4, 2.5, 3.5, 6.6**
  - [x] 2.4 Extend Course repository for Phase 2
    - Update `packages/firebase/src/repositories/course.repository.ts`
    - Add findBySemester method
    - Add reorder method for courses within semester
    - Add moveToSemester method
    - _Requirements: 2.1, 2.7, 2.8, 2.9_
  - [x]* 2.5 Write property test for Course filtering
    - **Property 5: Course filtering by semester**
    - **Validates: Requirements 2.1, 2.7**
  - [x]* 2.6 Write property test for Course reorder
    - **Property 8: Course reorder consistency**
    - **Validates: Requirements 2.8**
  - [x]* 2.7 Write property test for Course semester change
    - **Property 9: Course semester change order reset**
    - **Validates: Requirements 2.9**
  - [x] 2.8 Extend Student repository for Phase 2
    - Update `packages/firebase/src/repositories/student.repository.ts`
    - Add search method with name/email matching
    - Add pagination support to findAll
    - Add filter support (isActive, currentSemesterId)
    - Add deactivate and activate methods
    - _Requirements: 3.1, 3.6, 3.7, 3.9_
  - [ ]* 2.9 Write property test for Student search
    - **Property 10: Student search result relevance**
    - **Validates: Requirements 3.1**
  - [ ]* 2.10 Write property test for Student filter
    - **Property 13: Student filter accuracy**
    - **Validates: Requirements 3.9**
  - [ ]* 2.11 Write property test for Active status toggle
    - **Property 4: Active status toggle round-trip**
    - **Validates: Requirements 1.8, 3.6, 3.7**
  - [ ] 2.12 Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement Student Creation with Firebase Auth
  - [x] 3.1 Create student creation service
    - Create `packages/firebase/src/services/student.service.ts`
    - Implement createStudentWithAuth method
    - Create Firebase Auth account
    - Create User document in Firestore
    - Create Student document in Firestore
    - Handle rollback on partial failure
    - _Requirements: 3.2, 3.4_
  - [x] 3.2 Implement password generation utility
    - Create `packages/firebase/src/utils/password.ts`
    - Generate secure random password (12+ chars, mixed case, numbers, special)
    - _Requirements: 3.3_
  - [ ]* 3.3 Write property test for password generation
    - **Property 12: Password generation security**
    - **Validates: Requirements 3.3**
  - [ ]* 3.4 Write property test for dual-record creation
    - **Property 11: Student creation dual-record consistency**
    - **Validates: Requirements 3.2**
  - [ ] 3.5 Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Bulk Import Feature





  - [x] 4.1 Create file parsing utilities


    - Create `apps/admin/src/lib/import/parser.ts`
    - Implement CSV parsing with name/email extraction
    - Implement Excel parsing (first sheet)
    - Handle encoding issues
    - _Requirements: 4.1, 4.2_
  - [ ]* 4.2 Write property test for file parsing
    - **Property 14: Import file parsing round-trip**
    - **Validates: Requirements 4.1, 4.2**
  - [x] 4.3 Create import validation service


    - Create `apps/admin/src/lib/import/validator.ts`
    - Validate required fields (name, email)
    - Validate email format
    - Check for duplicate emails in file
    - _Requirements: 4.3_
  - [ ]* 4.4 Write property test for import validation
    - **Property 15: Import validation completeness**
    - **Validates: Requirements 4.3**
  - [x] 4.5 Create bulk import service


    - Create `apps/admin/src/lib/import/importer.ts`
    - Implement rate-limited account creation (10/second)
    - Track success/failure for each row
    - Generate import result summary
    - _Requirements: 4.6, 4.7, 4.8, 4.9, 4.10_
  - [ ]* 4.6 Write property test for selective creation
    - **Property 16: Import selective creation**
    - **Validates: Requirements 4.6**
  - [ ]* 4.7 Write property test for import result accuracy
    - **Property 17: Import result accuracy**
    - **Validates: Requirements 4.8**
  - [ ]* 4.8 Write property test for rate limiting
    - **Property 18: Import rate limiting**
    - **Validates: Requirements 4.9**
  - [x] 4.9 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 5. Implement Custom Hooks




  - [x] 5.1 Create useSemesters hook


    - Create `apps/admin/src/hooks/useSemesters.ts`
    - Implement useSemesters, useSemester, useCreateSemester
    - Implement useUpdateSemester, useDeleteSemester
    - Implement useReorderSemesters
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_
  - [x] 5.2 Extend useCourses hook


    - Update `apps/admin/src/hooks/useCourses.ts`
    - Add useCoursesBySemester hook
    - Add useReorderCourses hook
    - Add useMoveCourseToSemester hook
    - _Requirements: 2.1, 2.7, 2.8, 2.9_
  - [x] 5.3 Extend useStudents hook


    - Update `apps/admin/src/hooks/useStudents.ts`
    - Add pagination support
    - Add useActivateStudent hook
    - _Requirements: 3.1, 3.6, 3.7, 3.9_
  - [x] 5.4 Create useStudentImport hook


    - Create `apps/admin/src/hooks/useStudentImport.ts`
    - Implement state machine with useReducer
    - Handle parsing, validation, import, result states
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.8_
  - [x] 5.5 Create useDashboardStats hook


    - Create `apps/admin/src/hooks/useDashboardStats.ts`
    - Fetch counts for semesters, courses, students
    - Fetch new students this month
    - Fetch recent students
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 5.6 Write property test for dashboard statistics
    - **Property 19: Dashboard statistics accuracy**
    - **Validates: Requirements 5.1**
  - [ ]* 5.7 Write property test for recent students
    - **Property 20: Recent students ordering**
    - **Validates: Requirements 5.3**
  - [x] 5.8 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Implement Semester Management UI






  - [x] 6.1 Create Semester list page



    - Create `apps/admin/src/app/(dashboard)/semesters/page.tsx`
    - Display semesters sorted by order
    - Add create button, edit/delete actions
    - Implement drag-and-drop reorder
    - _Requirements: 1.1, 1.7, 8.1, 8.2_
  - [x] 6.2 Create SemesterList component


    - Create `apps/admin/src/components/features/semester-management/SemesterList.tsx`
    - Display semester cards with actions
    - Support reorder via drag-and-drop
    - _Requirements: 1.1, 1.7_
  - [x] 6.3 Create SemesterForm component


    - Create `apps/admin/src/components/features/semester-management/SemesterForm.tsx`
    - Form fields: name, description, order, isActive, requiresMajorSelection
    - Validation with react-hook-form + Zod
    - _Requirements: 1.2, 1.8, 1.9_
  - [x] 6.4 Create SemesterCard component


    - Create `apps/admin/src/components/features/semester-management/SemesterCard.tsx`
    - Display semester info with status badge
    - Edit, delete, toggle active actions
    - _Requirements: 1.8_
  - [x] 6.5 Create Semester create/edit pages


    - Create `apps/admin/src/app/(dashboard)/semesters/new/page.tsx`
    - Create `apps/admin/src/app/(dashboard)/semesters/[id]/page.tsx`
    - Handle create and edit modes
    - _Requirements: 1.2, 1.4_
  - [x] 6.6 Create SemesterDeleteModal component


    - Create `apps/admin/src/components/features/semester-management/SemesterDeleteModal.tsx`
    - Show warning if semester has courses
    - Confirm before deletion
    - _Requirements: 1.5, 1.6, 8.6_
  - [x] 6.7 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 7. Implement Course Management UI




  - [x] 7.1 Update Course list page


    - Update `apps/admin/src/app/(dashboard)/courses/page.tsx`
    - Add semester filter dropdown
    - Display courses grouped by semester
    - _Requirements: 2.1, 8.5_
  - [ ]* 7.2 Write property test for URL state preservation
    - **Property 24: URL state preservation**
    - **Validates: Requirements 8.5**
  - [x] 7.3 Create CourseSemesterFilter component


    - Create `apps/admin/src/components/features/course-management/CourseSemesterFilter.tsx`
    - Dropdown to filter by semester
    - Preserve filter in URL params
    - _Requirements: 2.1, 8.5_
  - [x] 7.4 Update CourseForm component


    - Update `apps/admin/src/components/features/course-management/CourseForm.tsx`
    - Add semesterId dropdown
    - Add geniallyUrl field with URL validation
    - Add requiredSessions, requiredProjects fields
    - _Requirements: 2.2, 2.3, 2.4_
  - [x] 7.5 Create CourseCard component


    - Create `apps/admin/src/components/features/course-management/CourseCard.tsx`
    - Display course info with semester badge
    - Show Genially link if available
    - _Requirements: 2.1_
  - [x] 7.6 Implement course reorder in semester detail


    - Update semester detail page to show courses
    - Add drag-and-drop reorder for courses
    - _Requirements: 2.7, 2.8_
  - [x] 7.7 Checkpoint - Ensure all tests pass






    - Ensure all tests pass, ask the user if questions arise.




- [x] 8. Implement Student Management UI





  - [x] 8.1 Update Student list page


    - Update `apps/admin/src/app/(dashboard)/students/page.tsx`
    - Add filter dropdowns (status, semester)
    - Implement pagination
    - _Requirements: 3.1, 3.9, 8.5_
  - [x] 8.2 Create StudentSearch component


    - Create `apps/admin/src/components/features/student-management/StudentSearch.tsx`
    - Debounced search input
    - Search by name or email
    - _Requirements: 3.1, 3.10_
  - [x] 8.3 Create StudentFilters component


    - Create `apps/admin/src/components/features/student-management/StudentFilters.tsx`
    - Filter by active status
    - Filter by current semester
    - _Requirements: 3.9_
  - [x] 8.4 Update StudentForm component


    - Update `apps/admin/src/components/features/student-management/StudentForm.tsx`
    - Add password field (optional for create)
    - Add phone field
    - Handle create with Firebase Auth via studentService
    - _Requirements: 3.2, 3.3_
  - [x] 8.5 Update StudentCard component


    - Update `apps/admin/src/components/features/student-management/StudentCard.tsx`
    - Show active/inactive status
    - Add activate/deactivate action
    - Display displayName instead of userId
    - _Requirements: 3.6, 3.7_
  - [x] 8.6 Update Student detail page


    - Update `apps/admin/src/app/(dashboard)/students/[id]/page.tsx`
    - Display current semester
    - Display enrolled courses
    - _Requirements: 3.8_
  - [x] 8.7 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 9. Implement Student Import UI




  - [x] 9.1 Create StudentImport component


    - Create `apps/admin/src/components/features/student-management/StudentImport/StudentImport.tsx`
    - File upload dropzone
    - Support CSV and Excel files
    - _Requirements: 4.1, 4.2_
  - [x] 9.2 Create ImportPreview component


    - Create `apps/admin/src/components/features/student-management/StudentImport/ImportPreview.tsx`
    - Display preview table with validation status
    - Show valid/invalid row counts
    - Highlight invalid rows with error messages
    - _Requirements: 4.4, 4.5_
  - [x] 9.3 Create ImportProgress component


    - Create `apps/admin/src/components/features/student-management/StudentImport/ImportProgress.tsx`
    - Progress bar with current/total count
    - Cancel button
    - _Requirements: 4.7_
  - [x] 9.4 Create ImportResult component


    - Create `apps/admin/src/components/features/student-management/StudentImport/ImportResult.tsx`
    - Summary with success/failure counts
    - List of failures with reasons
    - Download failure report option
    - _Requirements: 4.8, 4.10_
  - [x] 9.5 Add import button to Student list page


    - Add "Import từ Excel" button
    - Open import modal/drawer
    - _Requirements: 4.1_
  - [x] 9.6 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 10. Implement Dashboard Enhancement




  - [x] 10.1 Update Dashboard page


    - Update `apps/admin/src/app/(dashboard)/dashboard/page.tsx`
    - Add statistics cards section
    - Add recent students section
    - Add quick actions section
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 10.2 Create DashboardStats component


    - Create `apps/admin/src/components/features/dashboard/DashboardStats.tsx`
    - Card for total semesters
    - Card for total courses
    - Card for total students
    - Card for new students this month
    - Skeleton loading states
    - _Requirements: 5.1, 5.2, 5.5_
  - [x] 10.3 Update RecentStudents component


    - Update `apps/admin/src/components/features/dashboard/RecentStudents.tsx`
    - Display 5 most recent students
    - Show name, email, enrollment date
    - Link to student detail
    - _Requirements: 5.3_
  - [x] 10.4 Create QuickActions component


    - Create `apps/admin/src/components/features/dashboard/QuickActions.tsx`
    - Button: Thêm học viên
    - Button: Thêm môn học
    - Button: Import Excel
    - _Requirements: 5.4_
  - [x] 10.5 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 11. Implement Error Handling and Localization




  - [x] 11.1 Extend error codes


    - Update `packages/firebase/src/errors.ts`
    - Add Phase 2 error codes
    - Add error mapping for new Firebase operations
    - _Requirements: 7.1, 7.5_
  - [ ]* 11.2 Write property test for error mapping
    - **Property 23: Firebase error mapping completeness**
    - **Validates: Requirements 7.5**
  - [x] 11.3 Add Vietnamese error messages


    - Update `packages/ui/src/locales/vi.json`
    - Add translations for all Phase 2 error codes
    - _Requirements: 7.1_
  - [x] 11.4 Implement form validation feedback


    - Ensure all forms highlight invalid fields
    - Display field-level error messages
    - _Requirements: 7.3_
  - [ ]* 11.5 Write property test for validation error structure
    - **Property 22: Validation error structure**
    - **Validates: Requirements 6.5**
  - [x] 11.6 Implement dependency error handling


    - Show which courses prevent semester deletion
    - Clear error messages for constraint violations
    - _Requirements: 7.4_
  - [x] 11.7 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 12. Implement UI/UX Standards





  - [x] 12.1 Add loading skeletons



    - Add skeleton loaders to all list pages
    - Add skeleton to dashboard stats
    - _Requirements: 8.1, 5.5_


  - [x] 12.2 Add empty states

    - Empty state for semester list
    - Empty state for course list
    - Empty state for student list
    - Include call-to-action buttons

    - _Requirements: 8.2_
  - [x] 12.3 Add toast notifications

    - Success toast for create/update/delete operations
    - Error toast for failed operations
    - _Requirements: 8.3, 8.4_



  - [x] 12.4 Add confirmation modals

    - Confirm before delete semester
    - Confirm before delete course
    - Confirm before deactivate student

    - _Requirements: 8.6_
  - [x] 12.5 Implement URL state management

    - Preserve filters in URL params
    - Preserve search query in URL
    - Preserve pagination in URL
    - _Requirements: 8.5_

  - [x] 12.6 Checkpoint - Ensure all tests pass

    - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Update Firestore Security Rules


  - [x] 13.1 Add semester collection rules

    - Update `firebase/firestore.rules`
    - Allow authenticated read
    - Allow admin write
    - _Requirements: 15 (from Phase 1)_
  - [x] 13.2 Update course collection rules


    - Ensure semesterId reference validation
    - _Requirements: 15 (from Phase 1)_
  - [x] 13.3 Update student collection rules


    - Allow admin full access
    - Allow student read own data
    - _Requirements: 15 (from Phase 1)_
  - [ ]* 13.4 Write property test for schema validation on read
    - **Property 21: Schema validation on read**
    - **Validates: Requirements 6.4**
  - [x] 13.5 Final Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.
