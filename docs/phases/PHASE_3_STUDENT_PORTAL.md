# Phase 3: Student Portal - Core Features

**Thời gian**: 3-4 tuần  
**Mục tiêu**: Học viên xem và học các môn

---

## Tổng quan

Phase này xây dựng các tính năng chính cho Student Portal:
- Xem danh sách học kỳ và môn học
- Học qua Genially embed
- Upload kết quả dự án
- Hiển thị tiến độ học tập
- Learning Tree visualization

---

## Tasks chi tiết

### 3.1 Trang danh sách học kỳ & môn học (Priority: HIGH)

**Mô tả**: Học viên xem các học kỳ và môn học của mình

**Subtasks**:
- [ ] Trang danh sách học kỳ (`/semesters`)
- [ ] Hiển thị học kỳ đã mở khóa vs chưa mở
- [ ] Trang danh sách môn học theo học kỳ (`/semesters/[id]`)
- [ ] Trạng thái môn: Hoàn thành / Đang học / Chưa mở
- [ ] Progress indicator cho mỗi môn
- [ ] Responsive design

**UI Layout - Danh sách học kỳ**:
```
┌─────────────────────────────────────────────────────────┐
│                    Chương trình học                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ 📚 Học kỳ Dự bị │  │ 📚 Học kỳ 1     │               │
│  │ ✓ Hoàn thành    │  │ 🔄 Đang học     │               │
│  │ 4/4 môn         │  │ 2/5 môn         │               │
│  │ [Xem chi tiết]  │  │ [Tiếp tục học]  │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ 🔒 Học kỳ 2     │  │ 🔒 Học kỳ 3     │               │
│  │ Chưa mở khóa    │  │ Chưa mở khóa    │               │
│  │                 │  │ (Chọn chuyên    │               │
│  │                 │  │  ngành)         │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**UI Layout - Danh sách môn học**:
```
┌─────────────────────────────────────────────────────────┐
│  ← Quay lại          Học kỳ 1                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 1. Design Fundamentals                    ✓ 100% │    │
│  │    10/10 buổi • 2/2 dự án                        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 2. Color Theory                           🔄 60% │    │
│  │    6/10 buổi • 1/2 dự án                         │    │
│  │    [Tiếp tục học]                                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 3. Typography                             🔒 0%  │    │
│  │    Hoàn thành môn trước để mở khóa              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Components**:
```
apps/student/src/
├── app/(portal)/
│   ├── semesters/
│   │   ├── page.tsx              # Danh sách học kỳ
│   │   └── [id]/page.tsx         # Môn học trong học kỳ
│   └── courses/
│       └── [id]/page.tsx         # Chi tiết môn học
├── components/features/
│   ├── semester/
│   │   ├── SemesterList.tsx
│   │   ├── SemesterCard.tsx
│   │   └── index.ts
│   └── course/
│       ├── CourseList.tsx
│       ├── CourseCard.tsx
│       ├── CourseProgress.tsx
│       └── index.ts
└── hooks/
    ├── useMySemesters.ts
    └── useMyCourses.ts
```

**Acceptance Criteria**:
- ✓ Hiển thị danh sách học kỳ với trạng thái
- ✓ Hiển thị môn học theo học kỳ
- ✓ Trạng thái môn học rõ ràng
- ✓ Progress bar cho mỗi môn

---

### 3.2 Trang chi tiết môn học - Embed Genially (Priority: HIGH)

**Mô tả**: Học viên học môn qua Genially embed

