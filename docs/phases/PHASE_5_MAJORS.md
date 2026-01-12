# Phase 5: Chuyên ngành & Phân ngành

**Thời gian**: 2-3 tuần  
**Mục tiêu**: Hệ thống phân ngành cho học viên

---

## Tổng quan

Phase này xây dựng hệ thống chuyên ngành:
- Admin tạo và quản lý chuyên ngành
- Gắn môn học vào chuyên ngành
- Học viên chọn chuyên ngành ở học kỳ được chỉ định
- Hiển thị môn học theo ngành đã chọn

---

## Tasks chi tiết

### 5.1 CRUD Chuyên ngành (Priority: HIGH)

**Mô tả**: Admin tạo, sửa, xóa chuyên ngành

**Subtasks**:
- [ ] Schema cho Major (Chuyên ngành)
- [ ] Repository functions
- [ ] Trang danh sách chuyên ngành (`/majors`)
- [ ] Form tạo/sửa chuyên ngành
- [ ] Xóa chuyên ngành (soft delete)

**Schema**:
```typescript
// packages/schemas/src/major.schema.ts
export const MajorSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),           // "Graphic Design", "UI/UX"
  description: z.string().max(1000).optional(),
  thumbnailUrl: z.string().url().optional(),
  color: z.string().optional(),                // Màu đại diện
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Major = z.infer<typeof MajorSchema>;
```

**Các chuyên ngành mẫu**:
- Graphic Design
- UI/UX Design
- Motion Graphics
- 3D Design
- Illustration

**UI Components**:
```
apps/admin/src/
├── app/(dashboard)/majors/
│   ├── page.tsx              # Danh sách chuyên ngành
│   ├── new/page.tsx          # Tạo mới
│   └── [id]/page.tsx         # Chi tiết/Sửa
├── components/features/major-management/
│   ├── MajorList.tsx
│   ├── MajorForm.tsx
│   ├── MajorCard.tsx
│   └── index.ts
└── hooks/
    └── useMajors.ts
```

**Acceptance Criteria**:
- ✓ CRUD chuyên ngành hoạt động
- ✓ Validation đầy đủ
- ✓ Soft delete

---

### 5.2 Gắn môn học vào chuyên ngành (Priority: HIGH)

**Mô tả**: Mỗi chuyên ngành có danh sách môn học riêng

**Subtasks**:
- [ ] Schema cho MajorCourse (môn học của chuyên ngành)
- [ ] Trang quản lý môn học theo chuyên ngành
- [ ] Thêm môn vào chuyên ngành
- [ ] Sắp xếp thứ tự môn trong chuyên ngành
- [ ] Xóa môn khỏi chuyên ngành

**Schema**:
```typescript
// packages/schemas/src/majorCourse.schema.ts
export const MajorCourseSchema = z.object({
  id: z.string(),
  majorId: z.string(),
  courseId: z.string(),
  order: z.number().int().nonnegative(),
  isRequired: z.boolean().default(true),      // Môn bắt buộc hay tự chọn
  createdAt: z.date(),
});

export type MajorCourse = z.infer<typeof MajorCourseSchema>;
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Quay lại          Graphic Design                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Thông tin chuyên ngành                                             │
│  Tên: Graphic Design                                                │
│  Mô tả: Chuyên ngành thiết kế đồ họa...                            │
│  [Sửa thông tin]                                                    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Môn học trong chuyên ngành                    [+ Thêm môn học]     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ≡ 1. Advanced Typography          Bắt buộc    [Sửa] [Xóa]  │    │
│  │ ≡ 2. Brand Identity Design        Bắt buộc    [Sửa] [Xóa]  │    │
│  │ ≡ 3. Print Design                 Tự chọn     [Sửa] [Xóa]  │    │
│  │ ≡ 4. Packaging Design             Tự chọn     [Sửa] [Xóa]  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  (Kéo thả để sắp xếp thứ tự)                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Thêm môn vào chuyên ngành
- ✓ Sắp xếp thứ tự (drag & drop)
- ✓ Đánh dấu môn bắt buộc/tự chọn
- ✓ Xóa môn khỏi chuyên ngành

---

### 5.3 Mapping học kỳ bắt đầu phân ngành (Priority: HIGH)

**Mô tả**: Cấu hình học kỳ nào yêu cầu chọn chuyên ngành

**Subtasks**:
- [ ] Field `requiresMajorSelection` trong Semester schema
- [ ] UI toggle trong form Semester
- [ ] Khi student đến học kỳ này → hiển thị UI chọn ngành
- [ ] Validation: phải chọn ngành trước khi học tiếp

**Logic**:
```
Học kỳ Dự bị → Học kỳ 1 → Học kỳ 2 → [Học kỳ 3: Chọn ngành] → ...
                                            ↓
                                    Bắt buộc chọn chuyên ngành
                                    trước khi mở môn học
