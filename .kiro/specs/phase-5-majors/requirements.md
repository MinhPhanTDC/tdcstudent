# Requirements Document

## Introduction

Phase 5 xây dựng hệ thống quản lý chuyên ngành (Majors) cho The Design Council. Hệ thống cho phép Admin tạo và quản lý các chuyên ngành thiết kế (Graphic Design, UI/UX, Motion Graphics...), gắn môn học vào từng chuyên ngành, và cho phép học viên chọn chuyên ngành khi đến học kỳ phân ngành. Sau khi chọn, học viên sẽ thấy lộ trình học tập theo chuyên ngành đã chọn.

## Glossary

- **Major**: Chuyên ngành thiết kế (ví dụ: Graphic Design, UI/UX Design, Motion Graphics)
- **MajorCourse**: Liên kết giữa chuyên ngành và môn học, bao gồm thứ tự và loại (bắt buộc/tự chọn)
- **Major Selection**: Quá trình học viên chọn chuyên ngành tại học kỳ được chỉ định
- **Required Course**: Môn học bắt buộc trong chuyên ngành
- **Elective Course**: Môn học tự chọn trong chuyên ngành
- **Major Selection Semester**: Học kỳ yêu cầu học viên phải chọn chuyên ngành trước khi tiếp tục

## Requirements

### Requirement 1

**User Story:** As an admin, I want to create and manage majors, so that I can organize the curriculum into specialized tracks.

#### Acceptance Criteria

1. WHEN an admin submits a valid major form THEN the System SHALL create a new major with name, description, thumbnail, and color
2. WHEN an admin views the majors page THEN the System SHALL display all majors with their basic information
3. WHEN an admin updates a major THEN the System SHALL persist the changes and reflect them immediately
4. WHEN an admin deletes a major THEN the System SHALL perform a soft delete by setting isActive to false
5. WHEN an admin attempts to create a major with an empty name THEN the System SHALL reject the creation and display a validation error
6. WHEN displaying majors THEN the System SHALL show active majors first, sorted by name

---

### Requirement 2

**User Story:** As an admin, I want to assign courses to majors, so that each major has its own curriculum.

#### Acceptance Criteria

1. WHEN an admin adds a course to a major THEN the System SHALL create a MajorCourse record linking the course to the major
2. WHEN an admin views a major's detail page THEN the System SHALL display all courses assigned to that major in order
3. WHEN an admin reorders courses within a major THEN the System SHALL update the order field and persist the new sequence
4. WHEN an admin marks a course as required or elective THEN the System SHALL update the isRequired field accordingly
5. WHEN an admin removes a course from a major THEN the System SHALL delete the MajorCourse record
6. WHEN displaying major courses THEN the System SHALL show courses sorted by their order field ascending
7. WHEN an admin attempts to add a duplicate course to a major THEN the System SHALL reject the addition and display an error

---

### Requirement 3

**User Story:** As an admin, I want to configure which semester requires major selection, so that students choose their specialization at the right time.

#### Acceptance Criteria

1. WHEN an admin enables major selection requirement on a semester THEN the System SHALL set requiresMajorSelection to true
2. WHEN an admin disables major selection requirement on a semester THEN the System SHALL set requiresMajorSelection to false
3. WHEN displaying semester form THEN the System SHALL include a toggle for major selection requirement
4. WHEN a student reaches a semester with requiresMajorSelection true and has no selectedMajorId THEN the System SHALL block access to semester courses

---

### Requirement 4

**User Story:** As a student, I want to select my major when required, so that I can specialize in my preferred design field.

#### Acceptance Criteria

1. WHEN a student without a selected major accesses a major-required semester THEN the System SHALL redirect to the major selection page
2. WHEN a student views the major selection page THEN the System SHALL display all active majors with name, description, and course count
3. WHEN a student clicks "View Details" on a major THEN the System SHALL display the list of courses in that major
4. WHEN a student selects a major THEN the System SHALL display a confirmation dialog warning that the choice is permanent
5. WHEN a student confirms major selection THEN the System SHALL update the student's selectedMajorId and majorSelectedAt fields
6. IF a student already has a selectedMajorId THEN the System SHALL prevent changing the major and display the current selection
7. WHEN major selection is successful THEN the System SHALL redirect the student to their dashboard

---

### Requirement 5

**User Story:** As a student, I want to view my major's courses and progress, so that I can track my specialization journey.

#### Acceptance Criteria

1. WHEN a student with a selected major views their major page THEN the System SHALL display the major name and description
2. WHEN displaying major courses THEN the System SHALL show each course with its completion status (locked, in-progress, completed)
3. WHEN displaying major progress THEN the System SHALL calculate and show the percentage of completed courses
4. WHEN a student has not selected a major THEN the System SHALL display a message prompting them to select one when available
5. WHEN displaying the learning tree THEN the System SHALL integrate major courses into the visualization

---

### Requirement 6

**User Story:** As an admin, I want to override a student's major selection in exceptional cases, so that I can handle special situations.

#### Acceptance Criteria

1. WHEN an admin views a student's profile THEN the System SHALL display the student's current major selection
2. WHEN an admin overrides a student's major THEN the System SHALL update the selectedMajorId and log the change
3. WHEN an admin clears a student's major selection THEN the System SHALL set selectedMajorId to null and allow re-selection

---

### Requirement 7

**User Story:** As a developer, I want to serialize and deserialize Major and MajorCourse data, so that data integrity is maintained across the system.

#### Acceptance Criteria

1. WHEN storing a Major to Firestore THEN the System SHALL validate it against MajorSchema before saving
2. WHEN reading a Major from Firestore THEN the System SHALL parse it through MajorSchema and handle validation errors
3. WHEN storing a MajorCourse to Firestore THEN the System SHALL validate it against MajorCourseSchema before saving
4. WHEN reading a MajorCourse from Firestore THEN the System SHALL parse it through MajorCourseSchema and handle validation errors
5. WHEN serializing Major data THEN the System SHALL produce valid JSON that can be deserialized back to the original structure
6. WHEN serializing MajorCourse data THEN the System SHALL produce valid JSON that can be deserialized back to the original structure
