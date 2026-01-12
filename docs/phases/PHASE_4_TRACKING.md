# Phase 4: Tracking & Progress

**Thời gian**: 2-3 tuần  
**Mục tiêu**: Admin tracking tiến độ học viên

---

## Tổng quan

Phase này xây dựng hệ thống tracking để Admin:
- Theo dõi tiến độ học viên theo môn
- Cập nhật số buổi/dự án hoàn thành
- Pass/Fail học viên
- Mở khóa môn/học kỳ tiếp theo

---

## Tasks chi tiết

### 4.1 Bảng tracking học viên theo môn (Priority: HIGH)

**Mô tả**: Admin xem và quản lý tiến độ học viên

**Subtasks**:
- [ ] Trang tracking (`/tracking`)
- [ ] Filter theo học kỳ và môn học
- [ ] Bảng danh sách học viên với tiến độ
- [ ] Columns: Tên, Email, Số buổi, Số dự án, Link kết quả, Trạng thái
- [ ] Sort theo các columns
- [ ] Search học viên
- [ ] Pagination

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Tracking Học viên                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Học kỳ: [Học kỳ 1 ▼]    Môn học: [Design Fundamentals ▼]          │
│  Tìm kiếm: [________________]                                       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ # │ Học viên        │ Buổi  │ Dự án │ Link kết quả    │ Trạng thái │
├───┼─────────────────┼───────┼───────┼─────────────────┼────────────┤
│ 1 │ Nguyễn Văn A    │ 10/10 │ 2/2   │ [View]          │ ✓ Pass     │
│ 2 │ Trần Thị B      │ 8/10  │ 1/2   │ [View]          │ 🔄 Đang học│
│ 3 │ Lê Văn C        │ 10/10 │ 2/2   │ [View]          │ ⏳ Chờ duyệt│
│ 4 │ Phạm Thị D      │ 5/10  │ 0/2   │ -               │ 🔄 Đang học│
├───┴─────────────────┴───────┴───────┴─────────────────┴────────────┤
│                                              [1] [2] [3] ... [10]   │
└─────────────────────────────────────────────────────────────────────┘
```

**Components**:
```
apps/admin/src/
├── app/(dashboard)/tracking/
│   └── page.tsx
├── components/features/tracking/
│   ├── TrackingTable.tsx
│   ├── TrackingFilters.tsx
│   ├── TrackingRow.tsx
│   ├── TrackingActions.tsx
│   └── index.ts
└── hooks/
    └── useTracking.ts
```

**Acceptance Criteria**:
- ✓ Bảng tracking hiển thị đầy đủ thông tin
- ✓ Filter theo học kỳ/môn
- ✓ Search học viên
- ✓ Pagination hoạt động

---

### 4.2 Cập nhật số buổi/dự án hoàn thành (Priority: HIGH)

**Mô tả**: Admin cập nhật tiến độ thủ công

**Subtasks**:
- [ ] Inline edit số buổi hoàn thành
- [ ] Inline edit số dự án hoàn thành
- [ ] Thêm/sửa link kết quả dự án
- [ ] Auto-save khi thay đổi
- [ ] Validation (không vượt quá yêu cầu)
- [ ] History log thay đổi (optional)

**UI - Inline Edit**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Trần Thị B │ [8 ▼]/10 │ [1 ▼]/2 │ [+ Thêm link] │ 🔄 Đang học      │
└─────────────────────────────────────────────────────────────────────┘
                  ↓ Click để edit
┌─────────────────────────────────────────────────────────────────────┐
│ Trần Thị B │ [10▼]/10 │ [2 ▼]/2 │ [Link 1][Link 2] │ ⏳ Chờ duyệt │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Edit số buổi inline
- ✓ Edit số dự án inline
- ✓ Thêm link kết quả
- ✓ Auto-save

---

### 4.3 Logic pass môn (Priority: HIGH)

**Mô tả**: Điều kiện để học viên pass môn

**Điều kiện Pass**:
```
Pass môn = Đủ buổi + Đủ dự án + Có link kết quả

Cụ thể:
- completedSessions >= requiredSessions (10/10)
- projectsSubmitted >= requiredProjects (2/2)
- Có ít nhất 1 link kết quả dự án
```

**Subtasks**:
- [ ] Function kiểm tra điều kiện pass
- [ ] Auto-detect khi đủ điều kiện → status = 'pending_approval'
- [ ] Button "Duyệt Pass" cho admin
- [ ] Button "Từ chối" với lý do
- [ ] Notification cho học viên khi được duyệt

**Status Flow**:
```
not_started → in_progress → pending_approval → completed
                                    ↓
                               rejected (với lý do)
