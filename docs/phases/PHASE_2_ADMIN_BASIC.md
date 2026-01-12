# Phase 2: Admin - Quản lý cơ bản

**Thời gian**: 3-4 tuần  
**Mục tiêu**: Admin có thể quản lý học kỳ, môn học, học viên

---

## Tổng quan

Phase này xây dựng các tính năng CRUD cơ bản cho Admin Dashboard:
- Quản lý Học kỳ (Semester)
- Quản lý Môn học (Course)
- Quản lý Học viên (Student)
- Import học viên hàng loạt

---

## Tasks chi tiết

### 2.1 CRUD Học kỳ - Semester (Priority: HIGH)

**Mô tả**: Admin tạo, sửa, xóa các học kỳ

**Subtasks**:
- [ ] Schema cho Semester
- [ ] Repository functions: create, update, delete, getAll, getById
- [ ] Trang danh sách học kỳ (`/semesters`)
- [ ] Form tạo/sửa học kỳ
- [ ] Xác nhận trước khi xóa
- [ ] Sắp xếp thứ tự học kỳ (drag & drop hoặc input order)

**Schema**:
```typescript
// packages/schemas/src/semester.schema.ts
export const SemesterSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),        // "Học kỳ Dự bị", "Học kỳ 1"
  description: z.string().max(500).optional(),
  order: z.number().int().nonnegative(),    // Thứ tự hiển thị
  isActive: z.boolean().default(true),
  requiresMajorSelection: z.boolean().default(false), // HK3 trở đi
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Semester = z.infer<typeof SemesterSchema>;
```

**UI Components**:
```
apps/admin/src/
├── app/(dashboard)/semesters/
│   ├── page.tsx              # Danh sách học kỳ
│   ├── new/page.tsx          # Tạo mới
│   └── [id]/page.tsx         # Chi tiết/Sửa
├── components/features/semester-management/
│   ├── SemesterList.tsx
│   ├── SemesterForm.tsx
│   ├── SemesterCard.tsx
│   └── index.ts
└── hooks/
    └── useSemesters.ts
```

**Acceptance Criteria**:
- ✓ Hiển thị danh sách học kỳ theo thứ tự
- ✓ Tạo học kỳ mới với validation
- ✓ Sửa thông tin học kỳ
- ✓ Xóa học kỳ (có confirm)
- ✓ Thay đổi thứ tự học kỳ

---

### 2.2 CRUD Môn học - Course (Priority: HIGH)

**Mô tả**: Admin tạo, sửa, xóa môn học và gắn vào học kỳ

**Subtasks**:
- [ ] Schema cho Course
- [ ] Repository functions
- [ ] Trang danh sách môn học (`/courses`)
- [ ] Filter môn học theo học kỳ
- [ ] Form tạo/sửa môn học với link Genially
- [ ] Gắn môn học vào học kỳ
- [ ] Sắp xếp thứ tự môn trong học kỳ

**Schema**:
```typescript
// packages/schemas/src/course.schema.ts
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  semesterId: z.string(),                    // Thuộc học kỳ nào
  geniallyUrl: z.string().url().optional(),  // Link Genially để học
  thumbnailUrl: z.string().url().optional(), // Ảnh thumbnail
  order: z.number().int().nonnegative(),     // Thứ tự trong học kỳ
  requiredSessions: z.number().int().positive().default(10), // Số buổi yêu cầu
  requiredProjects: z.number().int().nonnegative().default(1), // Số dự án yêu cầu
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Course = z.infer<typeof CourseSchema>;
```

**UI Components**:
```
apps/admin/src/
├── app/(dashboard)/courses/
│   ├── page.tsx              # Danh sách môn học
│   ├── new/page.tsx          # Tạo mới
│   └── [id]/page.tsx         # Chi tiết/Sửa
├── components/features/course-management/
│   ├── CourseList.tsx
│   ├── CourseForm.tsx
│   ├── CourseCard.tsx
│   ├── CourseSemesterFilter.tsx
│   └── index.ts
└── hooks/
    └── useCourses.ts
```

**Form Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | text | ✓ | Tên môn học |
| description | textarea | | Mô tả môn học |
| semesterId | select | ✓ | Chọn học kỳ |
| geniallyUrl | url | | Link Genially |
| thumbnailUrl | url/upload | | Ảnh đại diện |
| requiredSessions | number | ✓ | Số buổi (default: 10) |
| requiredProjects | number | ✓ | Số dự án (default: 1) |
| order | number | ✓ | Thứ tự hiển thị |

