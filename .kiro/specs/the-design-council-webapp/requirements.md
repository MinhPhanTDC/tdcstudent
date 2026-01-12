# Requirements Document

## Introduction

The Design Council Webapp là một hệ thống quản lý học viên bao gồm: một trang đăng nhập chung (tự động redirect theo role), Admin App và Student App. Hệ thống được xây dựng theo kiến trúc Monorepo với shared components, sử dụng Firebase làm backend để tối ưu chi phí triển khai trên Google Cloud. Landing page không nằm trong scope vì đã có sẵn.

## Glossary

- **System**: The Design Council Webapp - hệ thống webapp tổng thể
- **Auth App**: Ứng dụng đăng nhập chung, tự động redirect theo role
- **Admin App**: Ứng dụng quản trị dành cho quản lý viên
- **Student App**: Ứng dụng dành cho học viên
- **User**: Người dùng hệ thống (Admin hoặc Student)
- **Firebase Auth**: Dịch vụ xác thực của Firebase
- **Firestore**: Cơ sở dữ liệu NoSQL của Firebase
- **Shared Component**: Component UI được tái sử dụng giữa các ứng dụng
- **API Schema**: Định nghĩa cấu trúc dữ liệu cho API requests/responses
- **Zod Schema**: Thư viện validation schema cho TypeScript

## Requirements

### Requirement 1: Unified Authentication with Role-Based Redirect

**User Story:** As a user, I want to log in through a single login page, so that I am automatically redirected to the appropriate app based on my role.

#### Acceptance Criteria

1. WHEN a user submits valid email and password credentials THEN the Auth App SHALL authenticate via Firebase Auth and retrieve the user role from Firestore
2. WHEN an authenticated user has admin role THEN the Auth App SHALL redirect to the Admin App dashboard
3. WHEN an authenticated user has student role THEN the Auth App SHALL redirect to the Student App dashboard
4. WHEN a user submits invalid credentials THEN the Auth App SHALL display a localized error message within 2 seconds without exposing security-sensitive information
5. WHEN an authenticated session expires THEN the System SHALL redirect to the login page and preserve the intended destination URL
6. WHEN a user requests password reset THEN the Auth App SHALL send a reset email via Firebase Auth within 30 seconds
7. WHEN a user logs out from any app THEN the System SHALL clear all session data and redirect to the login page

### Requirement 2: Role-Based Access Control

**User Story:** As a system administrator, I want to enforce role separation between apps, so that admins and students access only their respective portals.

#### Acceptance Criteria

1. WHEN a user authenticates successfully THEN the System SHALL retrieve the user role from Firestore and validate access to the current application
2. WHEN an unauthenticated user attempts to access a protected route THEN the System SHALL redirect to the login page
3. WHEN a student user attempts to access Admin App THEN the Admin App SHALL display an unauthorized error and redirect to the login page
4. WHEN an admin user attempts to access Student App THEN the Student App SHALL display an unauthorized error and redirect to the login page

### Requirement 3: Admin Dashboard

**User Story:** As an admin, I want to manage students and courses, so that I can maintain the learning platform effectively.

#### Acceptance Criteria

1. WHEN an admin views the student list THEN the Admin App SHALL display paginated student records with search and filter capabilities
2. WHEN an admin creates a new student account THEN the Admin App SHALL validate input data and create the account in Firebase Auth and Firestore
3. WHEN an admin updates student information THEN the Admin App SHALL persist changes to Firestore and display a success confirmation
4. WHEN an admin deactivates a student account THEN the Admin App SHALL disable the account in Firebase Auth and update the status in Firestore
5. WHEN an admin views dashboard analytics THEN the Admin App SHALL display student enrollment statistics and activity metrics

### Requirement 4: Student Portal

**User Story:** As a student, I want to access my learning materials and track my progress, so that I can effectively complete my courses.

#### Acceptance Criteria

1. WHEN a student logs in THEN the Student App SHALL display the personalized dashboard with enrolled courses
2. WHEN a student views course details THEN the Student App SHALL display course content, progress percentage, and completion status
3. WHEN a student completes a lesson THEN the Student App SHALL update progress in Firestore and reflect the change immediately in the UI
4. WHEN a student views their profile THEN the Student App SHALL display editable personal information with validation

### Requirement 5: Shared Component Library

