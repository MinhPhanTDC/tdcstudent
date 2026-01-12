# Design Document

## Overview

Thiết kế kiến trúc cho The Design Council Webapp - hệ thống quản lý học viên với 3 ứng dụng: Auth App, Admin App, và Student App. Sử dụng Turborepo monorepo với shared packages và Firebase backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TURBOREPO MONOREPO                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │    Auth App     │  │   Admin App     │  │  Student App    │              │
│  │   (Next.js)     │  │   (Next.js)     │  │   (Next.js)     │              │
│  │   Port: 3000    │  │   Port: 3001    │  │   Port: 3002    │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│           └────────────────────┼────────────────────┘                        │
│                                │                                             │
│  ┌─────────────────────────────┴─────────────────────────────┐              │
│  │                     SHARED PACKAGES                        │              │
│  ├───────────┬───────────┬───────────┬───────────┬──────────┤              │
│  │  @tdc/ui  │@tdc/schemas│@tdc/firebase│@tdc/types│@tdc/config│             │
│  │ Components│Zod Schemas│ Firebase SDK│  Types   │  Configs  │             │
│  └───────────┴───────────┴─────┬─────┴───────────┴──────────┘              │
│                                │                                             │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      FIREBASE           │
                    ├─────────────────────────┤
                    │  ┌─────────────────┐    │
                    │  │  Firebase Auth  │    │
                    │  └─────────────────┘    │
                    │  ┌─────────────────┐    │
                    │  │   Firestore     │    │
                    │  └─────────────────┘    │
                    │  ┌─────────────────┐    │
                    │  │ Firebase Hosting│    │
                    │  └─────────────────┘    │
                    └─────────────────────────┘
```

## Component Design

### 1. Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Login Page  │────▶│ Firebase Auth│────▶│  Get User    │
│  (Auth App)  │     │   signIn()   │     │  Role from   │
└──────────────┘     └──────────────┘     │  Firestore   │
                                          └──────┬───────┘
                                                 │
                     ┌───────────────────────────┼───────────────────────────┐
                     │                           │                           │
                     ▼                           ▼                           ▼
              ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
              │ role: admin  │           │role: student │           │ Invalid Role │
              │  Redirect to │           │  Redirect to │           │ Show Error   │
              │  Admin App   │           │ Student App  │           │              │
              └──────────────┘           └──────────────┘           └──────────────┘
```

### 2. Shared UI Components (@tdc/ui)

| Component | Description | Props |
|-----------|-------------|-------|
| Button | Primary action button | variant, size, disabled, loading, onClick |
| Input | Text input with validation | type, label, error, placeholder |
| Card | Content container | title, children, footer |
| Modal | Dialog overlay | isOpen, onClose, title, children |
| Table | Data table with pagination | columns, data, pagination, onSort |
| Sidebar | Navigation sidebar | items, collapsed, onToggle |
| Avatar | User avatar | src, name, size |
| Badge | Status indicator | variant, children |
| Spinner | Loading indicator | size |
| Toast | Notification message | type, message, duration |

### 3. Data Models (Firestore Collections)

#### Users Collection (`/users/{userId}`)
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'student';
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Students Collection (`/students/{studentId}`)
```typescript
interface Student {
  id: string;
  userId: string;           // Reference to users collection
  enrolledCourses: string[]; // Array of course IDs
  progress: Record<string, number>; // courseId -> percentage
  createdAt: Date;
  updatedAt: Date;
}
```

#### Courses Collection (`/courses/{courseId}`)
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  lessons: Lesson[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number; // minutes
  order: number;
}
```

## API Design

### Result Type Pattern

```typescript
type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### Repository Pattern

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Component     │────▶│   Custom Hook   │────▶│   Repository    │
│   (UI Layer)    │     │  (useStudents)  │     │ (studentRepo)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │    Firestore    │
                                                │   (Database)    │
                                                └─────────────────┘
```

### Error Handling Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Firebase Error  │────▶│ mapFirebaseError│────▶│    AppError     │
│ (auth/user-not- │     │    (mapper)     │     │ (USER_NOT_FOUND)│
│     found)      │     └─────────────────┘     └────────┬────────┘
└─────────────────┘                                      │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Error Message  │
                                                │ (Localized UI)  │
                                                └─────────────────┘
```

## State Management Strategy

| State Type | Solution | Example |
|------------|----------|---------|
| Local UI State | useState | Modal open/close, form inputs |
| Complex Local State | useReducer | Multi-step form wizard |
| Shared App State | React Context | Auth state, theme, locale |
| Server Cache | TanStack Query | Student list, course data |
| Form State | react-hook-form | Login form, student form |

## Routing Structure

### Auth App (apps/auth)
```
/                 → Login page
/forgot-password  → Password reset
/reset-password   → Password reset confirmation
```

### Admin App (apps/admin)
```
/                 → Dashboard (redirect to /dashboard)
/dashboard        → Analytics overview
/students         → Student list
/students/[id]    → Student detail
/students/new     → Create student
/courses          → Course list
/courses/[id]     → Course detail
/courses/new      → Create course
/settings         → Admin settings
```

### Student App (apps/student)
```
/                 → Dashboard (redirect to /dashboard)
/dashboard        → My courses overview
/courses          → Enrolled courses
/courses/[id]     → Course detail & lessons
/progress         → Learning progress
/profile          → Profile settings
```

## Security Design

### Firebase Security Rules Strategy

```javascript
// Firestore Rules Structure
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuth() { return request.auth != null; }
    function isAdmin() { return isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'; }
    function isOwner(userId) { return isAuth() && request.auth.uid == userId; }
    
    // Users: read own, admin read/write all
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isAdmin();
    }
    
    // Students: read own, admin read/write all
    match /students/{studentId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow write: if isAdmin();
      allow update: if isOwner(resource.data.userId) && onlyUpdating(['progress']);
    }
    
    // Courses: authenticated read, admin write
    match /courses/{courseId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }
  }
}
```

## Performance Optimization

### Code Splitting Strategy
- Route-based splitting (Next.js automatic)
- Component lazy loading for modals and heavy components
- Dynamic imports for admin-only features

### Caching Strategy
- TanStack Query với staleTime: 5 minutes cho list data
- Firestore offline persistence enabled
- Next.js ISR cho static content

### Bundle Optimization
- Tree shaking với ES modules
- Shared chunks cho common dependencies
- Image optimization với next/image

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768px - 1023px | Collapsible sidebar |
| Desktop | >= 1024px | Full sidebar, multi-column |

## i18n Structure

```
packages/
└── ui/
    └── locales/
        ├── vi.json    # Vietnamese (default)
        └── en.json    # English
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 3.x |
| UI Components | Custom + Radix UI primitives |
| Forms | react-hook-form + Zod |
| Data Fetching | TanStack Query v5 |
| Auth | Firebase Auth |
| Database | Firestore |
| Hosting | Firebase Hosting |
| Monorepo | Turborepo |
| Package Manager | pnpm |
| Testing | Vitest + Testing Library |
| Linting | ESLint + Prettier |
