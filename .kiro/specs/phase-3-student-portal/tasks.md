# Implementation Plan

- [x] 1. Setup Schemas and Types





  - [x] 1.1 Create Progress schema


    - Create `packages/schemas/src/progress.schema.ts`
    - Define StudentProgressSchema with Zod validation
    - Define ProgressStatusSchema enum
    - Export CreateProgressInputSchema and UpdateProgressInputSchema
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 1.2 Write property test for Progress schema validation
    - **Property 8: Progress schema validation**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  - [x] 1.3 Create ProjectSubmission schema


    - Create `packages/schemas/src/project.schema.ts`
    - Define ProjectSubmissionSchema with Zod validation
    - Define SubmissionTypeSchema enum
    - Implement detectSubmissionType helper function
    - Export CreateProjectSubmissionInputSchema
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 1.4 Write property test for submission type detection
    - **Property 7: Submission type detection**
    - **Validates: Requirements 8.3**
  - [ ]* 1.5 Write property test for submission round-trip
    - **Property 10: Project submission round-trip**
    - **Validates: Requirements 8.5**
  - [x] 1.6 Create student portal types


    - Create `packages/schemas/src/student-portal.types.ts`
    - Define SemesterWithStatus, CourseWithProgress, OverallProgress
    - Define LearningTreeNode type
    - Add barrel exports to `packages/schemas/index.ts`
    - _Requirements: 1.2, 2.2, 5.2_
  - [x] 1.7 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.