```

**Implementation**:
```typescript
// Khi student hoàn thành học kỳ trước học kỳ phân ngành
async function checkMajorSelectionRequired(studentId: string, nextSemesterId: string) {
  const semester = await getSemester(nextSemesterId);
  
  if (semester.requiresMajorSelection) {
    const student = await getStudent(studentId);
    
    if (!student.selectedMajorId) {
      // Yêu cầu chọn ngành trước
      return { requiresMajorSelection: true };
    }
  }
  
  return { requiresMajorSelection: false };
}
```

**Acceptance Criteria**:
- ✓ Admin cấu hình học kỳ yêu cầu chọn ngành
- ✓ Student bị chặn nếu chưa chọn ngành
- ✓ Hiển thị thông báo yêu cầu chọn ngành

---

### 5.4 UI chọn chuyên ngành cho học viên (Priority: HIGH)

**Mô tả**: Học viên chọn chuyên ngành khi đến học kỳ phân ngành

**Subtasks**:
- [ ] Trang chọn chuyên ngành (`/select-major`)
- [ ] Hiển thị danh sách chuyên ngành với mô tả
- [ ] Preview môn học của mỗi ngành
- [ ] Confirm trước khi chọn (không đổi được sau khi chọn)
- [ ] Lưu selectedMajorId vào student document

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Chọn Chuyên ngành                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎉 Chúc mừng bạn đã hoàn thành Học kỳ 2!                          │
│                                                                      │
│  Bây giờ, hãy chọn chuyên ngành bạn muốn theo đuổi:                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  🎨 Graphic Design                                          │    │
│  │  Thiết kế đồ họa, branding, print design...                │    │
│  │  8 môn học • [Xem chi tiết]                                │    │
│  │                                              [Chọn ngành]   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  💻 UI/UX Design                                            │    │
│  │  Thiết kế giao diện, trải nghiệm người dùng...             │    │
│  │  10 môn học • [Xem chi tiết]                               │    │
│  │                                              [Chọn ngành]   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  🎬 Motion Graphics                                         │    │
│  │  Animation, video editing, visual effects...               │    │
│  │  9 môn học • [Xem chi tiết]                                │    │
│  │                                              [Chọn ngành]   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ⚠️ Lưu ý: Sau khi chọn, bạn không thể thay đổi chuyên ngành.     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Confirm Dialog**:
```
┌─────────────────────────────────────────────┐
│  Xác nhận chọn chuyên ngành                 │
├─────────────────────────────────────────────┤
│                                              │
│  Bạn đã chọn: Graphic Design                │
│                                              │
│  ⚠️ Sau khi xác nhận, bạn không thể        │
│  thay đổi chuyên ngành.                     │
│                                              │
│  Bạn có chắc chắn?                          │
│                                              │
│  [Hủy]                    [Xác nhận chọn]   │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Hiển thị danh sách chuyên ngành
- ✓ Xem preview môn học
- ✓ Confirm trước khi chọn
- ✓ Lưu lựa chọn vào database
- ✓ Không cho đổi sau khi chọn

---

### 5.5 Hiển thị môn theo ngành đã chọn (Priority: HIGH)

**Mô tả**: Sau khi chọn ngành, hiển thị môn học của ngành đó

**Subtasks**:
- [ ] Filter môn học theo selectedMajorId
- [ ] Trang chuyên ngành của student (`/my-major`)
- [ ] Hiển thị tiến độ môn học chuyên ngành
- [ ] Tích hợp vào Learning Tree

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Chuyên ngành: Graphic Design                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tiến độ: 2/8 môn hoàn thành                                        │
│  ████████░░░░░░░░░░░░░░░░░░░░░░ 25%                                 │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Môn học chuyên ngành                                               │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 1. Advanced Typography                              ✓ 100%  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 2. Brand Identity Design                            ✓ 100%  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 3. Print Design                                     🔄 40%  │    │
│  │    [Tiếp tục học]                                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 4. Packaging Design                                 🔒 0%   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Hiển thị môn học theo ngành đã chọn
- ✓ Tiến độ môn học chuyên ngành
- ✓ Tích hợp vào navigation

---

## Firestore Collections

```
/majors/{majorId}
  - id, name, description, thumbnailUrl, color
  - isActive, createdAt, updatedAt

/majorCourses/{majorCourseId}
  - id, majorId, courseId, order, isRequired
  - createdAt

/students/{studentId}
  + selectedMajorId: string (nullable)
  + majorSelectedAt: timestamp (nullable)
```

---

## Checklist hoàn thành Phase 5

- [ ] CRUD chuyên ngành hoạt động
- [ ] Gắn môn học vào chuyên ngành
- [ ] Cấu hình học kỳ yêu cầu chọn ngành
- [ ] UI chọn ngành cho học viên
- [ ] Confirm và lưu lựa chọn
- [ ] Hiển thị môn theo ngành đã chọn
- [ ] Tích hợp vào Learning Tree
- [ ] Không cho đổi ngành sau khi chọn

---

## Notes

- Chọn ngành là quyết định quan trọng, cần confirm kỹ
- Có thể thêm tính năng "tư vấn chọn ngành" sau
- Admin có thể override selectedMajorId nếu cần (edge case)
- Môn học chuyên ngành có thể overlap với môn học kỳ thường