**User Story:** As a developer, I want to use consistent UI components across both apps, so that the user experience is uniform and maintenance is simplified.

#### Acceptance Criteria

1. WHEN a shared component is imported THEN the System SHALL render the component with consistent styling across Admin App and Student App
2. WHEN a shared component receives props THEN the System SHALL validate prop types at compile time using TypeScript
3. WHEN a shared component is updated in the packages/ui directory THEN the System SHALL propagate changes to both consuming applications during build
4. WHEN building any application THEN the System SHALL produce zero TypeScript errors and zero ESLint warnings

### Requirement 6: Configuration Management

**User Story:** As a developer, I want centralized configuration without hardcoded values, so that the application is secure and environment-agnostic.

#### Acceptance Criteria

1. WHEN the application starts THEN the System SHALL load configuration from environment variables
2. WHEN a required environment variable is missing THEN the System SHALL fail fast with a descriptive error message during startup
3. WHEN Firebase credentials are needed THEN the System SHALL retrieve credentials from environment variables without exposing them in the codebase
4. WHEN building for different environments THEN the System SHALL use environment-specific configuration files

### Requirement 7: Data Persistence

**User Story:** As a system, I want to reliably store and retrieve data, so that user information and progress are preserved.

#### Acceptance Criteria

1. WHEN storing user data THEN the System SHALL serialize the data to JSON format and persist to Firestore
2. WHEN retrieving user data THEN the System SHALL deserialize JSON from Firestore and validate against TypeScript interfaces
3. WHEN a Firestore operation fails THEN the System SHALL retry up to 3 times with exponential backoff before displaying an error
4. WHEN user data is updated THEN the System SHALL maintain audit fields including createdAt and updatedAt timestamps

### Requirement 8: Build and Deployment

**User Story:** As a developer, I want a reliable build pipeline, so that I can deploy the application with confidence.

#### Acceptance Criteria

1. WHEN running the build command THEN the System SHALL compile both applications and all packages with zero errors
2. WHEN running lint checks THEN the System SHALL report zero warnings across the entire monorepo
3. WHEN deploying to Firebase Hosting THEN the System SHALL deploy Admin App and Student App to their respective hosting targets
4. WHEN the build completes THEN the System SHALL generate optimized production bundles with code splitting



### Requirement 9: API Schema and Data Validation

**User Story:** As a developer, I want strict API schemas and validation, so that data integrity is maintained and runtime errors are prevented.

#### Acceptance Criteria

1. WHEN defining a data model THEN the System SHALL use Zod schemas as the single source of truth for validation
2. WHEN a Zod schema is defined THEN the System SHALL auto-generate TypeScript types using Zod inference
3. WHEN data is received from Firestore THEN the System SHALL validate against the corresponding Zod schema before use
4. WHEN data is sent to Firestore THEN the System SHALL validate against the corresponding Zod schema before persistence
5. WHEN validation fails THEN the System SHALL throw a typed error with detailed field-level error messages
6. WHEN defining API response types THEN the System SHALL use discriminated unions for success and error states

### Requirement 10: Code Architecture Patterns

**User Story:** As a developer, I want consistent code patterns across the codebase, so that the code is maintainable and predictable during vibe coding.

#### Acceptance Criteria

1. WHEN creating a new feature THEN the System SHALL follow the feature-based folder structure pattern
2. WHEN implementing data fetching THEN the System SHALL use custom hooks with consistent naming convention (useXxx)
3. WHEN handling async operations THEN the System SHALL use a Result type pattern to handle success and error states explicitly
4. WHEN creating React components THEN the System SHALL separate container components from presentational components
5. WHEN defining component props THEN the System SHALL use TypeScript interfaces with explicit prop types
6. WHEN implementing state management THEN the System SHALL use React Context with typed providers for shared state

### Requirement 11: Error Handling Standards

**User Story:** As a developer, I want consistent error handling patterns, so that errors are handled predictably and debugging is simplified.

#### Acceptance Criteria

1. WHEN an error occurs in async operations THEN the System SHALL wrap errors in a typed AppError class with error codes
2. WHEN displaying errors to users THEN the System SHALL map error codes to user-friendly localized messages
3. WHEN logging errors THEN the System SHALL include context information without exposing sensitive data
4. WHEN a component encounters an error THEN the System SHALL use Error Boundaries to prevent full app crashes
5. WHEN Firebase operations fail THEN the System SHALL map Firebase error codes to application-specific error codes

