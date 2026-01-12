# Phase 6: Lab Training & Advanced Features

**Thời gian**: 2-3 tuần  
**Mục tiêu**: Giai đoạn Lab và các tính năng nâng cao

---

## Tổng quan

Phase này xây dựng:
- Trang Lab Training với requirements
- Admin setting nội dung động
- Realtime Dashboard
- Handbook PDF viewer (flipbook)

---

## Tasks chi tiết

### 6.1 Trang Lab Training Requirements (Priority: HIGH)

**Mô tả**: Trang hiển thị yêu cầu khi học viên vào giai đoạn Lab

**Subtasks**:
- [ ] Trang Lab Training (`/lab-training`)
- [ ] Hiển thị checklist yêu cầu
- [ ] Trạng thái từng yêu cầu (hoàn thành/chưa)
- [ ] Link hướng dẫn cho mỗi yêu cầu
- [ ] Progress bar tổng thể

**Yêu cầu mẫu**:
- [ ] Tạo Work Email (@company.com)
- [ ] Tạo tài khoản Behance
- [ ] Upload ít nhất 3 dự án lên Behance
- [ ] Hoàn thành profile Behance
- [ ] Tham gia group Discord/Slack

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Lab Training Program                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎉 Chào mừng bạn đến giai đoạn Lab Training!                      │
│                                                                      │
│  Trước khi bắt đầu, hãy hoàn thành các yêu cầu sau:                │
│                                                                      │
│  Tiến độ: 2/5 yêu cầu                                               │
│  ████████████░░░░░░░░░░░░░░░░░░ 40%                                 │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ Tạo Work Email                                                   │
│    Email công việc để liên lạc với đối tác                         │
│    [Đã hoàn thành]                                                  │
│                                                                      │
│  ✓ Tạo tài khoản Behance                                           │
│    Portfolio online để showcase dự án                               │
│    [Đã hoàn thành]                                                  │
│                                                                      │
│  ○ Upload 3 dự án lên Behance                                       │
│    Hiện tại: 1/3 dự án                                              │
│    [Hướng dẫn upload] [Cập nhật]                                   │
│                                                                      │
│  ○ Hoàn thành profile Behance                                       │
│    Avatar, bio, skills, social links                                │
│    [Hướng dẫn] [Đánh dấu hoàn thành]                               │
│                                                                      │
│  ○ Tham gia group Discord                                           │
│    Kết nối với cộng đồng TDC                                       │
│    [Link Discord] [Đánh dấu hoàn thành]                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Schema**:
```typescript
// packages/schemas/src/labRequirement.schema.ts
export const LabRequirementSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  helpUrl: z.string().url().optional(),        // Link hướng dẫn
  order: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  requiresVerification: z.boolean().default(false), // Admin cần verify
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Tiến độ của student
export const StudentLabProgressSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  requirementId: z.string(),
  isCompleted: z.boolean().default(false),
  completedAt: z.date().nullable(),
  verifiedBy: z.string().nullable(),           // Admin đã verify
  notes: z.string().max(500).optional(),
});
```

**Acceptance Criteria**:
- ✓ Hiển thị danh sách yêu cầu
- ✓ Trạng thái từng yêu cầu
- ✓ Đánh dấu hoàn thành
- ✓ Progress bar

---

### 6.2 Admin Setting nội dung trang Lab (Priority: HIGH)

**Mô tả**: Admin cấu hình động nội dung trang Lab

**Subtasks**:
- [ ] CRUD Lab Requirements
- [ ] Sắp xếp thứ tự yêu cầu
- [ ] Bật/tắt từng yêu cầu
- [ ] Cấu hình yêu cầu cần admin verify
- [ ] Preview trang Lab

**UI Admin**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Cấu hình Lab Training                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [+ Thêm yêu cầu mới]                              [Preview]        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ≡ 1. Tạo Work Email                    ✓ Active  [Sửa][Xóa]│    │
│  │ ≡ 2. Tạo tài khoản Behance             ✓ Active  [Sửa][Xóa]│    │
│  │ ≡ 3. Upload 3 dự án                    ✓ Active  [Sửa][Xóa]│    │
│  │ ≡ 4. Hoàn thành profile                ○ Inactive[Sửa][Xóa]│    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ CRUD yêu cầu Lab
- ✓ Sắp xếp thứ tự
- ✓ Bật/tắt yêu cầu
- ✓ Preview

---

### 6.3 Checklist yêu cầu với verification (Priority: MEDIUM)

**Mô tả**: Một số yêu cầu cần admin verify

**Subtasks**:
- [ ] Flag `requiresVerification` cho requirement
- [ ] Student submit → status = pending
- [ ] Admin review và approve/reject
- [ ] Notification cho student

**Flow**:
```
Student đánh dấu hoàn thành
         ↓
    Cần verify?
    ├── Không → Tự động completed
    └── Có → Status = pending
              ↓
         Admin review
         ├── Approve → Completed
         └── Reject → Yêu cầu làm lại
```

**Acceptance Criteria**:
- ✓ Phân biệt yêu cầu cần/không cần verify
- ✓ Admin approve/reject
- ✓ Notification

