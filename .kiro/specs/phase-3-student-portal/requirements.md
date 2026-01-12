# Requirements Document

## Introduction

Phase 3 - Student Portal xây dựng các tính năng chính cho học viên: xem danh sách học kỳ và môn học, học qua Genially embed, upload kết quả dự án, hiển thị tiến độ học tập, và Learning Tree visualization. Phase này tập trung vào trải nghiệm học tập của học viên trong hệ thống The Design Council.

## Glossary

- **Student_Portal**: Ứng dụng web dành cho học viên tại `apps/student`
- **Semester**: Học kỳ trong chương trình đào tạo
- **Course**: Môn học thuộc một học kỳ
- **Progress**: Tiến độ học tập của học viên theo môn học
- **Project_Submission**: Kết quả dự án học viên nộp
- **Genially**: Nền tảng tạo nội dung tương tác, được embed vào trang môn học
- **Learning_Tree**: Visualization dạng cây hiển thị tiến trình học tập
- **Session**: Buổi học trong một môn học
- **Locked_Status**: Trạng thái môn học chưa được mở khóa (cần hoàn thành môn trước)
- **In_Progress_Status**: Trạng thái môn học đang được học
- **Completed_Status**: Trạng thái môn học đã hoàn thành

## Requirements

### Requirement 1: Semester List Display

**User Story:** As a student, I want to view my semesters with their status, so that I can track my learning journey.

#### Acceptance Criteria

1. WHEN a student navigates to the semesters page THEN the Student_Portal SHALL display all semesters sorted by order
2. WHEN displaying a semester THEN the Student_Portal SHALL show the semester name, completion status, and course count
3. WHEN a semester is completed THEN the Student_Portal SHALL display a checkmark icon and "Hoàn thành" label
4. WHEN a semester is in progress THEN the Student_Portal SHALL display a progress icon and "Đang học" label
5. WHEN a semester is locked THEN the Student_Portal SHALL display a lock icon and "Chưa mở khóa" label
6. WHEN a student clicks on an unlocked semester THEN the Student_Portal SHALL navigate to the semester detail page

### Requirement 2: Course List by Semester

**User Story:** As a student, I want to view courses within a semester, so that I can see what I need to learn.

#### Acceptance Criteria

1. WHEN a student navigates to a semester detail page THEN the Student_Portal SHALL display all courses in that semester sorted by order
2. WHEN displaying a course THEN the Student_Portal SHALL show the course title, progress percentage, session count, and project count
3. WHEN a course is completed THEN the Student_Portal SHALL display 100% progress with a checkmark
4. WHEN a course is in progress THEN the Student_Portal SHALL display the current progress percentage
5. WHEN a course is locked THEN the Student_Portal SHALL display a lock icon and message "Hoàn thành môn trước để mở khóa"
6. WHEN a student clicks on an unlocked course THEN the Student_Portal SHALL navigate to the course detail page

### Requirement 3: Course Detail with Genially Embed

**User Story:** As a student, I want to learn through embedded Genially content, so that I can access interactive learning materials.

#### Acceptance Criteria

1. WHEN a student navigates to a course detail page THEN the Student_Portal SHALL display the course title, description, and progress
2. WHEN a course has a Genially URL THEN the Student_Portal SHALL embed the Genially content in a responsive iframe
3. WHEN a course does not have a Genially URL THEN the Student_Portal SHALL display a fallback message
4. WHEN displaying the Genially embed THEN the Student_Portal SHALL maintain aspect ratio and allow fullscreen
5. WHEN a student views a course THEN the Student_Portal SHALL display navigation to previous and next courses

### Requirement 4: Project Submission

**User Story:** As a student, I want to submit my project results, so that I can track my completed work.

#### Acceptance Criteria

1. WHEN a student views a course THEN the Student_Portal SHALL display a list of required projects with submission status
2. WHEN a student submits a project THEN the Student_Portal SHALL validate the submission URL format
3. WHEN a project URL is valid THEN the Student_Portal SHALL save the submission with timestamp
4. WHEN a project is already submitted THEN the Student_Portal SHALL allow the student to edit or delete the submission
5. WHEN a submission is successful THEN the Student_Portal SHALL display a success notification
6. WHEN a submission fails validation THEN the Student_Portal SHALL display an error message with the reason

