# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu để khắc phục tất cả các vấn đề được phát hiện trong quá trình đánh giá dự án The Design Council LMS trước khi deploy lên production. Các vấn đề bao gồm: lỗ hổng bảo mật trong Firebase Storage rules, cấu hình environment variables không đúng, và cấu hình Firebase Hosting chưa phù hợp.

## Glossary

- **Storage Rules**: Quy tắc bảo mật của Firebase Storage kiểm soát quyền đọc/ghi files
- **Firestore Rules**: Quy tắc bảo mật của Firebase Firestore kiểm soát quyền truy cập dữ liệu
- **Environment Variables**: Biến môi trường chứa cấu hình ứng dụng
- **Static Export**: Chế độ build Next.js xuất ra HTML/CSS/JS tĩnh
- **Firebase Hosting**: Dịch vụ hosting của Firebase cho web apps
- **Cross-domain Auth**: Xác thực người dùng giữa các domain khác nhau

## Requirements

### Requirement 1: Fix Firebase Storage Security Rules

**User Story:** As a system administrator, I want to ensure that only authenticated users can upload files to the media storage, so that the system is protected from unauthorized uploads and potential abuse.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to upload a file to the media folder THEN the Storage_Rules SHALL reject the upload request with permission denied
2. WHEN an authenticated admin user uploads a file to the media folder THEN the Storage_Rules SHALL allow the upload if file size is within limits
3. WHEN any user uploads a file exceeding 10MB THEN the Storage_Rules SHALL reject the upload regardless of authentication status
4. IF the storage rules contain temporary development bypasses THEN the Storage_Rules SHALL have those bypasses removed before production deployment
5. WHEN validating storage rules THEN the Validation_Script SHALL check for any rules that allow unauthenticated writes

### Requirement 2: Fix Environment Variable Configuration

**User Story:** As a developer, I want the environment variable validation to correctly identify invalid configurations, so that deployment issues are caught before they reach production.

#### Acceptance Criteria

1. WHEN the NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET contains a value ending with `.firebasestorage.app` THEN the Validation_Script SHALL accept it as valid
2. WHEN the NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET contains a value ending with `.appspot.com` THEN the Validation_Script SHALL accept it as valid
3. WHEN running validation in strict mode with localhost URLs THEN the Validation_Script SHALL report an error requiring HTTPS URLs
4. WHEN all required environment variables are set with valid values THEN the Validation_Script SHALL pass without errors
5. IF an environment variable has an invalid format THEN the Validation_Script SHALL provide a clear error message explaining the expected format

### Requirement 3: Configure Firebase Hosting for Static Export

**User Story:** As a DevOps engineer, I want the Next.js apps to be correctly configured for Firebase Hosting static deployment, so that the apps can be served without server-side rendering requirements.

#### Acceptance Criteria

1. WHEN building the auth app for production THEN the Build_System SHALL generate static HTML files in the `out` directory
2. WHEN building the admin app for production THEN the Build_System SHALL generate static HTML files in the `out` directory
3. WHEN building the student app for production THEN the Build_System SHALL generate static HTML files in the `out` directory
4. WHEN a Next.js app has dynamic routes THEN the Build_Config SHALL handle them appropriately for static export
5. IF the firebase.json references the `out` directory THEN the Next_Config SHALL include `output: 'export'` configuration

### Requirement 4: Implement Cross-Domain Authentication for Media Upload

**User Story:** As an admin user, I want to upload media files from the admin dashboard without authentication issues, so that I can manage login page backgrounds and other media assets.

#### Acceptance Criteria

1. WHEN an admin user is authenticated in the admin app THEN the Auth_System SHALL maintain the authentication state for Firebase Storage operations
2. WHEN uploading a file from the admin dashboard THEN the Upload_Service SHALL include proper authentication headers
3. WHEN the Firebase Auth token expires during upload THEN the Upload_Service SHALL refresh the token and retry the upload
4. IF cross-domain authentication fails THEN the System SHALL display a user-friendly error message with retry option
5. WHEN authentication is successful THEN the Media_Upload_Component SHALL proceed with the file upload to Firebase Storage

### Requirement 5: Update Deployment Scripts and Documentation

**User Story:** As a developer, I want comprehensive deployment scripts and documentation, so that I can deploy the application to production safely and consistently.

#### Acceptance Criteria

1. WHEN running the deploy script THEN the Script SHALL validate all security rules before deployment
2. WHEN running the deploy script with --strict flag THEN the Script SHALL fail if any security vulnerabilities are detected
3. WHEN deployment completes successfully THEN the Script SHALL output the deployed URLs and verification steps
4. WHEN a deployment step fails THEN the Script SHALL provide clear error messages and rollback instructions
5. IF the deployment checklist is incomplete THEN the Documentation SHALL be updated with all required pre-deployment steps

### Requirement 6: Add Security Validation Script

**User Story:** As a security engineer, I want automated security validation for Firebase rules, so that security vulnerabilities are detected before deployment.

#### Acceptance Criteria

1. WHEN running the security validation script THEN the Script SHALL check for unauthenticated write rules in storage.rules
2. WHEN running the security validation script THEN the Script SHALL check for overly permissive read rules in firestore.rules
3. WHEN a security issue is found THEN the Script SHALL report the file, line number, and recommended fix
4. WHEN all security checks pass THEN the Script SHALL output a success message with summary
5. IF the script finds TODO or TEMPORARY comments in rules THEN the Script SHALL flag them as warnings requiring review

