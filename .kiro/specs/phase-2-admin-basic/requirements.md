# Requirements Document

## Introduction

Phase 2 - Admin Basic Management là giai đoạn xây dựng các tính năng CRUD cơ bản cho Admin Dashboard của The Design Council Webapp. Phase này bao gồm quản lý Học kỳ (Semester), Môn học (Course), Học viên (Student), và tính năng Import học viên hàng loạt từ Excel/CSV. Đây là nền tảng để Admin có thể quản lý toàn bộ hệ thống học tập.

## Glossary

- **Admin App**: Ứng dụng quản trị dành cho quản lý viên
- **Semester**: Học kỳ - đơn vị thời gian học tập (Học kỳ Dự bị, Học kỳ 1, 2, 3...)
- **Course**: Môn học - nội dung học tập thuộc một học kỳ
- **Student**: Học viên - người dùng có role student trong hệ thống
- **Genially**: Nền tảng tạo nội dung tương tác, dùng để tạo bài học
- **Firebase Auth**: Dịch vụ xác thực của Firebase
- **Firestore**: Cơ sở dữ liệu NoSQL của Firebase
- **Zod Schema**: Thư viện validation schema cho TypeScript
- **Repository Pattern**: Pattern truy cập dữ liệu tách biệt logic business và data access
- **Bulk Import**: Tính năng import nhiều bản ghi cùng lúc từ file

## Requirements

### Requirement 1: Semester Management

**User Story:** As an admin, I want to manage semesters, so that I can organize courses and track student progress by academic periods.

#### Acceptance Criteria

1. WHEN an admin views the semester list THEN the Admin App SHALL display all semesters sorted by order field in ascending order
2. WHEN an admin creates a new semester THEN the Admin App SHALL validate that name is between 1-100 characters and order is a non-negative integer
3. WHEN an admin creates a semester with duplicate order THEN the Admin App SHALL display a validation error and prevent creation
4. WHEN an admin updates a semester THEN the Admin App SHALL persist changes to Firestore and update the updatedAt timestamp
5. WHEN an admin deletes a semester that has associated courses THEN the Admin App SHALL display a confirmation warning listing affected courses
6. WHEN an admin deletes a semester with no associated courses THEN the Admin App SHALL remove the semester after confirmation
7. WHEN an admin reorders semesters THEN the Admin App SHALL update the order field for all affected semesters atomically
8. WHEN an admin toggles semester active status THEN the Admin App SHALL update isActive field and reflect the change immediately in the UI
9. WHEN an admin marks a semester as requiring major selection THEN the Admin App SHALL set requiresMajorSelection to true for semesters from HK3 onwards

### Requirement 2: Course Management

**User Story:** As an admin, I want to manage courses within semesters, so that I can organize learning content for students.

#### Acceptance Criteria

1. WHEN an admin views the course list THEN the Admin App SHALL display courses with filtering capability by semester
2. WHEN an admin creates a new course THEN the Admin App SHALL validate that title is between 1-200 characters and semesterId references an existing semester
3. WHEN an admin enters a Genially URL THEN the Admin App SHALL validate the URL format before saving
4. WHEN an admin creates a course THEN the Admin App SHALL set default values for requiredSessions (10) and requiredProjects (1)
5. WHEN an admin updates course information THEN the Admin App SHALL persist changes to Firestore and update the updatedAt timestamp
6. WHEN an admin deletes a course THEN the Admin App SHALL display a confirmation dialog before deletion
7. WHEN an admin views semester detail THEN the Admin App SHALL display all courses belonging to that semester sorted by order
8. WHEN an admin reorders courses within a semester THEN the Admin App SHALL update the order field for all affected courses atomically
9. WHEN an admin changes a course's semester THEN the Admin App SHALL update the semesterId and reset the order to the last position in the new semester
10. WHEN an admin uploads a course thumbnail THEN the Admin App SHALL validate the image format and display a preview before saving

### Requirement 3: Student Management

**User Story:** As an admin, I want to manage student accounts, so that I can control access to the learning platform.

#### Acceptance Criteria

1. WHEN an admin views the student list THEN the Admin App SHALL display paginated student records with search by name or email
2. WHEN an admin creates a new student THEN the Admin App SHALL create both Firebase Auth account and Firestore documents (users and students collections)
3. WHEN an admin creates a student without providing password THEN the Admin App SHALL generate a random secure password
4. WHEN an admin creates a student with an existing email THEN the Admin App SHALL display an error message indicating email already exists
5. WHEN an admin updates student information THEN the Admin App SHALL persist changes to Firestore and update the updatedAt timestamp
6. WHEN an admin deactivates a student account THEN the Admin App SHALL disable the Firebase Auth account and set isActive to false in Firestore
7. WHEN an admin activates a deactivated student account THEN the Admin App SHALL enable the Firebase Auth account and set isActive to true in Firestore
8. WHEN an admin views student detail THEN the Admin App SHALL display student information including current semester and enrolled courses
9. WHEN an admin filters students THEN the Admin App SHALL support filtering by active status and current semester
10. WHEN an admin searches students THEN the Admin App SHALL return results matching name or email within 500ms