### Requirement 5: Student Dashboard

**User Story:** As a student, I want to see my overall learning progress, so that I can understand my current status.

#### Acceptance Criteria

1. WHEN a student navigates to the dashboard THEN the Student_Portal SHALL display a welcome message with the student name
2. WHEN displaying progress THEN the Student_Portal SHALL show overall completion percentage
3. WHEN displaying statistics THEN the Student_Portal SHALL show total courses completed and projects submitted
4. WHEN a student has courses in progress THEN the Student_Portal SHALL display the current course with a continue button
5. WHEN displaying next steps THEN the Student_Portal SHALL show upcoming courses to be unlocked

### Requirement 6: Learning Tree Visualization

**User Story:** As a student, I want to see my learning path as a tree, so that I can visualize my progress through the program.

#### Acceptance Criteria

1. WHEN a student navigates to the learning tree page THEN the Student_Portal SHALL display a tree visualization of the learning path
2. WHEN displaying tree nodes THEN the Student_Portal SHALL show completed nodes with a checkmark style
3. WHEN displaying tree nodes THEN the Student_Portal SHALL highlight the current position in the tree
4. WHEN displaying tree nodes THEN the Student_Portal SHALL show locked nodes with a dimmed style
5. WHEN a student clicks on a tree node THEN the Student_Portal SHALL navigate to the corresponding semester or course

### Requirement 7: Progress Tracking Schema

**User Story:** As a system architect, I want to define progress tracking data structures, so that student progress can be stored and retrieved accurately.

#### Acceptance Criteria

1. WHEN creating a progress record THEN the Student_Portal SHALL validate completedSessions as a non-negative integer
2. WHEN creating a progress record THEN the Student_Portal SHALL validate projectsSubmitted as a non-negative integer
3. WHEN creating a progress record THEN the Student_Portal SHALL validate status as one of: not_started, in_progress, completed, locked
4. WHEN updating progress THEN the Student_Portal SHALL automatically update the updatedAt timestamp
5. WHEN a course is completed THEN the Student_Portal SHALL set the completedAt timestamp

### Requirement 8: Project Submission Schema

**User Story:** As a system architect, I want to define project submission data structures, so that submissions can be validated and stored correctly.

#### Acceptance Criteria

1. WHEN creating a submission THEN the Student_Portal SHALL validate submissionUrl as a valid URL
2. WHEN creating a submission THEN the Student_Portal SHALL validate projectNumber as a positive integer
3. WHEN creating a submission THEN the Student_Portal SHALL automatically detect submissionType from URL (drive, behance, other)
4. WHEN creating a submission THEN the Student_Portal SHALL set submittedAt timestamp automatically
5. WHEN serializing a submission THEN the Student_Portal SHALL produce valid JSON that can be deserialized back to the original structure

### Requirement 9: UI/UX Standards

**User Story:** As a student, I want a consistent and responsive interface, so that I can learn comfortably on any device.

#### Acceptance Criteria

1. WHEN loading data THEN the Student_Portal SHALL display skeleton loading states
2. WHEN no data is available THEN the Student_Portal SHALL display appropriate empty states with guidance
3. WHEN an operation succeeds THEN the Student_Portal SHALL display a success toast notification
4. WHEN an operation fails THEN the Student_Portal SHALL display an error toast notification with the reason
5. WHEN viewing on mobile THEN the Student_Portal SHALL display a responsive layout optimized for small screens

### Requirement 10: Error Handling

**User Story:** As a student, I want clear error messages, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN a network error occurs THEN the Student_Portal SHALL display a user-friendly error message in Vietnamese
2. WHEN a validation error occurs THEN the Student_Portal SHALL highlight the invalid field with an error message
3. WHEN a course is locked THEN the Student_Portal SHALL display which prerequisite course needs to be completed
4. WHEN a submission URL is invalid THEN the Student_Portal SHALL display the expected URL format