### Requirement 12: Code Quality Standards

**User Story:** As a developer, I want enforced code quality standards, so that the codebase remains clean and consistent.

#### Acceptance Criteria

1. WHEN writing TypeScript code THEN the System SHALL enforce strict mode with no implicit any
2. WHEN importing modules THEN the System SHALL use absolute imports with path aliases defined in tsconfig
3. WHEN defining constants THEN the System SHALL use const assertions and centralized constant files
4. WHEN writing functions THEN the System SHALL include explicit return types for all exported functions
5. WHEN creating utility functions THEN the System SHALL place them in the shared packages with unit tests
6. WHEN committing code THEN the System SHALL pass all ESLint rules and Prettier formatting checks


### Requirement 13: File and Folder Naming Conventions

**User Story:** As a developer, I want consistent naming conventions, so that the codebase is navigable and predictable during vibe coding.

#### Acceptance Criteria

1. WHEN creating a React component file THEN the System SHALL use PascalCase naming (e.g., UserProfile.tsx)
2. WHEN creating a hook file THEN the System SHALL use camelCase with "use" prefix (e.g., useAuth.ts)
3. WHEN creating a utility file THEN the System SHALL use camelCase naming (e.g., formatDate.ts)
4. WHEN creating a constant file THEN the System SHALL use camelCase naming with descriptive suffix (e.g., errorCodes.ts)
5. WHEN creating a type/interface file THEN the System SHALL use camelCase naming with ".types.ts" suffix (e.g., user.types.ts)
6. WHEN creating a Zod schema file THEN the System SHALL use camelCase naming with ".schema.ts" suffix (e.g., user.schema.ts)
7. WHEN creating a folder for a feature THEN the System SHALL use kebab-case naming (e.g., student-management/)

### Requirement 14: Import and Export Standards

**User Story:** As a developer, I want consistent import/export patterns, so that circular dependencies are avoided and code is maintainable.

#### Acceptance Criteria

1. WHEN exporting from a module THEN the System SHALL use named exports for utilities and default exports for components
2. WHEN a package has multiple exports THEN the System SHALL provide an index.ts barrel file with explicit re-exports
3. WHEN importing from shared packages THEN the System SHALL use package aliases (e.g., @tdc/ui, @tdc/schemas)
4. WHEN importing within an app THEN the System SHALL use path aliases (e.g., @/components, @/hooks)
5. WHEN organizing imports THEN the System SHALL group imports in order: external, shared packages, internal, relative
6. WHEN detecting circular dependencies THEN the build process SHALL fail with a descriptive error message

### Requirement 15: Firebase Security Rules

**User Story:** As a system administrator, I want secure Firebase rules, so that data is protected from unauthorized access.

#### Acceptance Criteria

1. WHEN a user accesses Firestore THEN the Security Rules SHALL verify the user is authenticated
2. WHEN a user reads their own data THEN the Security Rules SHALL allow access only to documents where userId matches the authenticated user
3. WHEN an admin accesses student data THEN the Security Rules SHALL verify the user has admin role in their profile document
4. WHEN a user attempts to modify another user's data THEN the Security Rules SHALL deny the operation
5. WHEN deploying security rules THEN the System SHALL include the rules in the deployment pipeline

### Requirement 16: Component Architecture Standards

**User Story:** As a developer, I want clear component architecture guidelines, so that components are reusable and maintainable.

#### Acceptance Criteria

1. WHEN creating a shared UI component THEN the System SHALL place it in packages/ui with props interface and JSDoc documentation
2. WHEN creating an app-specific component THEN the System SHALL place it in the app's components folder with feature grouping
3. WHEN a component exceeds 150 lines THEN the System SHALL split it into smaller sub-components
4. WHEN a component needs styling THEN the System SHALL use Tailwind CSS classes with cn() utility for conditional classes
5. WHEN a component has complex logic THEN the System SHALL extract logic into custom hooks
6. WHEN creating form components THEN the System SHALL use react-hook-form with Zod resolver for validation

### Requirement 17: State Management Boundaries

**User Story:** As a developer, I want clear state management guidelines, so that state is managed consistently and efficiently.

#### Acceptance Criteria

