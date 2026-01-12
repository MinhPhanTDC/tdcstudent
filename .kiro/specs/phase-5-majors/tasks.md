# Implementation Plan

## Phase 5: Majors (Quản lý Chuyên ngành)

- [x] 1. Set up schemas and types





  - [x] 1.1 Create Major schema


    - Create `packages/schemas/src/major.schema.ts` with MajorSchema, CreateMajorInputSchema, UpdateMajorInputSchema
    - Include validation for name (required, max 100), description (max 1000), color (hex format)
    - _Requirements: 1.1, 1.5_
  - [ ]* 1.2 Write property test for Major schema round-trip
    - **Property 1: Major schema round-trip**
    - **Validates: Requirements 7.1, 7.2, 7.5**
  - [x] 1.3 Create MajorCourse schema


    - Create `packages/schemas/src/major-course.schema.ts` with MajorCourseSchema, CreateMajorCourseInputSchema
    - Include majorId, courseId, order, isRequired fields
    - _Requirements: 2.1_
  - [ ]* 1.4 Write property test for MajorCourse schema round-trip
    - **Property 2: MajorCourse schema round-trip**
    - **Validates: Requirements 7.3, 7.4, 7.6**
  - [x] 1.5 Extend Semester schema


    - Add `requiresMajorSelection: z.boolean().default(false)` to SemesterSchema
    - _Requirements: 3.1, 3.2_
  - [x] 1.6 Extend Student schema


    - Add `majorSelectedAt: TimestampSchema.optional()` to StudentSchema
    - _Requirements: 4.5_
  - [x] 1.7 Export schemas from index


    - Update `packages/schemas/src/index.ts` to export all new schemas and types
    - _Requirements: 1.1, 2.1_


- [x] 2. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.


- [x] 3. Create Firebase repositories




  - [x] 3.1 Create Major repository


    - Create `packages/firebase/src/repositories/major.repository.ts`
    - Implement findAll, findById, findByName, create, update, softDelete methods
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 3.2 Write property test for Major name validation
    - **Property 3: Major name validation**
    - **Validates: Requirements 1.5**

  - [x] 3.3 Create MajorCourse repository

    - Create `packages/firebase/src/repositories/major-course.repository.ts`
    - Implement findByMajorId, create, update, delete, reorder methods
    - _Requirements: 2.1, 2.3, 2.5_
  - [x] 3.4 Export repositories from index


    - Update `packages/firebase/src/repositories/index.ts`

    - _Requirements: 1.1, 2.1_

- [x] 4. Create Firebase services




  - [x] 4.1 Create Major service


    - Create `packages/firebase/src/services/major.service.ts`
    - Implement getMajors (with sorting), getMajor, createMajor, updateMajor, deleteMajor
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_
  - [ ]* 4.2 Write property test for Major soft delete
    - **Property 4: Major soft delete preserves data**
    - **Validates: Requirements 1.4**
  - [ ]* 4.3 Write property test for Major list sorting
    - **Property 5: Major list sorting**
    - **Validates: Requirements 1.6**


  - [x] 4.4 Create MajorCourse service
    - Create `packages/firebase/src/services/major-course.service.ts`
    - Implement getMajorCourses, addCourseToMajor, updateMajorCourse, removeCourseFromMajor, reorderCourses
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]* 4.5 Write property test for MajorCourse order sorting
    - **Property 6: MajorCourse order sorting**
    - **Validates: Requirements 2.6**
  - [ ]* 4.6 Write property test for duplicate course prevention
    - **Property 7: Duplicate course prevention**
    - **Validates: Requirements 2.7**
  - [ ]* 4.7 Write property test for course reorder consistency
    - **Property 8: Course reorder consistency**
    - **Validates: Requirements 2.3**
  - [x] 4.8 Export services from index

    - Update `packages/firebase/src/services/index.ts`
    - _Requirements: 1.1, 2.1_