- [x] 2. Implement Repositories





  - [x] 2.1 Create Progress repository


    - Create `packages/firebase/src/repositories/progress.repository.ts`
    - Implement findByStudentId, findByStudentAndCourse methods
    - Implement create, update methods
    - Implement updateStatus method with completedAt handling
    - _Requirements: 7.4, 7.5_
  - [ ]* 2.2 Write property test for timestamp management
    - **Property 9: Timestamp management**
    - **Validates: Requirements 7.4, 7.5**
  - [x] 2.3 Create ProjectSubmission repository


    - Create `packages/firebase/src/repositories/project-submission.repository.ts`
    - Implement findByStudentAndCourse method
    - Implement create, update, delete methods
    - _Requirements: 4.3, 4.4_
  - [x] 2.4 Extend error codes for Phase 3


    - Update `packages/types/src/error.types.ts`
    - Add progress and submission error codes
    - _Requirements: 10.1_
  - [x] 2.5 Add Vietnamese error messages


    - Update `packages/ui/src/locales/vi.json`
    - Add translations for Phase 3 error codes
    - _Requirements: 10.1_
  - [ ]* 2.6 Write property test for error message localization
    - **Property 13: Error message localization**
    - **Validates: Requirements 10.1**
  - [x] 2.7 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 3. Implement Custom Hooks




  - [x] 3.1 Create useMySemesters hook


    - Create `apps/student/src/hooks/useMySemesters.ts`
    - Fetch semesters with student progress status
    - Calculate completion status for each semester
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 3.2 Create useSemesterCourses hook

    - Create `apps/student/src/hooks/useSemesterCourses.ts`
    - Fetch courses by semester with progress
    - Determine locked status based on previous course completion
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 3.3 Write property test for course ordering
    - **Property 2: Course list ordering consistency**
    - **Validates: Requirements 2.1**
  - [x] 3.4 Create useCourseDetail hook

    - Create `apps/student/src/hooks/useCourseDetail.ts`
    - Fetch course with progress and navigation info
    - Calculate previous/next courses
    - _Requirements: 3.1, 3.5_
  - [ ]* 3.5 Write property test for course navigation
    - **Property 5: Course navigation consistency**
    - **Validates: Requirements 3.5**
  - [x] 3.6 Create useMyProgress hook

    - Create `apps/student/src/hooks/useMyProgress.ts`
    - Calculate overall progress statistics
    - Identify current and next courses
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [ ]* 3.7 Write property test for progress calculation
    - **Property 3: Progress percentage calculation**
    - **Validates: Requirements 2.4, 5.2**
  - [ ]* 3.8 Write property test for overall progress
    - **Property 11: Overall progress calculation**
    - **Validates: Requirements 5.2, 5.3**
  - [x] 3.9 Create useMyProjects hook

    - Create `apps/student/src/hooks/useMyProjects.ts`
    - Fetch project submissions by course
    - _Requirements: 4.1_
  - [x] 3.10 Create useSubmitProject hook

    - Create `apps/student/src/hooks/useSubmitProject.ts`
    - Handle project submission with validation
    - Handle edit and delete operations
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 3.11 Write property test for URL validation
    - **Property 6: Project submission URL validation**
    - **Validates: Requirements 4.2**
  - [x] 3.12 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 4. Implement Semester List UI




  - [x] 4.1 Create SemesterCard component


    - Create `apps/student/src/components/features/semester/SemesterCard.tsx`
    - Display semester name, status icon, course count
    - Handle completed/in_progress/locked states
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  - [x] 4.2 Create SemesterList component


    - Create `apps/student/src/components/features/semester/SemesterList.tsx`
    - Display list of semester cards
    - Add skeleton loading state
    - Add empty state
    - _Requirements: 1.1, 9.1, 9.2_
  - [x] 4.3 Create Semesters page


    - Create `apps/student/src/app/(portal)/semesters/page.tsx`
    - Use useMySemesters hook
    - Handle navigation to semester detail
    - _Requirements: 1.1, 1.6_
  - [ ]* 4.4 Write property test for semester ordering
    - **Property 1: Semester list ordering consistency**
    - **Validates: Requirements 1.1**
  - [x] 4.5 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Course List UI





  - [x] 5.1 Create CourseCard component


    - Create `apps/student/src/components/features/course/CourseCard.tsx`
    - Display course title, progress, session/project count
    - Handle completed/in_progress/locked states
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [x] 5.2 Create CourseList component


    - Create `apps/student/src/components/features/course/CourseList.tsx`
    - Display list of course cards
    - Add skeleton loading state
    - Add empty state
    - _Requirements: 2.1, 9.1, 9.2_
  - [x] 5.3 Create ProgressBar component


    - Create `apps/student/src/components/features/progress/ProgressBar.tsx`
    - Display progress as visual bar
    - Show percentage label
    - _Requirements: 2.4_


  - [x] 5.4 Create Semester detail page
    - Create `apps/student/src/app/(portal)/semesters/[id]/page.tsx`
    - Use useSemesterCourses hook
    - Handle navigation to course detail
    - _Requirements: 2.1, 2.6_
  - [x] 5.5 Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Course Detail UI




  - [x] 6.1 Create GeniallyEmbed component
    - Create `apps/student/src/components/features/course/GeniallyEmbed.tsx`
    - Embed Genially iframe with responsive container
    - Handle URL transformation
    - Add fallback for missing URL
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 6.2 Write property test for Genially URL transformation
    - **Property 4: Genially embed URL transformation**
    - **Validates: Requirements 3.2**
  - [x] 6.3 Create CourseNavigation component
    - Create `apps/student/src/components/features/course/CourseNavigation.tsx`
    - Display previous/next course buttons
    - Handle edge cases (first/last course)
    - _Requirements: 3.5_
  - [x] 6.4 Create Course detail page
    - Update `apps/student/src/app/(portal)/courses/[id]/page.tsx`
    - Display course info, Genially embed, projects
    - Use useCourseDetail hook
    - _Requirements: 3.1, 3.2, 3.5_
  - [x] 6.5 Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Project Submission UI



  - [x] 7.1 Create ProjectCard component


    - Create `apps/student/src/components/features/project/ProjectCard.tsx`
    - Display project number, submission status
    - Show submission URL if submitted
    - _Requirements: 4.1_


  - [x] 7.2 Create ProjectSubmitForm component
    - Create `apps/student/src/components/features/project/ProjectSubmitForm.tsx`
    - Form with URL input and notes
    - URL validation with error messages


    - Handle create/edit modes
    - _Requirements: 4.2, 4.4, 10.4_
  - [x] 7.3 Create ProjectList component


    - Create `apps/student/src/components/features/project/ProjectList.tsx`
    - Display list of required projects
    - Show submission status for each
    - _Requirements: 4.1_
  - [x] 7.4 Integrate projects into Course detail page
    - Add ProjectList to course detail page
    - Handle submission success/error toasts
    - _Requirements: 4.5, 4.6, 9.3, 9.4_
  - [x] 7.5 Checkpoint - Ensure all tests pass



    - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Student Dashboard





  - [x] 8.1 Create ProgressStats component


    - Create `apps/student/src/components/features/progress/ProgressStats.tsx`
    - Display total courses, completed, projects submitted
    - _Requirements: 5.3_
  - [x] 8.2 Create CurrentCourse component


    - Create `apps/student/src/components/features/progress/CurrentCourse.tsx`
    - Display current course with continue button
    - _Requirements: 5.4_
  - [x] 8.3 Create NextCourses component


    - Create `apps/student/src/components/features/progress/NextCourses.tsx`
    - Display upcoming courses to be unlocked
    - _Requirements: 5.5_
  - [x] 8.4 Update Dashboard page


    - Update `apps/student/src/app/(portal)/dashboard/page.tsx`
    - Add welcome message with student name
    - Add overall progress bar
    - Add statistics, current course, next courses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 8.5 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Learning Tree





  - [x] 9.1 Create TreeNode component


    - Create `apps/student/src/components/features/learning-tree/TreeNode.tsx`
    - Display node with status styling
    - Handle click navigation
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [x] 9.2 Create LearningTree component


    - Create `apps/student/src/components/features/learning-tree/LearningTree.tsx`
    - Build tree structure from semesters
    - Highlight current position
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 9.3 Create Learning Tree page


    - Create `apps/student/src/app/(portal)/learning-tree/page.tsx`
    - Use useMySemesters hook
    - Display LearningTree component
    - _Requirements: 6.1, 6.5_
  - [x] 9.4 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement UI/UX Standards





  - [x] 10.1 Add loading skeletons


    - Add skeleton to semester list
    - Add skeleton to course list
    - Add skeleton to dashboard
    - _Requirements: 9.1_
  - [x] 10.2 Add empty states


    - Empty state for no semesters
    - Empty state for no courses
    - Empty state for no projects
    - _Requirements: 9.2_
  - [x] 10.3 Add toast notifications


    - Success toast for project submission
    - Error toast for failed operations
    - _Requirements: 9.3, 9.4_
  - [x] 10.4 Implement locked course handling


    - Display prerequisite course name
    - Clear message for locked courses
    - _Requirements: 10.3_
  - [ ]* 10.5 Write property test for prerequisite identification
    - **Property 12: Prerequisite course identification**
    - **Validates: Requirements 10.3**
  - [x] 10.6 Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.


- [x] 11. Update Navigation and Layout




  - [x] 11.1 Update StudentSidebar


    - Update `apps/student/src/components/layout/StudentSidebar.tsx`
    - Add Semesters link
    - Add Learning Tree link
    - _Requirements: 1.6, 6.5_
  - [x] 11.2 Update Firestore Security Rules


    - Update `firebase/firestore.rules`
    - Add progress collection rules
    - Add projectSubmissions collection rules
    - _Requirements: Security_
  - [x] 11.3 Final Checkpoint - Ensure all tests pass


    - Ensure all tests pass, ask the user if questions arise.