1. WHEN state is used by a single component THEN the System SHALL use useState hook
2. WHEN state is shared between parent and children THEN the System SHALL pass state via props
3. WHEN state is shared across multiple unrelated components THEN the System SHALL use React Context
4. WHEN state requires complex updates THEN the System SHALL use useReducer with typed actions
5. WHEN caching server data THEN the System SHALL use TanStack Query (React Query) with typed query keys
6. WHEN defining context THEN the System SHALL create typed context with null-safe custom hook accessor

### Requirement 18: Testing Standards

**User Story:** As a developer, I want testing guidelines, so that code quality is maintained through automated tests.

#### Acceptance Criteria

1. WHEN creating a utility function THEN the System SHALL include unit tests with Vitest
2. WHEN creating a Zod schema THEN the System SHALL include validation tests for valid and invalid inputs
3. WHEN creating a custom hook THEN the System SHALL include tests using @testing-library/react-hooks
4. WHEN testing components THEN the System SHALL use @testing-library/react with user-event
5. WHEN running tests THEN the System SHALL achieve minimum 80% code coverage for shared packages
6. WHEN a test fails THEN the build pipeline SHALL block deployment until tests pass


### Requirement 19: Responsive Design

**User Story:** As a user, I want to access the application on any device, so that I can use the system conveniently from desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHEN viewing on desktop (viewport >= 1024px) THEN the System SHALL display full sidebar navigation and multi-column layouts
2. WHEN viewing on tablet (768px <= viewport < 1024px) THEN the System SHALL display collapsible sidebar and adaptive layouts
3. WHEN viewing on mobile (viewport < 768px) THEN the System SHALL display bottom navigation or hamburger menu with single-column layouts
4. WHEN resizing the browser window THEN the System SHALL smoothly transition between breakpoints without layout breaking
5. WHEN interacting on touch devices THEN the System SHALL provide touch-friendly tap targets (minimum 44x44px)

### Requirement 23: Accessibility (WCAG 2.1 AA)

**User Story:** As a user with disabilities, I want the application to be accessible, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. WHEN using keyboard navigation THEN all interactive elements SHALL be focusable and operable without a mouse
2. WHEN using screen readers THEN the System SHALL provide appropriate ARIA labels and semantic HTML structure
3. WHEN displaying text content THEN the System SHALL maintain minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
4. WHEN displaying form fields THEN the System SHALL associate labels with inputs and provide clear error messages
5. WHEN displaying images THEN the System SHALL provide meaningful alt text for informative images
6. WHEN focus moves THEN the System SHALL display visible focus indicators on all interactive elements
7. WHEN content updates dynamically THEN the System SHALL announce changes to assistive technologies using ARIA live regions

### Requirement 21: Performance Standards

**User Story:** As a user, I want the application to load quickly and respond instantly, so that I can work efficiently without waiting.

#### Acceptance Criteria

1. WHEN loading the initial page THEN the System SHALL achieve First Contentful Paint (FCP) under 1.5 seconds on 4G connection
2. WHEN loading the initial page THEN the System SHALL achieve Largest Contentful Paint (LCP) under 2.5 seconds
3. WHEN interacting with UI elements THEN the System SHALL respond within 100ms (Interaction to Next Paint)
4. WHEN building for production THEN the System SHALL generate JavaScript bundles under 200KB (gzipped) per route
5. WHEN loading images THEN the System SHALL use lazy loading and optimized formats (WebP with fallbacks)
6. WHEN fetching data THEN the System SHALL implement caching strategies to minimize redundant network requests
7. WHEN the application is idle THEN the System SHALL prefetch likely next routes for instant navigation

### Requirement 22: Internationalization (i18n) Ready

**User Story:** As a product owner, I want the application to support multiple languages in the future, so that we can expand to international markets.

#### Acceptance Criteria

1. WHEN displaying user-facing text THEN the System SHALL use translation keys instead of hardcoded strings
2. WHEN storing translation files THEN the System SHALL organize translations in JSON format per locale (e.g., vi.json, en.json)
3. WHEN the application loads THEN the System SHALL detect and apply the user's preferred language from browser settings
4. WHEN displaying dates and numbers THEN the System SHALL format according to the active locale
5. WHEN adding new UI text THEN developers SHALL add corresponding translation keys to all supported locale files