**Subtasks**:
- [ ] Trang chi tiết môn học (`/courses/[id]`)
- [ ] Embed Genially iframe
- [ ] Responsive iframe (full width, proper height)
- [ ] Fallback khi không có Genially URL
- [ ] Thông tin môn học: tên, mô tả, yêu cầu
- [ ] Navigation: môn trước / môn sau
- [ ] Button upload dự án

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  ← Quay lại HK1       Design Fundamentals               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Tiến độ: 6/10 buổi • 1/2 dự án                         │
│  ████████████░░░░░░░░ 60%                               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │                                                  │    │
│  │              GENIALLY EMBED                      │    │
│  │              (iframe)                            │    │
│  │                                                  │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📁 Kết quả dự án của bạn                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Dự án 1: [Link Drive] ✓ Đã nộp                  │    │
│  │ Dự án 2: [Chưa nộp] [+ Upload]                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [← Môn trước]                        [Môn tiếp theo →] │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Genially Embed Component**:
```typescript
// apps/student/src/components/features/course/GeniallyEmbed.tsx
interface GeniallyEmbedProps {
  url: string;
  title: string;
}

export function GeniallyEmbed({ url, title }: GeniallyEmbedProps) {
  // Convert Genially URL to embed URL if needed
  const embedUrl = convertToEmbedUrl(url);
  
  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 rounded-lg"
        allowFullScreen
      />
    </div>
  );
}
```

**Acceptance Criteria**:
- ✓ Genially embed hiển thị đúng
- ✓ Responsive trên mọi màn hình
- ✓ Thông tin môn học đầy đủ
- ✓ Navigation giữa các môn

---

### 3.3 Upload kết quả dự án (Priority: HIGH)

**Mô tả**: Học viên submit link/file kết quả dự án

**Subtasks**:
- [ ] Schema cho Project submission
- [ ] Form upload dự án (link Google Drive hoặc file)
- [ ] Validate URL (Google Drive, Behance, etc.)
- [ ] Hiển thị danh sách dự án đã nộp
- [ ] Cho phép sửa/xóa submission
- [ ] Notification khi submit thành công

**Schema**:
```typescript
// packages/schemas/src/project.schema.ts
export const ProjectSubmissionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  courseId: z.string(),
  projectNumber: z.number().int().positive(),  // Dự án số mấy
  title: z.string().max(200).optional(),
  submissionUrl: z.string().url(),             // Link Drive/Behance
  submissionType: z.enum(['drive', 'behance', 'other']),
  notes: z.string().max(500).optional(),
  submittedAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectSubmission = z.infer<typeof ProjectSubmissionSchema>;
```

**UI Components**:
```
apps/student/src/components/features/project/
├── ProjectList.tsx           # Danh sách dự án của môn
├── ProjectSubmitForm.tsx     # Form submit dự án
├── ProjectCard.tsx           # Card hiển thị 1 dự án
└── index.ts
```

**Form Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| submissionUrl | url | ✓ | Link Google Drive/Behance |
| title | text | | Tên dự án |
| notes | textarea | | Ghi chú |

**Acceptance Criteria**:
- ✓ Submit link dự án thành công
- ✓ Validate URL hợp lệ
- ✓ Hiển thị dự án đã nộp
- ✓ Sửa/Xóa submission

---

### 3.4 Hiển thị tiến độ học tập (Priority: MEDIUM)

**Mô tả**: Dashboard tiến độ cá nhân của học viên

**Subtasks**:
- [ ] Trang Dashboard học viên (`/dashboard`)
- [ ] Tổng quan tiến độ: % hoàn thành chương trình
- [ ] Tiến độ theo học kỳ
- [ ] Môn đang học hiện tại
- [ ] Thống kê: số môn hoàn thành, số dự án đã nộp
- [ ] Upcoming: môn tiếp theo cần học