### Requirement 4: Bulk Student Import

**User Story:** As an admin, I want to import multiple students from Excel/CSV files, so that I can efficiently onboard large groups of students.

#### Acceptance Criteria

1. WHEN an admin uploads a CSV file THEN the Admin App SHALL parse the file and extract name and email columns
2. WHEN an admin uploads an Excel file THEN the Admin App SHALL parse the file and extract name and email columns from the first sheet
3. WHEN parsing import file THEN the Admin App SHALL validate each row for required fields (name, email) and email format
4. WHEN validation completes THEN the Admin App SHALL display a preview table showing each row with validation status (valid/invalid)
5. WHEN a row has invalid data THEN the Admin App SHALL display the specific validation error for that row
6. WHEN an admin confirms import THEN the Admin App SHALL create student accounts only for valid rows
7. WHEN import is in progress THEN the Admin App SHALL display a progress indicator showing completed/total count
8. WHEN import completes THEN the Admin App SHALL display a summary report with success count, failure count, and failure reasons
9. WHEN importing students THEN the Admin App SHALL implement rate limiting to avoid Firebase quota issues (maximum 10 accounts per second)
10. WHEN a duplicate email is found during import THEN the Admin App SHALL skip that row and include it in the failure report

### Requirement 5: Admin Dashboard Enhancement

**User Story:** As an admin, I want to see an overview of the system, so that I can quickly understand the current state and take actions.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Admin App SHALL display total count of semesters, courses, and students
2. WHEN an admin views the dashboard THEN the Admin App SHALL display count of new students enrolled in the current month
3. WHEN an admin views the dashboard THEN the Admin App SHALL display a list of the 5 most recently created students
4. WHEN an admin clicks a quick action button THEN the Admin App SHALL navigate to the corresponding management page
5. WHEN dashboard data is loading THEN the Admin App SHALL display skeleton loaders for each statistics card
6. WHEN dashboard data fails to load THEN the Admin App SHALL display an error message with retry option

### Requirement 6: Data Validation and Persistence

**User Story:** As a system, I want to ensure data integrity, so that all stored data is valid and consistent.

#### Acceptance Criteria

1. WHEN storing semester data THEN the System SHALL validate against SemesterSchema before persisting to Firestore
2. WHEN storing course data THEN the System SHALL validate against CourseSchema before persisting to Firestore
3. WHEN storing student data THEN the System SHALL validate against StudentSchema before persisting to Firestore
4. WHEN retrieving data from Firestore THEN the System SHALL validate against the corresponding Zod schema before use
5. WHEN validation fails THEN the System SHALL return a typed error with field-level error messages
6. WHEN creating or updating records THEN the System SHALL automatically set createdAt and updatedAt timestamps

### Requirement 7: Error Handling

**User Story:** As an admin, I want clear error messages, so that I can understand and resolve issues quickly.

#### Acceptance Criteria

1. WHEN a Firestore operation fails THEN the Admin App SHALL display a user-friendly error message in Vietnamese
2. WHEN a network error occurs THEN the Admin App SHALL display a connection error message with retry option
3. WHEN validation fails on form submission THEN the Admin App SHALL highlight invalid fields and display field-level error messages
4. WHEN a delete operation fails due to dependencies THEN the Admin App SHALL explain which dependencies prevent deletion
5. WHEN Firebase Auth operation fails THEN the Admin App SHALL map Firebase error codes to localized error messages

### Requirement 8: UI/UX Standards

**User Story:** As an admin, I want a consistent and intuitive interface, so that I can efficiently manage the system.

#### Acceptance Criteria

1. WHEN displaying lists THEN the Admin App SHALL show loading skeletons during data fetch
2. WHEN a list is empty THEN the Admin App SHALL display an empty state with call-to-action button
3. WHEN an action succeeds THEN the Admin App SHALL display a success toast notification
4. WHEN an action fails THEN the Admin App SHALL display an error toast notification with the error message
5. WHEN navigating between pages THEN the Admin App SHALL preserve filter and search state in URL parameters
6. WHEN confirming destructive actions THEN the Admin App SHALL display a confirmation modal with clear warning text

