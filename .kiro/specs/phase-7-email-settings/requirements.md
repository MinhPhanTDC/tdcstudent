# Requirements Document

## Introduction

Phase 7 bổ sung các tính năng cấu hình hệ thống cho Admin App và tính năng Handbook cho Student App. Bao gồm: trang Settings cho admin (đổi mật khẩu, kết nối Google OAuth để gửi email), Email Template Editor với các placeholder, trang hướng dẫn sử dụng Admin App, và trang Handbook cho học viên xem lại tài liệu hướng dẫn.

## Glossary

- **Admin Settings**: Trang cấu hình hệ thống dành cho admin
- **Google OAuth**: Xác thực Google để sử dụng Gmail API gửi email
- **Email Template**: Mẫu email HTML có thể tùy chỉnh với các placeholder
- **Placeholder**: Biến động được thay thế khi gửi email (ví dụ: {name}, {email})
- **Admin User Guide**: Trang hướng dẫn sử dụng Admin App
- **Student Handbook**: Tài liệu hướng dẫn dạng flipbook cho học viên xem lại
- **Gmail API**: API của Google để gửi email thông qua tài khoản Gmail

## Requirements

### Requirement 1: Admin Password Management

**User Story:** As an admin, I want to change my password from the settings page, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN an admin navigates to Settings page THEN the Admin App SHALL display a password change section with current password, new password, and confirm password fields
2. WHEN an admin submits a password change with valid current password THEN the Admin App SHALL update the password via Firebase Auth and display a success message
3. WHEN an admin submits a password change with incorrect current password THEN the Admin App SHALL display an error message without revealing security details
4. WHEN an admin submits a new password that does not meet complexity requirements THEN the Admin App SHALL display validation errors specifying the requirements
5. WHEN an admin submits mismatched new password and confirm password THEN the Admin App SHALL display an error indicating passwords do not match

### Requirement 2: Google OAuth Integration for Email

**User Story:** As an admin, I want to connect my Google account for sending emails, so that I can send login credentials and notifications to students via Gmail.

#### Acceptance Criteria

1. WHEN an admin views the Email Settings section THEN the Admin App SHALL display the current connection status (connected/disconnected) and connected email if applicable
2. WHEN an admin clicks "Connect with Google" THEN the Admin App SHALL initiate OAuth 2.0 flow with Gmail API scope
3. WHEN Google OAuth completes successfully THEN the Admin App SHALL store the refresh token securely and display the connected email address
4. WHEN an admin clicks "Disconnect" THEN the Admin App SHALL revoke the token and clear stored credentials
5. WHEN an admin clicks "Test Email" THEN the Admin App SHALL send a test email to the admin's email and display success or failure status
6. IF Google OAuth token expires THEN the Admin App SHALL automatically refresh the token using the stored refresh token

### Requirement 3: Email Template Configuration

**User Story:** As an admin, I want to configure email templates with HTML content and placeholders, so that I can customize emails sent to students.

#### Acceptance Criteria

1. WHEN an admin views Email Templates section THEN the Admin App SHALL display a list of available templates (Welcome, Password Reset, Course Notification)
2. WHEN an admin selects a template THEN the Admin App SHALL display a rich text editor with the template content
3. WHEN an admin views the template editor THEN the Admin App SHALL display a list of available placeholders with descriptions
4. WHEN an admin inserts a placeholder THEN the Admin App SHALL insert the placeholder syntax (e.g., {name}) at the cursor position
5. WHEN an admin clicks "Preview" THEN the Admin App SHALL render the template with sample data replacing all placeholders
6. WHEN an admin saves a template THEN the Admin App SHALL validate HTML content and persist to Firestore
7. WHEN an admin saves a template with invalid placeholder syntax THEN the Admin App SHALL display an error indicating the invalid placeholder

### Requirement 4: Email Placeholder System

**User Story:** As an admin, I want to use dynamic placeholders in email templates, so that emails are personalized for each recipient.

#### Acceptance Criteria

1. WHEN defining email placeholders THEN the System SHALL support the following variables: {name}, {email}, {password}, {login_url}, {timestamp}, {semester}, {course_name}, {admin_name}
2. WHEN sending an email THEN the System SHALL replace all placeholders with actual values from the recipient's data
3. WHEN a placeholder has no corresponding value THEN the System SHALL replace it with an empty string and log a warning
4. WHEN displaying placeholder list THEN the Admin App SHALL show placeholder name, description, and example value

### Requirement 5: Admin User Guide

**User Story:** As an admin, I want to access a user guide within the app, so that I can learn how to use all features effectively.

