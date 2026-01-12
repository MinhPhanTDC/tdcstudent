# Implementation Tasks

## Phase 1: Project Setup & Infrastructure ✅

### Task 1.1: Initialize Monorepo Structure ✅
- [x] Create root package.json with pnpm workspaces
- [x] Create pnpm-workspace.yaml
- [x] Create turbo.json configuration
- [x] Setup root tsconfig.json with base configuration
- [x] Setup root .eslintrc.js
- [x] Setup root .prettierrc
- [x] Create .gitignore
- [x] Create .nvmrc (Node 20 LTS)

**Requirements:** Req 8, Req 12

### Task 1.2: Setup Shared Config Package ✅
- [x] Create packages/config/eslint/index.js
- [x] Create packages/config/typescript/base.json
- [x] Create packages/config/tailwind/preset.js
- [x] Create packages/config/package.json

**Requirements:** Req 6, Req 12

### Task 1.3: Setup Types Package ✅
- [x] Create packages/types/src/result.types.ts (Result type pattern)
- [x] Create packages/types/src/error.types.ts (AppError class, ErrorCode enum)
- [x] Create packages/types/src/common.types.ts
- [x] Create packages/types/index.ts (barrel exports)
- [x] Create packages/types/package.json

**Requirements:** Req 9, Req 10, Req 11

### Task 1.4: Setup Schemas Package ✅
- [x] Create packages/schemas/src/common.schema.ts (base schemas)
- [x] Create packages/schemas/src/user.schema.ts
- [x] Create packages/schemas/src/student.schema.ts
- [x] Create packages/schemas/src/course.schema.ts
- [x] Create packages/schemas/src/api.schema.ts (pagination, error response)
- [x] Create packages/schemas/index.ts (barrel exports)
- [x] Create packages/schemas/package.json

**Requirements:** Req 9, Req 7

### Task 1.5: Setup Firebase Package ✅
- [x] Create packages/firebase/src/config.ts (Firebase initialization)
- [x] Create packages/firebase/src/auth.ts (auth functions)
- [x] Create packages/firebase/src/firestore.ts (Firestore helpers)
- [x] Create packages/firebase/src/errors.ts (error mapping)
- [x] Create packages/firebase/src/repositories/base.repository.ts
- [x] Create packages/firebase/src/repositories/user.repository.ts
- [x] Create packages/firebase/src/repositories/student.repository.ts
- [x] Create packages/firebase/src/repositories/course.repository.ts
- [x] Create packages/firebase/index.ts
- [x] Create packages/firebase/package.json

**Requirements:** Req 7, Req 11, Req 15

---

## Phase 2: Shared UI Components ✅

### Task 2.1: Setup UI Package Base ✅
- [x] Create packages/ui/package.json
- [x] Create packages/ui/tsconfig.json
- [x] Create packages/ui/tailwind.config.js
- [x] Create packages/ui/src/utils/cn.ts (className utility)
- [x] Create packages/ui/src/hooks/index.ts

**Requirements:** Req 5, Req 16

### Task 2.2: Create Base UI Components ✅
- [x] Create Button component (variants: primary, secondary, outline, ghost)
- [x] Create Input component (with label, error state)
- [x] Create Card component
- [x] Create Badge component
- [x] Create Spinner component
- [x] Create Avatar component

**Requirements:** Req 5, Req 16, Req 20

### Task 2.3: Create Form Components ✅
- [x] Create FormField wrapper component
- [x] Create Select component
- [x] Create Checkbox component
- [x] Create TextArea component

**Requirements:** Req 5, Req 16, Req 20

### Task 2.4: Create Layout Components ✅
- [x] Create Sidebar component (collapsible)
- [x] Create Header component
- [x] Create PageContainer component
- [x] Create Modal component

**Requirements:** Req 5, Req 19, Req 20

### Task 2.5: Create Data Display Components ✅
- [x] Create Table component (with sorting, pagination)
- [x] Create EmptyState component
- [x] Create ErrorBoundary component
- [x] Create Toast/Notification component

**Requirements:** Req 5, Req 11, Req 16

### Task 2.6: Setup i18n Infrastructure ✅
- [x] Create packages/ui/locales/vi.json
- [x] Create packages/ui/locales/en.json
- [x] Create useTranslation hook
- [x] Create TranslationProvider

**Requirements:** Req 22

---

## Phase 3: Auth App ✅

### Task 3.1: Initialize Auth App ✅
- [x] Create apps/auth with Next.js 14 (App Router)
- [x] Configure tsconfig.json with path aliases
- [x] Configure next.config.js
- [x] Create .env.local.example
- [x] Setup Tailwind CSS

**Requirements:** Req 6, Req 8

### Task 3.2: Create Auth Pages ✅
- [x] Create app/layout.tsx (root layout)
- [x] Create app/page.tsx (login page)
- [x] Create app/forgot-password/page.tsx
- [x] Create app/reset-password/page.tsx


**Requirements:** Req 1

### Task 3.3: Implement Login Flow ✅
- [x] Create useLogin hook
- [x] Create LoginForm component
- [x] Implement Firebase Auth signIn
- [x] Implement role-based redirect logic
- [x] Handle login errors with localized messages

**Requirements:** Req 1, Req 2, Req 11

### Task 3.4: Implement Password Reset ✅
- [x] Create useForgotPassword hook
- [x] Create ForgotPasswordForm component
- [x] Implement Firebase sendPasswordResetEmail

**Requirements:** Req 1.6

---

## Phase 4: Admin App ✅

### Task 4.1: Initialize Admin App ✅
- [x] Create apps/admin with Next.js 14 (App Router)
- [x] Configure tsconfig.json with path aliases
- [x] Configure next.config.js
- [x] Create .env.local.example
- [x] Setup Tailwind CSS