```

**Implementation**:
```typescript
function checkPassCondition(
  progress: StudentProgress,
  course: Course
): { canPass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (progress.completedSessions < course.requiredSessions) {
    reasons.push(`Chưa đủ buổi: ${progress.completedSessions}/${course.requiredSessions}`);
  }
  
  if (progress.projectsSubmitted < course.requiredProjects) {
    reasons.push(`Chưa đủ dự án: ${progress.projectsSubmitted}/${course.requiredProjects}`);
  }
  
  // Check có link kết quả không
  // ...
  
  return {
    canPass: reasons.length === 0,
    reasons,
  };
}
```

**Acceptance Criteria**:
- ✓ Tự động detect đủ điều kiện
- ✓ Admin duyệt/từ chối
- ✓ Hiển thị lý do nếu chưa đủ

---

### 4.4 Quick Track - Bulk Pass (Priority: MEDIUM)

**Mô tả**: Admin pass nhanh nhiều học viên cùng lúc

**Subtasks**:
- [ ] Tab "Quick Track" trong trang tracking
- [ ] Checkbox chọn nhiều học viên
- [ ] Select all / Deselect all
- [ ] Button "Pass tất cả đã chọn"
- [ ] Confirm dialog trước khi pass
- [ ] Progress indicator khi processing
- [ ] Report kết quả

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Tracking] [Quick Track]                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Môn học: [Design Fundamentals ▼]                                   │
│                                                                      │
│  Hiển thị: Học viên đủ điều kiện pass (chưa được duyệt)            │
│                                                                      │
│  [☑ Chọn tất cả]                          [Pass X học viên đã chọn] │
├─────────────────────────────────────────────────────────────────────┤
│ ☑ │ Học viên        │ Buổi  │ Dự án │ Link kết quả                 │
├───┼─────────────────┼───────┼───────┼──────────────────────────────┤
│ ☑ │ Nguyễn Văn A    │ 10/10 │ 2/2   │ ✓ Có                         │
│ ☑ │ Lê Văn C        │ 10/10 │ 2/2   │ ✓ Có                         │
│ ☐ │ Hoàng Thị E     │ 10/10 │ 2/2   │ ✓ Có                         │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Chọn nhiều học viên
- ✓ Bulk pass hoạt động
- ✓ Confirm trước khi pass
- ✓ Report kết quả

---

### 4.5 Mở khóa môn/học kỳ tiếp theo (Priority: HIGH)

**Mô tả**: Tự động mở khóa khi hoàn thành

**Logic mở khóa**:
```
Mở môn tiếp theo:
- Khi pass môn hiện tại
- Môn tiếp theo theo order trong học kỳ

Mở học kỳ tiếp theo:
- Khi pass TẤT CẢ môn trong học kỳ hiện tại
- Học kỳ tiếp theo theo order
```

**Subtasks**:
- [ ] Function kiểm tra điều kiện mở khóa
- [ ] Trigger khi pass môn
- [ ] Cập nhật status môn tiếp theo: locked → not_started
- [ ] Cập nhật currentSemesterId của student nếu cần
- [ ] Notification cho học viên

**Implementation**:
```typescript
async function unlockNextCourse(studentId: string, completedCourseId: string) {
  // 1. Lấy thông tin môn vừa hoàn thành
  const completedCourse = await getCourse(completedCourseId);
  
  // 2. Tìm môn tiếp theo trong cùng học kỳ
  const nextCourse = await getNextCourse(completedCourse.semesterId, completedCourse.order);
  
  if (nextCourse) {
    // 3. Mở khóa môn tiếp theo
    await updateProgress(studentId, nextCourse.id, { status: 'not_started' });
  } else {
    // 4. Đã hết môn trong học kỳ, check mở học kỳ tiếp
    await checkUnlockNextSemester(studentId, completedCourse.semesterId);
  }
}

async function checkUnlockNextSemester(studentId: string, semesterId: string) {
  // 1. Kiểm tra tất cả môn trong học kỳ đã completed chưa
  const allCompleted = await checkAllCoursesCompleted(studentId, semesterId);
  
  if (allCompleted) {
    // 2. Lấy học kỳ tiếp theo
    const nextSemester = await getNextSemester(semesterId);
    
    if (nextSemester) {
      // 3. Cập nhật currentSemesterId
      await updateStudent(studentId, { currentSemesterId: nextSemester.id });
      
      // 4. Mở khóa môn đầu tiên của học kỳ mới
      const firstCourse = await getFirstCourse(nextSemester.id);
      await updateProgress(studentId, firstCourse.id, { status: 'not_started' });
    }
  }
}
```

**Acceptance Criteria**:
- ✓ Tự động mở môn tiếp theo khi pass
- ✓ Tự động mở học kỳ tiếp theo khi hoàn thành tất cả môn
- ✓ Student thấy môn/học kỳ mới được mở

---

## Firestore Updates

```
/progress/{progressId}
  + status: 'not_started' | 'in_progress' | 'pending_approval' | 'completed' | 'rejected'
  + rejectionReason: string (optional)
  + approvedAt: timestamp (optional)
  + approvedBy: string (admin userId)

/trackingLogs/{logId}  (optional - for audit)
  - studentId
  - courseId
  - action: 'update_sessions' | 'update_projects' | 'approve' | 'reject'
  - previousValue
  - newValue
  - performedBy: admin userId
  - performedAt: timestamp
```

---

## Checklist hoàn thành Phase 4

- [ ] Bảng tracking hiển thị đầy đủ
- [ ] Filter và search hoạt động
- [ ] Inline edit số buổi/dự án
- [ ] Logic pass môn đúng
- [ ] Admin duyệt/từ chối
- [ ] Quick Track bulk pass
- [ ] Tự động mở khóa môn tiếp theo
- [ ] Tự động mở khóa học kỳ tiếp theo
- [ ] Notification cho học viên

---

## Notes

- Tracking là tính năng core, cần test kỹ
- Cân nhắc thêm audit log cho compliance
- Quick Track giúp admin tiết kiệm thời gian
- Unlock logic cần handle edge cases (môn cuối, học kỳ cuối)