#### Acceptance Criteria

1. WHEN an admin navigates to Help page THEN the Admin App SHALL display a categorized list of help topics
2. WHEN an admin selects a help topic THEN the Admin App SHALL display detailed instructions with screenshots or illustrations
3. WHEN an admin searches in the help page THEN the Admin App SHALL filter topics matching the search query
4. WHEN displaying help content THEN the Admin App SHALL include sections for: Getting Started, Student Management, Course Management, Tracking, Settings, and FAQ
5. WHEN an admin views a help topic THEN the Admin App SHALL display step-by-step instructions with visual guides

### Requirement 6: Student Handbook Viewer

**User Story:** As a student, I want to view the handbook within the student portal, so that I can reference important information and guidelines anytime.

#### Acceptance Criteria

1. WHEN a student navigates to Handbook page THEN the Student App SHALL display the handbook in flipbook format
2. WHEN a handbook is available THEN the Student App SHALL load and render the PDF using the existing Flipbook component
3. WHEN no handbook is uploaded THEN the Student App SHALL display a message indicating handbook is not available
4. WHEN viewing the handbook THEN the Student App SHALL provide navigation controls (next page, previous page, page number input)
5. WHEN the student sidebar is displayed THEN the Student App SHALL include a "Handbook" menu item with appropriate icon

### Requirement 7: Settings Page Layout

**User Story:** As an admin, I want a well-organized settings page, so that I can easily find and configure different aspects of the system.

#### Acceptance Criteria

1. WHEN an admin navigates to Settings page THEN the Admin App SHALL display settings organized in sections: Account, Email Configuration, Email Templates
2. WHEN viewing Settings page THEN the Admin App SHALL display each section in a collapsible card format
3. WHEN an admin makes changes in any section THEN the Admin App SHALL enable a save button for that specific section
4. WHEN saving settings THEN the Admin App SHALL display loading state and success/error feedback

### Requirement 8: Email Sending Integration

**User Story:** As an admin, I want to send emails to students using configured templates, so that students receive properly formatted communications.

#### Acceptance Criteria

1. WHEN an admin sends email to a student THEN the System SHALL use the connected Gmail account via Gmail API
2. WHEN sending email THEN the System SHALL apply the selected template and replace all placeholders
3. WHEN email is sent successfully THEN the System SHALL log the email in Firestore with timestamp, recipient, and template used
4. WHEN email sending fails THEN the System SHALL display an error message and log the failure reason
5. WHEN Gmail is not connected THEN the Admin App SHALL display a prompt to connect Gmail before sending emails

### Requirement 9: Admin Sidebar Navigation Update

**User Story:** As an admin, I want to access all management pages from the sidebar, so that I can navigate to Semesters and Settings easily.

#### Acceptance Criteria

1. WHEN the admin sidebar is displayed THEN the Admin App SHALL include a "Học kỳ" (Semesters) menu item between "Khóa học" and "Chuyên ngành"
2. WHEN the admin sidebar is displayed THEN the Admin App SHALL include a "Cài đặt" (Settings) menu item at the bottom of the navigation
3. WHEN the admin sidebar is displayed THEN the Admin App SHALL include a "Hướng dẫn" (Help) menu item after Settings
4. WHEN an admin clicks on "Học kỳ" THEN the Admin App SHALL navigate to the semesters management page
5. WHEN an admin clicks on "Cài đặt" THEN the Admin App SHALL navigate to the settings page
6. WHEN an admin clicks on "Hướng dẫn" THEN the Admin App SHALL navigate to the help page

### Requirement 10: Student Password Management

**User Story:** As a student, I want to change my password from my profile page, so that I can maintain my account security.

#### Acceptance Criteria

1. WHEN a student navigates to Profile page THEN the Student App SHALL display a "Change Password" section
2. WHEN a student clicks "Change Password" THEN the Student App SHALL display a form with current password, new password, and confirm password fields
3. WHEN a student submits a password change with valid current password THEN the Student App SHALL update the password via Firebase Auth and display a success message
4. WHEN a student submits a password change with incorrect current password THEN the Student App SHALL display an error message without revealing security details
5. WHEN a student submits a new password that does not meet complexity requirements THEN the Student App SHALL display validation errors specifying the requirements (minimum 8 characters, at least one uppercase, one lowercase, one number)
6. WHEN a student submits mismatched new password and confirm password THEN the Student App SHALL display an error indicating passwords do not match
7. WHEN password is changed successfully THEN the Student App SHALL require re-authentication on next login