**Requirements:** Req 6, Req 8

### Task 4.2: Create Admin Layout ✅
- [x] Create app/layout.tsx (root layout with providers)
- [x] Create app/(dashboard)/layout.tsx (dashboard layout with sidebar)
- [x] Create AdminSidebar component
- [x] Create AdminHeader component
- [x] Implement AuthGuard (admin role check)

**Requirements:** Req 2, Req 3, Req 19

### Task 4.3: Create Dashboard Page ✅
- [x] Create app/(dashboard)/dashboard/page.tsx
- [x] Create DashboardStats component
- [x] Create RecentStudents component
- [x] Implement analytics data fetching

**Requirements:** Req 3.5

### Task 4.4: Create Student Management ✅
- [x] Create app/(dashboard)/students/page.tsx (list)
- [x] Create app/(dashboard)/students/[id]/page.tsx (detail)
- [x] Create app/(dashboard)/students/new/page.tsx (create)
- [x] Create StudentList component
- [x] Create StudentForm component
- [x] Create StudentCard component
- [x] Create useStudents hook
- [x] Create useStudent hook
- [x] Create useCreateStudent hook
- [x] Create useUpdateStudent hook

**Requirements:** Req 3.1, Req 3.2, Req 3.3, Req 3.4

### Task 4.5: Create Course Management ✅
- [x] Create app/(dashboard)/courses/page.tsx (list)
- [x] Create app/(dashboard)/courses/[id]/page.tsx (detail)
- [x] Create app/(dashboard)/courses/new/page.tsx (create)
- [x] Create CourseList component
- [x] Create CourseForm component
- [x] Create LessonEditor component
- [x] Create useCourses hook
- [x] Create useCourse hook

**Requirements:** Req 3

---

## Phase 5: Student App ✅

### Task 5.1: Initialize Student App ✅
- [x] Create apps/student with Next.js 14 (App Router)
- [x] Configure tsconfig.json with path aliases
- [x] Configure next.config.js
- [x] Create .env.local.example
- [x] Setup Tailwind CSS

**Requirements:** Req 6, Req 8

### Task 5.2: Create Student Layout ✅
- [x] Create app/layout.tsx (root layout with providers)
- [x] Create app/(portal)/layout.tsx (portal layout)
- [x] Create StudentSidebar component
- [x] Create StudentHeader component
- [x] Implement AuthGuard (student role check)

**Requirements:** Req 2, Req 4, Req 19


### Task 5.3: Create Student Dashboard ✅
- [x] Create app/(portal)/dashboard/page.tsx
- [x] Create EnrolledCourses component
- [x] Create ProgressOverview component
- [x] Implement dashboard data fetching

**Requirements:** Req 4.1

### Task 5.4: Create Course Viewer ✅
- [x] Create app/(portal)/courses/page.tsx (list)
- [x] Create app/(portal)/courses/[id]/page.tsx (detail)
- [x] Create CourseContent component
- [x] Create LessonViewer component
- [x] Create ProgressTracker component
- [x] Implement lesson completion logic


**Requirements:** Req 4.2, Req 4.3

### Task 5.5: Create Profile Page ✅
- [x] Create app/(portal)/profile/page.tsx
- [x] Create ProfileForm component
- [x] Implement profile update logic


**Requirements:** Req 4.4

---

## Phase 6: Firebase Configuration ✅

### Task 6.1: Setup Firebase Project ✅
- [x] Create firebase/firebase.json
- [x] Create firebase/firestore.rules
- [x] Create firebase/firestore.indexes.json
- [x] Create firebase/.firebaserc

**Requirements:** Req 15, Req 8

### Task 6.2: Implement Security Rules ✅
- [x] Write user collection rules
- [x] Write student collection rules
- [x] Write course collection rules
- [ ] Test rules with Firebase emulator (manual - requires Firebase emulator setup)

**Requirements:** Req 15

---

## Phase 7: Testing & Quality ✅

### Task 7.1: Setup Testing Infrastructure ✅
- [x] Configure Vitest in root
- [x] Setup @testing-library/react
- [x] Create test utilities and mocks
- [x] Configure coverage reporting

**Requirements:** Req 18

### Task 7.2: Write Unit Tests ✅
- [x] Test Zod schemas (valid/invalid inputs)
- [x] Test utility functions
- [x] Test custom hooks
- [x] Test Result type helpers

**Requirements:** Req 18.1, Req 18.2, Req 18.3

### Task 7.3: Write Component Tests ✅
- [x] Test shared UI components
- [x] Test form components
- [x] Test auth flow components

**Requirements:** Req 18.4

---

## Phase 8: Build & Deploy ✅

### Task 8.1: Configure Build Pipeline ✅
- [x] Setup turbo build pipeline
- [x] Configure production builds
- [x] Setup environment variable validation
- [x] Configure bundle analysis

**Requirements:** Req 8, Req 21

### Task 8.2: Setup Firebase Hosting ✅
- [x] Configure hosting targets for each app
- [x] Setup deployment scripts
- [ ] Configure custom domains (manual - requires domain setup in Firebase console)

**Requirements:** Req 8.3

### Task 8.3: Final Quality Checks ✅
- [x] Run full lint check (zero warnings)
- [x] Run full type check (zero errors)
- [x] Run full test suite
- [x] Verify production builds
- [ ] Performance audit (Lighthouse) - manual, requires deployed app
- [ ] Accessibility audit - manual, requires deployed app

**Requirements:** Req 8.1, Req 8.2, Req 12, Req 20, Req 21
