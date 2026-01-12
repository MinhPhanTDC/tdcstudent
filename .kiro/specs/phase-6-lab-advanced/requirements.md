# Requirements Document

## Introduction

Phase 6 xây dựng các tính năng Lab Training và Advanced Features cho The Design Council webapp. Bao gồm trang Lab Training với checklist yêu cầu cho học viên, admin setting nội dung động, realtime dashboard với số liệu online, và handbook PDF viewer dạng flipbook.

## Glossary

- **Lab_Training_System**: Hệ thống quản lý giai đoạn Lab Training cho học viên
- **Lab_Requirement**: Yêu cầu mà học viên cần hoàn thành trước khi vào Lab
- **Student_Lab_Progress**: Tiến độ hoàn thành yêu cầu Lab của từng học viên
- **Verification_Flow**: Quy trình admin xác nhận yêu cầu cần verify
- **Presence_System**: Hệ thống theo dõi trạng thái online/offline của user
- **Activity_Feed**: Danh sách hoạt động gần đây trong hệ thống
- **Handbook_Viewer**: Component hiển thị sổ tay học viên dạng flipbook
- **Flipbook**: Hiệu ứng lật trang sách khi xem PDF

## Requirements

### Requirement 1

**User Story:** As a student, I want to view Lab Training requirements checklist, so that I can track what I need to complete before starting Lab phase.

#### Acceptance Criteria

1. WHEN a student navigates to the Lab Training page THEN the Lab_Training_System SHALL display a list of all active Lab requirements with title, description, and help URL
2. WHEN displaying requirements THEN the Lab_Training_System SHALL show each requirement's completion status (completed, pending, not started) for the current student
3. WHEN a student has completed some requirements THEN the Lab_Training_System SHALL display a progress bar showing percentage of completed requirements
4. WHEN a requirement has a help URL THEN the Lab_Training_System SHALL display a clickable link to the guidance document
5. WHEN displaying requirements THEN the Lab_Training_System SHALL order them by the configured order field

### Requirement 2

**User Story:** As a student, I want to mark Lab requirements as completed, so that I can track my progress through the Lab Training checklist.

#### Acceptance Criteria

1. WHEN a student clicks "Mark as completed" on a requirement that does not require verification THEN the Lab_Training_System SHALL immediately update the status to completed and record the completion timestamp
2. WHEN a student clicks "Mark as completed" on a requirement that requires verification THEN the Lab_Training_System SHALL set the status to pending and notify admin for review
3. WHEN a requirement status changes THEN the Lab_Training_System SHALL update the progress bar percentage immediately
4. WHEN a student marks a requirement as completed THEN the Lab_Training_System SHALL persist the change to the database

### Requirement 3

**User Story:** As an admin, I want to manage Lab Training requirements, so that I can configure what students need to complete before Lab phase.

#### Acceptance Criteria

1. WHEN an admin accesses the Lab Settings page THEN the Lab_Training_System SHALL display a list of all Lab requirements with edit and delete options
2. WHEN an admin creates a new requirement THEN the Lab_Training_System SHALL validate that title is between 1 and 200 characters and save to database
3. WHEN an admin updates a requirement THEN the Lab_Training_System SHALL validate the input and persist changes immediately
4. WHEN an admin deletes a requirement THEN the Lab_Training_System SHALL remove it from the database and update all related student progress records
5. WHEN an admin toggles the isActive flag THEN the Lab_Training_System SHALL show or hide the requirement from student view accordingly
6. WHEN an admin drags to reorder requirements THEN the Lab_Training_System SHALL update the order field for all affected requirements

### Requirement 4

**User Story:** As an admin, I want to verify student Lab requirement completions, so that I can ensure students have properly completed requirements that need verification.

#### Acceptance Criteria

1. WHEN a student submits a requirement that requires verification THEN the Lab_Training_System SHALL add it to the admin pending verification queue
2. WHEN an admin views pending verifications THEN the Lab_Training_System SHALL display student name, requirement title, submission date, and any notes
3. WHEN an admin approves a verification THEN the Lab_Training_System SHALL update the status to completed, record the verifier ID, and notify the student
4. WHEN an admin rejects a verification THEN the Lab_Training_System SHALL update the status to rejected, record the reason, and notify the student to resubmit
5. WHEN displaying verification status THEN the Lab_Training_System SHALL show pending, approved, or rejected with appropriate visual indicators

### Requirement 5

**User Story:** As an admin, I want to see realtime online user count, so that I can monitor system activity and student engagement.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Presence_System SHALL display the current count of online users updated in realtime
2. WHEN a user connects to the system THEN the Presence_System SHALL increment the online count within 5 seconds
3. WHEN a user disconnects or closes the browser THEN the Presence_System SHALL decrement the online count within 30 seconds
4. WHEN displaying online count THEN the Presence_System SHALL distinguish between admin and student users

### Requirement 6

**User Story:** As an admin, I want to see an activity feed of recent actions, so that I can monitor what students are doing in the system.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Activity_Feed SHALL display the 20 most recent activities in chronological order
2. WHEN a student completes a course THEN the Activity_Feed SHALL add an entry with student name, course title, and timestamp
3. WHEN a student submits a project THEN the Activity_Feed SHALL add an entry with student name, project title, and timestamp
4. WHEN a student logs in THEN the Activity_Feed SHALL add an entry with student name and timestamp
5. WHEN new activities occur THEN the Activity_Feed SHALL update in realtime without page refresh

### Requirement 7

**User Story:** As an admin, I want to upload and manage the student handbook PDF, so that students can view it as a flipbook on the login page.

#### Acceptance Criteria

1. WHEN an admin uploads a PDF file THEN the Handbook_Viewer SHALL validate that the file is a valid PDF and size is under 10MB
2. WHEN upload is successful THEN the Handbook_Viewer SHALL store the PDF in Firebase Storage and save the URL to settings
3. WHEN an admin uploads a new PDF THEN the Handbook_Viewer SHALL replace the previous handbook and update the timestamp
4. WHEN displaying the upload form THEN the Handbook_Viewer SHALL show the current handbook filename and last updated date

### Requirement 8

**User Story:** As a visitor on the login page, I want to view the student handbook as a flipbook, so that I can browse the handbook with a realistic page-turning experience.

#### Acceptance Criteria

1. WHEN a visitor views the login page THEN the Handbook_Viewer SHALL display the handbook PDF as an interactive flipbook
2. WHEN a user clicks or swipes to turn pages THEN the Handbook_Viewer SHALL animate the page turn with a realistic flip effect
3. WHEN displaying the flipbook THEN the Handbook_Viewer SHALL render pages clearly and legibly at the current viewport size
4. WHEN the viewport is mobile-sized THEN the Handbook_Viewer SHALL adjust the flipbook dimensions to fit the screen
5. WHEN the PDF is loading THEN the Handbook_Viewer SHALL display a loading skeleton until ready

### Requirement 9

**User Story:** As a developer, I want Lab requirement data to be validated with Zod schemas, so that data integrity is maintained throughout the system.

#### Acceptance Criteria

1. WHEN creating a Lab requirement THEN the Lab_Training_System SHALL validate against LabRequirementSchema before saving
2. WHEN reading Lab requirement data THEN the Lab_Training_System SHALL parse with LabRequirementSchema and handle validation errors
3. WHEN creating student progress THEN the Lab_Training_System SHALL validate against StudentLabProgressSchema before saving
4. WHEN serializing Lab requirement data THEN the Lab_Training_System SHALL produce valid JSON that can be deserialized back to the original schema