**Acceptance Criteria**:
- ✓ Hiển thị danh sách môn học
- ✓ Filter theo học kỳ
- ✓ Tạo môn học với đầy đủ thông tin
- ✓ Validate URL Genially
- ✓ Sửa/Xóa môn học
- ✓ Sắp xếp thứ tự môn

---

### 2.3 Gắn môn học vào học kỳ (Priority: HIGH)

**Mô tả**: Quản lý mối quan hệ giữa môn học và học kỳ

**Subtasks**:
- [ ] Trong form Course, dropdown chọn Semester
- [ ] Trong trang Semester detail, hiển thị danh sách môn
- [ ] Cho phép thêm môn vào học kỳ từ trang Semester
- [ ] Drag & drop sắp xếp môn trong học kỳ

**UI Flow**:
```
Trang Semester Detail
├── Thông tin học kỳ
├── Danh sách môn học trong học kỳ
│   ├── [Drag to reorder]
│   ├── Course 1 - [Edit] [Remove]
│   ├── Course 2 - [Edit] [Remove]
│   └── Course 3 - [Edit] [Remove]
└── [+ Thêm môn học]
```

**Acceptance Criteria**:
- ✓ Môn học thuộc đúng học kỳ
- ✓ Có thể thay đổi học kỳ của môn
- ✓ Xem danh sách môn theo học kỳ

---

### 2.4 CRUD Học viên - Student (Priority: HIGH)

**Mô tả**: Admin quản lý tài khoản học viên

**Subtasks**:
- [ ] Schema cho Student (extends User)
- [ ] Repository functions
- [ ] Trang danh sách học viên (`/students`)
- [ ] Search và filter học viên
- [ ] Form tạo học viên (tạo cả Firebase Auth + Firestore)
- [ ] Form sửa thông tin học viên
- [ ] Vô hiệu hóa / Kích hoạt tài khoản
- [ ] Xem chi tiết học viên

**Schema**:
```typescript
// packages/schemas/src/student.schema.ts
export const StudentSchema = z.object({
  id: z.string(),
  userId: z.string(),                        // Reference to users collection
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  phone: z.string().optional(),
  currentSemesterId: z.string().optional(),  // Học kỳ hiện tại
  selectedMajorId: z.string().optional(),    // Chuyên ngành đã chọn
  enrolledAt: z.date(),                      // Ngày nhập học
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Student = z.infer<typeof StudentSchema>;

// Input để tạo student mới
export const CreateStudentInputSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),    // Nếu không có, generate random
});
```

**UI Components**:
```
apps/admin/src/
├── app/(dashboard)/students/
│   ├── page.tsx              # Danh sách học viên
│   ├── new/page.tsx          # Tạo mới
│   └── [id]/page.tsx         # Chi tiết/Sửa
├── components/features/student-management/
│   ├── StudentList.tsx
│   ├── StudentForm.tsx
│   ├── StudentCard.tsx
│   ├── StudentSearch.tsx
│   ├── StudentFilters.tsx
│   └── index.ts
└── hooks/
    └── useStudents.ts
```

**Tạo Student Flow**:
```
1. Admin nhập email, tên, (password optional)
2. System tạo Firebase Auth account
3. System tạo User document (role: student)
4. System tạo Student document
5. (Optional) Gửi email thông tin đăng nhập
```

**Acceptance Criteria**:
- ✓ Hiển thị danh sách học viên
- ✓ Search theo tên/email
- ✓ Tạo học viên mới (tạo cả Auth + Firestore)
- ✓ Sửa thông tin học viên
- ✓ Vô hiệu hóa tài khoản
- ✓ Xem chi tiết học viên

---

### 2.5 Import học viên từ Excel/CSV (Priority: MEDIUM)

**Mô tả**: Import hàng loạt học viên từ file

**Subtasks**:
- [ ] UI upload file (Excel/CSV)
- [ ] Parse file và validate data
- [ ] Preview danh sách trước khi import
- [ ] Hiển thị lỗi validation (nếu có)
- [ ] Bulk create students
- [ ] Progress indicator
- [ ] Report kết quả (success/failed)

