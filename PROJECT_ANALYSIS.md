# The Design Council - Phân tích Dự án

## 📊 Tổng quan

**The Design Council** là hệ thống Learning Management System (LMS) dành cho trường đào tạo thiết kế, được xây dựng theo kiến trúc monorepo với 3 ứng dụng chính và 5 shared packages.

### Trạng thái hiện tại
- ✅ Môi trường development đã được cài đặt hoàn chỉnh
- ✅ Node.js v24.13.0, pnpm v9.15.0, Firebase CLI v15.2.1
- ✅ 708 packages đã được cài đặt
- ✅ TypeScript typecheck: PASS (0 errors)
- ✅ Environment variables đã được cấu hình

---

## 🏗️ Kiến trúc Monorepo

### 1. Applications (apps/)

#### **Auth App** (Port 3000)
- **Mục đích**: Trang đăng nhập với Handbook viewer
- **Tech**: Next.js 14 (Static Export)
- **Features**:
  - Login/Logout với Firebase Auth
  - Forgot Password / Reset Password
  - Handbook PDF Flipbook viewer
  - Redirect theo role (Admin/Student)

#### **Admin Dashboard** (Port 3001)
- **Mục đích**: Quản trị hệ thống
- **Tech**: Next.js 14 (SSR), TanStack Query, DnD Kit
- **Features**:
  - Dashboard với realtime statistics
  - CRUD: Học kỳ, Môn học, Học viên, Chuyên ngành
  - Tracking tiến độ học viên
  - Import học viên từ Excel/CSV
  - Email management (Gmail API)
  - Lab requirements management
  - Media library

#### **Student Portal** (Port 3002)
- **Mục đích**: Cổng thông tin học viên
- **Tech**: Next.js 14 (SSR), TanStack Query
- **Features**:
  - Learning Tree visualization
  - Danh sách môn học theo học kỳ
  - Xem bài học qua Genially embed
  - Submit dự án (Google Drive links)
  - Chọn chuyên ngành
  - Lab training checklist
  - Notifications

### 2. Shared Packages (packages/)

#### **@tdc/ui**
- Shared UI components (Button, Input, Card, Modal, etc.)
- Flipbook component cho Handbook
- Tailwind CSS styling
- Reusable hooks

#### **@tdc/schemas**
- Zod schemas cho validation
- Type-safe data models
- 24 schema files covering all entities:
  - User, Student, Course, Semester
  - Progress, Project, Tracking
  - Major, Lab Requirements
  - Email, Notifications, Media

#### **@tdc/firebase**
- Firebase SDK wrapper
- Repository pattern cho Firestore
- Auth helpers
- Storage utilities
- Error mapping

#### **@tdc/types**
- Shared TypeScript types
- Result<T> type pattern
- AppError class
- Common utility types

#### **@tdc/config**
- Shared configurations:
  - ESLint config
  - TypeScript config
  - Tailwind preset
  - Prettier config

---

## 🗄️ Data Model (Firestore Collections)

### Core Collections

```
/users/{userId}
  - email, role, displayName, isActive, lastLoginAt

/students/{studentId}
  - userId, email, displayName, phone
  - currentSemesterId, selectedMajorId
  - enrolledCourses[], progress{}
  - enrolledAt, isActive

/semesters/{semesterId}
  - name, description, order
  - startDate, endDate, isActive

/courses/{courseId}
  - title, description, semesterId
  - geniallyUrl, thumbnailUrl
  - requiredSessions (default: 10)
  - requiredProjects (default: 1)
  - order, isActive

/progress/{progressId}
  - studentId, courseId
  - completedSessions, status
  - projects[], lastUpdated

/majors/{majorId}
  - name, description, color
  - startFromSemester, isActive

/majorCourses/{majorCourseId}
  - majorId, courseId, order
```

### Supporting Collections

```
/projectSubmissions/{submissionId}
  - studentId, courseId, projectNumber
  - submissionUrl, submissionType
  - submittedAt, status

/trackingLogs/{logId}
  - adminId, studentId, courseId
  - action, changes, timestamp

/notifications/{notificationId}
  - userId, type, title, message
  - isRead, readAt

/labRequirements/{requirementId}
  - title, description, order
  - isRequired, isActive

/studentLabProgress/{progressId}
  - studentId, requirementId
  - status, completedAt, notes

/settings/{settingId}
  - handbook: { pdfUrl, uploadedAt }
  - emailSettings: { ... }
  - loginBackground: { ... }
```

---

## 🔒 Security Model

### Firestore Rules
- **Admin**: Full access to all collections
- **Student**: 
  - Read own data only
  - Can submit projects
  - Can update own progress (limited fields)
  - Can mark lab requirements complete
- **Public**: 
  - Handbook settings (for login page)
  - No write access

### Authentication Flow
1. User logs in via Auth App
2. Firebase Auth validates credentials
3. Fetch user role from `/users/{uid}`
4. Redirect based on role:
   - `admin` → Admin Dashboard
   - `student` → Student Portal

---

## 🎯 Development Phases