- [x] 5. Checkpoint - Ensure all tests pass







  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create Admin hooks







  - [x] 6.1 Create useMajors hook


    - Create `apps/admin/src/hooks/useMajors.ts`
    - Implement useQuery for majors list, useMutation for create/update/delete
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 6.2 Create useMajorCourses hook




    - Create `apps/admin/src/hooks/useMajorCourses.ts`
    - Implement useQuery for major courses, useMutation for add/remove/reorder
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 7. Create Admin UI components





  - [x] 7.1 Create MajorCard component


    - Create `apps/admin/src/components/features/major-management/MajorCard.tsx`
    - Display major name, description, color, course count, actions
    - _Requirements: 1.2_

  - [x] 7.2 Create MajorList component

    - Create `apps/admin/src/components/features/major-management/MajorList.tsx`
    - Display grid of MajorCards with loading/empty states
    - _Requirements: 1.2, 1.6_

  - [x] 7.3 Create MajorForm component

    - Create `apps/admin/src/components/features/major-management/MajorForm.tsx`
    - Form with name, description, thumbnailUrl, color fields
    - _Requirements: 1.1, 1.3, 1.5_

  - [x] 7.4 Create MajorCourseItem component

    - Create `apps/admin/src/components/features/major-management/MajorCourseItem.tsx`
    - Display course with drag handle, required toggle, remove button
    - _Requirements: 2.2, 2.4_

  - [x] 7.5 Create MajorCoursesManager component

    - Create `apps/admin/src/components/features/major-management/MajorCoursesManager.tsx`
    - Drag-and-drop list of courses, add course button
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 7.6 Create AddCourseModal component

    - Create `apps/admin/src/components/features/major-management/AddCourseModal.tsx`
    - Modal to select and add course to major

    - _Requirements: 2.1, 2.7_
  - [x] 7.7 Export components from index


    - Create `apps/admin/src/components/features/major-management/index.ts`
    - _Requirements: 1.1, 2.1_

- [x] 8. Create Admin pages





  - [x] 8.1 Create majors list page


    - Create `apps/admin/src/app/(dashboard)/majors/page.tsx`
    - Display MajorList with "Tạo chuyên ngành" button
    - _Requirements: 1.2_
  - [x] 8.2 Create new major page


    - Create `apps/admin/src/app/(dashboard)/majors/new/page.tsx`
    - Display MajorForm for creating new major
    - _Requirements: 1.1_
  - [x] 8.3 Create major detail page


    - Create `apps/admin/src/app/(dashboard)/majors/[id]/page.tsx`
    - Display MajorForm for editing and MajorCoursesManager
    - _Requirements: 1.3, 2.2_
  - [x] 8.4 Update sidebar navigation


    - Add "Chuyên ngành" link to admin sidebar
    - _Requirements: 1.2_

- [x] 9. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.


- [x] 10. Update Semester form for major selection requirement



  - [x] 10.1 Add requiresMajorSelection toggle to SemesterForm

    - Update `apps/admin/src/components/features/semester-management/SemesterForm.tsx`
    - Add toggle/checkbox for requiresMajorSelection field
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 10.2 Write property test for toggle requiresMajorSelection
    - **Property 9: Toggle requiresMajorSelection**
    - **Validates: Requirements 3.1, 3.2**

- [x] 11. Create Student major selection feature







  - [x] 11.1 Create useSelectMajor hook


    - Create `apps/student/src/hooks/useSelectMajor.ts`
    - Implement getMajorsForSelection, selectMajor, checkMajorRequired
    - _Requirements: 4.1, 4.2, 4.5, 4.6_
  - [ ]* 11.2 Write property test for major selection blocking
    - **Property 10: Major selection blocking**
    - **Validates: Requirements 3.4**
  - [ ]* 11.3 Write property test for major selection permanence
    - **Property 11: Major selection permanence**
    - **Validates: Requirements 4.6**
  - [ ]* 11.4 Write property test for major selection updates both fields
    - **Property 12: Major selection updates both fields**
    - **Validates: Requirements 4.5**
  - [x] 11.5 Create MajorSelectionCard component


    - Create `apps/student/src/components/features/major/MajorSelectionCard.tsx`
    - Display major with name, description, course count, view details, select button
    - _Requirements: 4.2, 4.3_
  - [x] 11.6 Create MajorCoursePreview component




    - Create `apps/student/src/components/features/major/MajorCoursePreview.tsx`
    - Display list of courses in a major for preview before selection
    - _Requirements: 4.3_
  - [x] 11.7 Create MajorSelectionList component


    - Create `apps/student/src/components/features/major/MajorSelectionList.tsx`
    - Display list of MajorSelectionCards
    - _Requirements: 4.2_
  - [x] 11.8 Create MajorConfirmModal component


    - Create `apps/student/src/components/features/major/MajorConfirmModal.tsx`
    - Confirmation dialog with warning about permanent choice
    - _Requirements: 4.4_
  - [x] 11.9 Create select-major page


    - Create `apps/student/src/app/(portal)/select-major/page.tsx`
    - Display MajorSelectionList with confirmation flow
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.7_
  - [x] 11.10 Export components from index


    - Create `apps/student/src/components/features/major/index.ts`
    - _Requirements: 4.1_