**Schema cho Progress**:
```typescript
// packages/schemas/src/progress.schema.ts
export const StudentProgressSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  courseId: z.string(),
  completedSessions: z.number().int().nonnegative().default(0),
  projectsSubmitted: z.number().int().nonnegative().default(0),
  status: z.enum(['not_started', 'in_progress', 'completed', 'locked']),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StudentProgress = z.infer<typeof StudentProgressSchema>;
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Xin chào, Nguyễn Văn A! 👋                             │
│                                                          │
│  Tiến độ tổng thể                                       │
│  ████████████████░░░░░░░░░░░░░░ 45%                     │
│  9/20 môn hoàn thành                                    │
│                                                          │
├─────────────┬─────────────┬─────────────────────────────┤
│  📚 Học kỳ  │  ✓ Hoàn thành│  📁 Dự án                  │
│  HK 1       │  9 môn       │  15 đã nộp                 │
├─────────────┴─────────────┴─────────────────────────────┤
│                                                          │
│  🔄 Đang học                                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Color Theory - HK1                        60%   │    │
│  │ [Tiếp tục học]                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  📌 Tiếp theo                                           │
│  • Typography (sau khi hoàn thành Color Theory)         │
│  • Layout Design                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Dashboard hiển thị tiến độ tổng thể
- ✓ Thống kê số môn/dự án
- ✓ Môn đang học và tiếp theo

---

### 3.5 Learning Tree Visualization (Priority: MEDIUM)

**Mô tả**: Hiển thị dạng cây tiến trình học tập

**Subtasks**:
- [ ] Trang Learning Tree (`/learning-tree`)
- [ ] Visualize các giai đoạn học tập
- [ ] Highlight vị trí hiện tại
- [ ] Các node: completed / current / locked
- [ ] Animation khi hover/click
- [ ] Responsive design

**UI Concept**:
```
                    🎓 Tốt nghiệp
                         │
              ┌──────────┴──────────┐
              │                     │
         Lab Training          Internship
              │                     │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Graphic Design    UI/UX         Motion
         │               │               │
         └───────────────┴───────────────┘
                         │
                    Học kỳ 3
                   (Chọn ngành)
                         │
                    Học kỳ 2
                         │
                    Học kỳ 1
                         │
                  Học kỳ Dự bị ← [Bạn đang ở đây]
                         │
                    🚀 Bắt đầu
```

**Implementation Options**:
1. **CSS/SVG thuần**: Đơn giản, performance tốt
2. **React Flow**: Library chuyên về flowchart
3. **D3.js**: Flexible nhưng complex
4. **Framer Motion**: Animation đẹp

**Recommendation**: Dùng CSS/SVG cho MVP, upgrade sau nếu cần

**Acceptance Criteria**:
- ✓ Hiển thị cây tiến trình
- ✓ Highlight vị trí hiện tại
- ✓ Responsive
- ✓ Interactive (click để xem chi tiết)

---

## Firestore Collections

```
/progress/{progressId}
  - id, studentId, courseId
  - completedSessions, projectsSubmitted
  - status: 'not_started' | 'in_progress' | 'completed' | 'locked'
  - completedAt, createdAt, updatedAt

/projectSubmissions/{submissionId}
  - id, studentId, courseId, projectNumber
  - title, submissionUrl, submissionType, notes
  - submittedAt, updatedAt
```

---

## Hooks cần tạo

```typescript
// apps/student/src/hooks/

// Lấy danh sách học kỳ của student
useMySemesters()

// Lấy môn học theo học kỳ
useMyCourses(semesterId)

// Lấy chi tiết môn học
useCourseDetail(courseId)

// Lấy progress của student
useMyProgress()

// Lấy progress theo môn
useCourseProgress(courseId)

// Submit dự án
useSubmitProject()

// Lấy dự án đã submit
useMyProjects(courseId)
```

---

## Checklist hoàn thành Phase 3

- [ ] Danh sách học kỳ hiển thị đúng
- [ ] Danh sách môn học theo học kỳ
- [ ] Trạng thái môn học (locked/in_progress/completed)
- [ ] Genially embed hoạt động
- [ ] Upload dự án thành công
- [ ] Dashboard tiến độ
- [ ] Learning Tree visualization
- [ ] Responsive trên mobile
- [ ] Loading states
- [ ] Error handling

---

## Notes

- Genially URL cần convert sang embed format
- Progress được tính từ data trong Firestore
- Môn locked khi môn trước chưa complete
- Learning Tree có thể làm đơn giản trước, nâng cấp sau