### ✅ Phase 1: Foundation & Core Auth (COMPLETED)
- Firebase setup
- Auth flow (Login/Logout/Reset)
- Role-based routing
- Protected routes

### ✅ Phase 2: Admin - Quản lý cơ bản (COMPLETED)
- CRUD Học kỳ
- CRUD Môn học
- CRUD Học viên
- Import Excel/CSV
- Dashboard statistics

### ✅ Phase 3: Student Portal - Core Features (COMPLETED)
- Danh sách môn học
- Chi tiết môn học (Genially embed)
- Upload kết quả dự án
- Tiến độ học tập
- Learning Tree

### ✅ Phase 4: Tracking & Progress (COMPLETED)
- Bảng tracking học viên
- Cập nhật số buổi/dự án
- Logic pass môn (10 buổi + đủ dự án)
- Quick Track - bulk pass
- Tracking logs (audit trail)

### ✅ Phase 5: Chuyên ngành & Phân ngành (COMPLETED)
- CRUD Chuyên ngành
- Gắn môn học vào chuyên ngành
- Mapping học kỳ phân ngành
- UI chọn chuyên ngành
- Hiển thị môn theo ngành

### ✅ Phase 6: Lab Training & Advanced (COMPLETED)
- Trang Lab Training requirements
- Admin setting nội dung Lab
- Checklist yêu cầu
- Realtime Dashboard
- Handbook PDF flipbook

### 🚧 Phase 7: Email & Settings (IN PROGRESS)
- Google OAuth cho Gmail
- Email template editor
- Gửi email thông tin đăng nhập
- Bulk email
- Trang hướng dẫn

### 📋 Phase 8: Polish & Deploy (PLANNED)
- UI/UX polish
- Performance optimization
- Error handling
- E2E testing
- Production deployment

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query v5, React Context
- **DnD**: @dnd-kit (for course ordering)
- **Excel**: xlsx (for import/export)

### Backend
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting (3 sites)

### Development
- **Monorepo**: Turborepo + pnpm workspaces
- **Testing**: Vitest + Testing Library + fast-check
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

---

## 📦 Package Dependencies

### Auth App
- firebase, react-hook-form, zod
- Minimal dependencies (static export)