- [x] 12. Checkpoint - Ensure all tests pass







  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Create Student my-major feature








  - [x] 13.1 Create useMyMajor hook


    - Create `apps/student/src/hooks/useMyMajor.ts`
    - Implement getMyMajor, getMajorCourses, calculateProgress
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 13.2 Write property test for major progress calculation
    - **Property 13: Major progress calculation**
    - **Validates: Requirements 5.3**
  - [ ]* 13.3 Write property test for course status derivation
    - **Property 14: Course status derivation**
    - **Validates: Requirements 5.2**
  - [x] 13.4 Create MyMajorProgress component


    - Create `apps/student/src/components/features/major/MyMajorProgress.tsx`
    - Display major name, description, progress bar
    - _Requirements: 5.1, 5.3_
  - [x] 13.5 Create MajorCourseList component


    - Create `apps/student/src/components/features/major/MajorCourseList.tsx`
    - Display courses with status (locked, in-progress, completed)
    - _Requirements: 5.2_
  - [x] 13.6 Create my-major page


    - Create `apps/student/src/app/(portal)/my-major/page.tsx`
    - Display MyMajorProgress and MajorCourseList
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 13.7 Update student sidebar navigation


    - Add "Chuyên ngành" link to student sidebar
    - _Requirements: 5.1_


- [x] 14. Integrate major selection blocking




  - [x] 14.1 Create major selection guard


    - Create `apps/student/src/lib/majorGuard.ts`
    - Check if student needs to select major before accessing semester
    - _Requirements: 3.4, 4.1_
  - [x] 14.2 Update semester access logic


    - Update semester page to check major selection requirement
    - Redirect to select-major page if needed
    - _Requirements: 3.4, 4.1_

- [x] 15. Integrate with Learning Tree





  - [x] 15.1 Update LearningTree component


    - Update `apps/student/src/components/features/learning-tree/LearningTree.tsx`
    - Include major courses in tree visualization
    - _Requirements: 5.5_
  - [x] 15.2 Update TreeNode for major courses


    - Update `apps/student/src/components/features/learning-tree/TreeNode.tsx`
    - Handle major course display with appropriate styling
    - _Requirements: 5.5_


- [x] 16. Update Firestore security rules




  - [x] 16.1 Add rules for majors collection


    - Update `firebase/firestore.rules`
    - Allow read for authenticated users, write for admins only
    - _Requirements: 1.1, 4.2_
  - [x] 16.2 Add rules for majorCourses collection


    - Update `firebase/firestore.rules`
    - Allow read for authenticated users, write for admins only
    - _Requirements: 2.1_


- [x] 17. Add Admin major override feature




  - [x] 17.1 Add override major function to student service


    - Update `packages/firebase/src/services/student.service.ts`
    - Implement overrideMajor function for admin use
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ]* 17.2 Write property test for admin major override
    - **Property 15: Admin major override**
    - **Validates: Requirements 6.2**
  - [x] 17.3 Update StudentForm to show major selection


    - Update `apps/admin/src/components/features/student-management/StudentForm.tsx`
    - Add major display and override option
    - _Requirements: 6.1, 6.2_


- [x] 18. Final Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