---

### 6.4 Realtime Dashboard (Priority: MEDIUM)

**Mô tả**: Dashboard admin với số liệu realtime

**Subtasks**:
- [ ] Số học viên đang online (presence)
- [ ] Realtime update khi có thay đổi
- [ ] Chart học viên theo thời gian
- [ ] Activity feed (ai vừa làm gì)

**Implementation - Firebase Presence**:
```typescript
// packages/firebase/src/presence.ts
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { rtdb } from './config';

export function setupPresence(userId: string) {
  const userStatusRef = ref(rtdb, `/status/${userId}`);
  const connectedRef = ref(rtdb, '.info/connected');
  
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      // User is online
      set(userStatusRef, {
        state: 'online',
        lastSeen: serverTimestamp(),
      });
      
      // When disconnected, update status
      onDisconnect(userStatusRef).set({
        state: 'offline',
        lastSeen: serverTimestamp(),
      });
    }
  });
}

export function getOnlineUsers(): Promise<number> {
  // Query users with state = 'online'
}
```

**UI Dashboard**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                                   │
├─────────────┬─────────────┬─────────────┬───────────────────────────┤
│  👥 Tổng    │  🟢 Online  │  📚 Môn học │  ✓ Hoàn thành hôm nay    │
│    150      │     12      │     24      │       5                   │
├─────────────┴─────────────┴─────────────┴───────────────────────────┤
│                                                                      │
│  📊 Học viên online theo giờ                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │     ▄                                                        │    │
│  │   ▄ █ ▄                                    ▄                │    │
│  │ ▄ █ █ █ ▄                              ▄ ▄ █ ▄              │    │
│  │ █ █ █ █ █ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ █ █ █ █ ▄            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│    8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23              │    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔔 Hoạt động gần đây                                               │
│  • Nguyễn Văn A vừa hoàn thành môn Design Fundamentals (2 phút)    │
│  • Trần Thị B vừa submit dự án (5 phút)                            │
│  • Lê Văn C vừa đăng nhập (10 phút)                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Số online realtime
- ✓ Chart theo thời gian
- ✓ Activity feed

---

### 6.5 Handbook PDF Viewer - Flipbook (Priority: MEDIUM)

**Mô tả**: Hiển thị sổ tay học viên dạng sách lật trang

**Subtasks**:
- [ ] Admin upload PDF handbook
- [ ] Lưu PDF vào Firebase Storage
- [ ] Component flipbook viewer
- [ ] Hiển thị ở trang Login
- [ ] Responsive design

**Library Options**:
1. **react-pageflip**: Đơn giản, hiệu ứng đẹp
2. **turn.js**: Classic, nhiều tính năng
3. **PDF.js + custom flip**: Flexible nhưng complex

**Implementation**:
```typescript
// apps/auth/src/components/HandbookViewer.tsx
import { useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';

interface HandbookViewerProps {
  pdfUrl: string;
}

export function HandbookViewer({ pdfUrl }: HandbookViewerProps) {
  const [numPages, setNumPages] = useState(0);
  
  return (
    <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
      <HTMLFlipBook width={400} height={600}>
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="page">
            <Page pageNumber={i + 1} />
          </div>
        ))}
      </HTMLFlipBook>
    </Document>
  );
}
```

**Admin Upload UI**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Cấu hình Handbook                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Handbook hiện tại: handbook_v2.pdf                                 │
│  Cập nhật lần cuối: 15/01/2026                                      │
│                                                                      │
│  [Upload PDF mới]                                                   │
│                                                                      │
│  Preview:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │              [Flipbook Preview]                              │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Admin upload PDF
- ✓ Flipbook hiển thị đẹp
- ✓ Responsive
- ✓ Hiển thị ở trang Login

---

## Firestore/Storage Collections

```
/labRequirements/{requirementId}
  - id, title, description, helpUrl, order
  - isActive, requiresVerification
  - createdAt, updatedAt

/studentLabProgress/{progressId}
  - id, studentId, requirementId
  - isCompleted, completedAt, verifiedBy, notes

/settings/handbook
  - pdfUrl: string (Firebase Storage URL)
  - uploadedAt: timestamp
  - uploadedBy: string

Firebase Realtime Database:
/status/{userId}
  - state: 'online' | 'offline'
  - lastSeen: timestamp

/activityFeed/{activityId}
  - type: 'course_completed' | 'project_submitted' | 'login'
  - userId, userName
  - details
  - timestamp
```

---

## Checklist hoàn thành Phase 6

- [ ] Trang Lab Training với checklist
- [ ] Admin CRUD yêu cầu Lab
- [ ] Verification flow cho yêu cầu
- [ ] Realtime online count
- [ ] Activity feed
- [ ] Handbook PDF upload
- [ ] Flipbook viewer
- [ ] Responsive design

---

## Notes

- Realtime features cần Firebase Realtime Database (không phải Firestore)
- Flipbook có thể heavy, cân nhắc lazy load
- Activity feed nên có limit và pagination
- Handbook PDF nên có size limit (< 10MB)