### Admin App
- @tanstack/react-query (data fetching)
- @dnd-kit/* (drag & drop)
- xlsx (Excel import/export)
- uuid (ID generation)

### Student App
- @tanstack/react-query (data fetching)
- Similar to Admin but lighter

### All Apps
- Shared: @tdc/ui, @tdc/schemas, @tdc/firebase, @tdc/types
- Next.js 14.1.0, React 18.2.0

---

## 🚀 Available Commands

### Development
```bash
pnpm dev                    # Run all apps
pnpm dev --filter @tdc/auth    # Auth only
pnpm dev --filter @tdc/admin   # Admin only
pnpm dev --filter @tdc/student # Student only
```

### Build & Test
```bash
pnpm build                  # Build all
pnpm typecheck              # Type check all
pnpm lint                   # Lint all
pnpm test                   # Run tests (watch)
pnpm test:run               # Run tests once
pnpm test:coverage          # Coverage report
```

### Validation
```bash
node scripts/validate-env.js           # Check env vars
node scripts/validate-env.js --strict  # Strict mode
node scripts/validate-security.js      # Security check
node scripts/validate-rules.js         # Firebase rules
```

### Deployment
```bash
./scripts/deploy.sh all        # Deploy everything
./scripts/deploy.sh auth       # Deploy auth only
./scripts/deploy.sh admin      # Deploy admin only
./scripts/deploy.sh student    # Deploy student only
./scripts/deploy.sh rules      # Deploy rules only
./scripts/deploy.sh --dry-run  # Preview deployment
```

---

## 📁 File Structure Highlights

### Auth App Structure
```
apps/auth/src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Login page
│   ├── forgot-password/   # Password reset
│   └── reset-password/    # Reset confirmation
├── components/
│   ├── LoginForm.tsx      # Login form
│   ├── HandbookViewer.tsx # PDF flipbook
│   └── LoginBackground.tsx # Dynamic background
├── hooks/
│   ├── useLogin.ts        # Login logic
│   └── useForgotPassword.ts
└── lib/
    └── authRedirect.ts    # Role-based redirect
```

### Admin App Structure
```
apps/admin/src/
├── app/(dashboard)/       # Dashboard routes
│   ├── students/         # Student management
│   ├── courses/          # Course management
│   ├── semesters/        # Semester management
│   ├── majors/           # Major management
│   ├── tracking/         # Progress tracking
│   ├── lab/              # Lab requirements
│   ├── settings/         # System settings
│   └── help/             # Help documentation
├── components/
│   ├── layout/           # Sidebar, Header
│   └── features/         # Feature components
└── hooks/                # 20+ custom hooks
```

### Student App Structure
```
apps/student/src/
├── app/(portal)/         # Portal routes
│   ├── courses/         # Course list
│   ├── progress/        # Learning tree
│   ├── major/           # Major selection
│   ├── lab/             # Lab checklist
│   └── profile/         # Student profile
├── components/
│   ├── layout/          # Navigation
│   └── features/        # Feature components
└── hooks/               # 15+ custom hooks
```

---

## 🔑 Key Features Implemented

### Admin Features
✅ Dashboard với realtime stats (online users, enrollments)
✅ CRUD đầy đủ cho: Users, Students, Courses, Semesters, Majors
✅ Import học viên từ Excel/CSV với validation
✅ Tracking tiến độ chi tiết (sessions, projects)
✅ Quick Track - bulk pass students
✅ Drag & drop sắp xếp courses
✅ Lab requirements management
✅ Media library với upload
✅ Handbook PDF upload
✅ Activity feed (audit logs)

### Student Features
✅ Learning Tree visualization
✅ Course list với progress indicators
✅ Genially embed cho bài học
✅ Project submission (Google Drive links)
✅ Major selection workflow
✅ Lab requirements checklist
✅ Notifications system
✅ Profile management

### Auth Features
✅ Email/Password login
✅ Forgot password flow
✅ Role-based redirect
✅ Handbook flipbook viewer
✅ Dynamic login background

---

## 🎨 UI/UX Patterns

### Design System
- **Colors**: Tailwind default palette
- **Typography**: System fonts
- **Components**: Consistent button, input, card styles
- **Icons**: Emoji-based (no icon library)
- **Responsive**: Mobile-first approach

### Layout Patterns
- **Admin**: Sidebar navigation + main content
- **Student**: Top navigation + content area
- **Auth**: Split screen (form + handbook)

### State Management
- **Server State**: TanStack Query (caching, refetching)
- **Client State**: React Context (auth, theme)
- **Form State**: React Hook Form (validation)

---

## 🔍 Code Quality

### TypeScript
- ✅ Strict mode enabled
- ✅ No implicit any
- ✅ All schemas type-safe with Zod
- ✅ 0 type errors

### Testing
- Unit tests: Vitest
- Integration tests: Testing Library
- Property tests: fast-check
- Coverage: Available via `pnpm test:coverage`

### Linting
- ESLint with Next.js config
- Prettier for formatting
- Consistent code style across monorepo

---

## 🚨 Known Issues & TODOs

### Environment
- ⚠️ 2 files `.evn.local` (typo) cần xóa trong apps/auth và apps/student

### Phase 7 (Email) - Chưa hoàn thành
- [ ] Google OAuth integration
- [ ] Email template editor
- [ ] Send email functionality
- [ ] Bulk email to students

### Phase 8 (Polish) - Chưa bắt đầu
- [ ] Performance optimization
- [ ] E2E testing
- [ ] Production deployment
- [ ] Documentation completion

---

## 📚 Documentation

### Available Docs
- ✅ PROJECT_OVERVIEW.md - Chi tiết phases và features
- ✅ DEPLOYMENT_CHECKLIST.md - Hướng dẫn deploy
- ✅ Steering files - Coding standards và patterns
- ✅ README.md - Getting started guide

### In-App Help
- ✅ Admin help page với topics
- ✅ Contextual tooltips
- ✅ Error messages rõ ràng

---

## 🎯 Next Steps

### Immediate (Tuần này)
1. Xóa các file `.evn.local` (typo)
2. Test toàn bộ features hiện có
3. Fix bugs nếu phát hiện

### Short-term (1-2 tuần)
1. Hoàn thành Phase 7 (Email)
2. Bắt đầu Phase 8 (Polish)
3. Performance optimization

### Long-term (1-2 tháng)
1. Production deployment
2. User acceptance testing
3. Training cho admin users
4. Go live!

---

## 📊 Project Statistics

- **Total Files**: ~200+ TypeScript/React files
- **Total Lines**: ~15,000+ lines of code
- **Packages**: 708 npm packages
- **Apps**: 3 Next.js applications
- **Shared Packages**: 5 workspace packages
- **Firestore Collections**: 15+ collections
- **Custom Hooks**: 35+ hooks
- **Schemas**: 24 Zod schemas
- **Components**: 100+ React components

---

## 🏆 Strengths

1. **Type Safety**: Full TypeScript với Zod validation
2. **Monorepo**: Code sharing hiệu quả
3. **Scalability**: Repository pattern, modular architecture
4. **Security**: Firestore rules chặt chẽ
5. **DX**: Hot reload, type checking, linting
6. **Testing**: Comprehensive test setup
7. **Documentation**: Well-documented code và processes

---

## 💡 Recommendations

### Performance
- Implement code splitting cho admin app
- Optimize bundle size (hiện tại OK)
- Add loading skeletons
- Implement virtual scrolling cho large lists

### Security
- Add rate limiting cho login
- Implement CSRF protection
- Add input sanitization
- Regular security audits

### UX
- Add keyboard shortcuts
- Improve error messages
- Add undo/redo functionality
- Implement offline support

### DevOps
- Setup CI/CD pipeline
- Add automated testing
- Implement staging environment
- Add monitoring và logging

---

*Phân tích được tạo: 2026-01-13*
*Phiên bản: 1.0*