**File Format**:
```csv
name,email
Nguyễn Văn A,a@example.com
Trần Thị B,b@example.com
```

**UI Flow**:
```
1. [Upload File] button
2. Parse & Validate
3. Preview Table:
   | # | Name | Email | Status |
   | 1 | Nguyễn Văn A | a@example.com | ✓ Valid |
   | 2 | Trần Thị B | b@example.com | ✓ Valid |
   | 3 | Invalid | invalid-email | ✗ Invalid email |
4. [Import X valid records] button
5. Progress: Importing... 5/10
6. Result: 
   - Success: 8
   - Failed: 2 (show reasons)
```

**Components**:
```
apps/admin/src/components/features/student-management/
├── StudentImport.tsx
├── StudentImportPreview.tsx
├── StudentImportProgress.tsx
└── StudentImportResult.tsx
```

**Acceptance Criteria**:
- ✓ Upload Excel/CSV file
- ✓ Validate data trước khi import
- ✓ Preview với status
- ✓ Import với progress
- ✓ Report kết quả

---

### 2.6 Dashboard cơ bản (Priority: MEDIUM)

**Mô tả**: Trang tổng quan với số liệu cơ bản

**Subtasks**:
- [ ] Card: Tổng số học viên
- [ ] Card: Tổng số môn học
- [ ] Card: Tổng số học kỳ
- [ ] Card: Học viên mới trong tháng
- [ ] Danh sách học viên mới nhất
- [ ] Quick links đến các trang quản lý

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard                       │
├─────────────┬─────────────┬─────────────┬───────────────┤
│  📚 Học kỳ  │  📖 Môn học │  👥 Học viên │  🆕 Mới tháng │
│     5       │     24      │    150      │      12       │
├─────────────┴─────────────┴─────────────┴───────────────┤
│                                                          │
│  Học viên mới nhất                                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Nguyễn Văn A - a@example.com - 2 ngày trước     │   │
│  │ Trần Thị B - b@example.com - 3 ngày trước       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Quick Actions                                           │
│  [+ Thêm học viên] [+ Thêm môn học] [Import Excel]     │
└─────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Hiển thị số liệu tổng quan
- ✓ Danh sách học viên mới
- ✓ Quick actions

---

## Firestore Collections

```
/semesters/{semesterId}
  - id, name, description, order, isActive, requiresMajorSelection
  - createdAt, updatedAt

/courses/{courseId}
  - id, title, description, semesterId, geniallyUrl, thumbnailUrl
  - order, requiredSessions, requiredProjects, isActive
  - createdAt, updatedAt

/students/{studentId}
  - id visitorId, email, displayName, phone
  - currentSemesterId, selectedMajorId, enrolledAt, isActive
  - createdAt, updatedAt
```

---

## API/Repository Functions

```typescript
// Semester
semesterRepository.create(data)
semesterRepository.update(id, data)
semesterRepository.delete(id)
semesterRepository.findAll()
semesterRepository.findById(id)
semesterRepository.reorder(ids[])

// Course
courseRepository.create(data)
courseRepository.update(id, data)
courseRepository.delete(id)
courseRepository.findAll()
courseRepository.findById(id)
courseRepository.findBySemester(semesterId)
courseRepository.reorder(semesterId, courseIds[])

// Student
studentRepository.create(data)  // Also creates Firebase Auth
studentRepository.update(id, data)
studentRepository.deactivate(id)
studentRepository.activate(id)
studentRepository.findAll(filters)
studentRepository.findById(id)
studentRepository.bulkCreate(students[])
```

---

## Checklist hoàn thành Phase 2

- [ ] CRUD Học kỳ hoạt động
- [ ] CRUD Môn học hoạt động
- [ ] Môn học gắn được vào học kỳ
- [ ] CRUD Học viên hoạt động
- [ ] Import học viên từ Excel/CSV
- [ ] Dashboard hiển thị số liệu
- [ ] Tất cả forms có validation
- [ ] Error handling đầy đủ
- [ ] Loading states

---

## Notes

- Khi tạo student, cần tạo cả Firebase Auth account
- Cân nhắc dùng Firebase Admin SDK (server-side) để tạo user
- Import hàng loạt nên có rate limiting để tránh quota issues
- Nên có soft delete thay vì hard delete
