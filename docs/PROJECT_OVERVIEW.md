# The Design Council - Learning Management System

## Tổng quan dự án

The Design Council (TDC) là hệ thống quản lý học tập dành cho trường đào tạo thiết kế, bao gồm 3 ứng dụng chính:

1. **Auth App** - Trang đăng nhập với Handbook
2. **Student Portal** - Cổng thông tin học viên
3. **Admin Dashboard** - Quản trị hệ thống

---

## 1. Auth App (Trang đăng nhập)

### Tính năng chính:
- Đăng nhập bằng email/password
- Quên mật khẩu / Reset password
- **Handbook Viewer**: Hiển thị sổ tay học viên dạng flipbook (PDF được upload từ Admin)

### UI/UX:
- Layout 2 cột: Form đăng nhập | Handbook flipbook
- Handbook có thể lật trang như sách thật
- Responsive: Mobile hiển thị handbook dạng modal

---

## 2. Student Portal (Cổng học viên)

### 2.1 Trang Tổng thể chương trình (Learning Tree)
- **Hiển thị dạng cây tiến trình học tập**
- Visualize các giai đoạn: Dự bị → Học kỳ 1-2 → Phân ngành → Lab/Internship
- Highlight vị trí hiện tại của học viên trên cây
- Các node đã hoàn thành / đang học / chưa mở khóa

### 2.2 Trang Danh sách môn học theo học kỳ
- Hiển thị các môn trong học kỳ hiện tại
- Trạng thái môn: Đã hoàn thành ✓ | Đang học | Chưa mở
- Filter theo học kỳ

### 2.3 Trang Chi tiết môn học
- **Nhúng link Genially** để học
- Thứ tự môn học từ đầu đến cuối
- **Upload kết quả dự án**: Cho phép học viên submit link/file khi hoàn thành
- Hiển thị tiến độ: Số buổi đã học / Số dự án đã nộp

### 2.4 Trang Lab Training & Internship
- Trang thông báo yêu cầu khi vào Lab
- Checklist yêu cầu:
  - [ ] Tạo Work Email
  - [ ] Tạo Behance Portfolio
  - [ ] Hoàn thành các yêu cầu khác (admin setting)
- Nội dung trang được admin cấu hình động

### 2.5 Trang Chuyên ngành (sau khi chọn)
- Hiển thị sau khi học viên đăng ký chuyên ngành
- Danh sách môn học theo chuyên ngành đã chọn
- Tương tự trang môn học nhưng filter theo ngành

---

## 3. Admin Dashboard

### 3.1 Dashboard tổng quan
- **Realtime statistics**:
  - Tổng số học viên
  - Học viên đang online
  - Học viên theo học kỳ
  - Tỷ lệ hoàn thành môn học
- Charts và graphs trực quan

### 3.2 Quản lý Học kỳ & Môn học
- **CRUD Học kỳ**: Tạo/Sửa/Xóa học kỳ
- **CRUD Môn học**:
  - Tên môn, mô tả
  - Link Genially
  - Số buổi yêu cầu (mặc định 10)
  - Số dự án yêu cầu
  - Thứ tự hiển thị
- Gắn môn học vào học kỳ
- Drag & drop sắp xếp thứ tự

### 3.3 Tracking học viên
- **Bảng tracking chi tiết**:
  - Danh sách học viên theo môn
  - Số buổi hoàn thành (x/10)
  - Số dự án hoàn thành
  - Link kết quả dự án (Google Drive)
  - Trạng thái: Hoàn thành tín chỉ / Chưa hoàn thành

- **Điều kiện pass môn**:
  - ✓ Đủ 10/10 buổi
  - ✓ Đủ số dự án yêu cầu
  - ✓ Có đủ link kết quả

- **Quick Track** (Sub-tab):
  - Chọn nhiều học viên
  - Bulk action: Pass qua môn tiếp theo
  - Dành cho tracking nhanh

### 3.4 Quản lý Chuyên ngành
- **CRUD Chuyên ngành**: Tạo các ngành (VD: Graphic Design, UI/UX, Motion...)
- Gắn môn học vào chuyên ngành
- **Mapping học kỳ**: Chọn học kỳ nào bắt đầu yêu cầu chọn ngành
- Cấu hình điều kiện phân ngành

### 3.5 Quản lý Học viên
- **CRUD học viên**: Tạo/Sửa/Xóa tài khoản
- **Import hàng loạt**:
  - Upload file Excel/CSV (Tên, Email)
  - Tự động tạo tài khoản với password chung
  - Preview trước khi import
- **Gửi email thông tin đăng nhập**:
  - Chọn 1 hoặc nhiều học viên
  - Gửi email chứa thông tin tài khoản
- Xem lịch sử học tập của từng học viên

### 3.6 Settings
- **Đổi mật khẩu admin**
- **Cấu hình Google OAuth 2.0**: Liên kết để gửi mail qua Gmail API
- **Email Template**:
  - Editor HTML cho email
  - Các biến hỗ trợ: `{name}`, `{email}`, `{password}`, `{timestamp}`, `{login_url}`
- **Upload Handbook PDF**: Cập nhật sổ tay học viên
- **Hướng dẫn sử dụng**: Trang help cho admin

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GIAI ĐOẠN 1                                  │
│                    Học kỳ Dự bị + HK 1-2                            │
├─────────────────────────────────────────────────────────────────────┤
│  Đăng nhập → Mở tất cả môn HK đầu → Hoàn thành tín chỉ → Next HK   │
│                                                                      │
│  Điều kiện kích hoạt HK tiếp: Hoàn thành TẤT CẢ tín chỉ trong HK   │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         GIAI ĐOẠN 2                                  │
│                   Học kỳ 3 - Phân ngành                              │
├─────────────────────────────────────────────────────────────────────┤
│  Chọn chuyên ngành → Hiển thị môn theo ngành → Hoàn thành → Next   │
│                                                                      │
│  Mỗi ngành một trang riêng với các môn chuyên biệt                  │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         GIAI ĐOẠN 3                                  │
│                 Lab Training & Internship                            │
├─────────────────────────────────────────────────────────────────────┤
│  Yêu cầu: Tạo Behance Portfolio (bắt buộc)                          │
│  Mỗi dự án cần mentor đồng hành để show trên Behance                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Kế hoạch phát triển theo Phase

### Phase 1: Foundation & Core Auth (2-3 tuần)

**Mục tiêu**: Setup infrastructure và authentication cơ bản

| Task | Mô tả | Priority |
|------|-------|----------|
| 1.1 | Setup Firebase project thật (không dùng test) | High |
| 1.2 | Hoàn thiện Auth flow: Login/Logout/Reset password | High |
| 1.3 | Phân quyền Admin vs Student | High |
| 1.4 | Redirect sau login theo role | High |
| 1.5 | Protected routes cho cả 2 portal | High |

**Deliverables**:
- ✓ Đăng nhập/đăng xuất hoạt động
- ✓ Admin vào Admin Dashboard
- ✓ Student vào Student Portal
- ✓ Chưa login → redirect về Auth

---

### Phase 2: Admin - Quản lý cơ bản (3-4 tuần)

**Mục tiêu**: Admin có thể quản lý học kỳ, môn học, học viên

| Task | Mô tả | Priority |
|------|-------|----------|
| 2.1 | CRUD Học kỳ (Semester) | High |
| 2.2 | CRUD Môn học (Course) với link Genially | High |
| 2.3 | Gắn môn học vào học kỳ | High |
| 2.4 | CRUD Học viên (Student) | High |
| 2.5 | Import học viên từ Excel/CSV | Medium |
| 2.6 | Dashboard cơ bản (số liệu tĩnh) | Medium |

**Deliverables**:
- ✓ Admin tạo được học kỳ và môn học
- ✓ Admin tạo tài khoản học viên
- ✓ Import hàng loạt học viên

---

### Phase 3: Student Portal - Core Features (3-4 tuần)

**Mục tiêu**: Học viên xem và học các môn

| Task | Mô tả | Priority |
|------|-------|----------|
| 3.1 | Trang danh sách học kỳ & môn học | High |
| 3.2 | Trang chi tiết môn học (embed Genially) | High |
| 3.3 | Upload kết quả dự án | High |
| 3.4 | Hiển thị tiến độ học tập | Medium |
| 3.5 | Learning Tree visualization | Medium |

**Deliverables**:
- ✓ Học viên xem được môn học
- ✓ Học viên học qua Genially
- ✓ Học viên submit dự án

---

### Phase 4: Tracking & Progress (2-3 tuần)

**Mục tiêu**: Admin tracking tiến độ học viên

| Task | Mô tả | Priority |
|------|-------|----------|
| 4.1 | Bảng tracking học viên theo môn | High |
| 4.2 | Cập nhật số buổi/dự án hoàn thành | High |
| 4.3 | Logic pass môn (10 buổi + đủ dự án) | High |
| 4.4 | Quick Track - bulk pass | Medium |
| 4.5 | Mở khóa môn/học kỳ tiếp theo | High |

**Deliverables**:
- ✓ Admin track được tiến độ
- ✓ Học viên được mở môn tiếp khi pass

---

### Phase 5: Chuyên ngành & Phân ngành (2-3 tuần)

**Mục tiêu**: Hệ thống phân ngành cho học viên

| Task | Mô tả | Priority |
|------|-------|----------|
| 5.1 | CRUD Chuyên ngành | High |
| 5.2 | Gắn môn học vào chuyên ngành | High |
| 5.3 | Mapping học kỳ bắt đầu phân ngành | High |
| 5.4 | UI chọn chuyên ngành cho học viên | High |
| 5.5 | Hiển thị môn theo ngành đã chọn | High |

**Deliverables**:
- ✓ Admin tạo chuyên ngành
- ✓ Học viên chọn ngành ở HK3
- ✓ Môn học hiển thị theo ngành

---

### Phase 6: Lab Training & Advanced (2-3 tuần)

**Mục tiêu**: Giai đoạn Lab và các tính năng nâng cao

| Task | Mô tả | Priority |
|------|-------|----------|
| 6.1 | Trang Lab Training requirements | High |
| 6.2 | Admin setting nội dung trang Lab | High |
| 6.3 | Checklist yêu cầu (Behance, Email...) | Medium |
| 6.4 | Realtime Dashboard (online users) | Medium |
| 6.5 | Handbook PDF viewer (flipbook) | Medium |

**Deliverables**:
- ✓ Trang Lab hoạt động
- ✓ Dashboard realtime
- ✓ Handbook flipbook

---

### Phase 7: Email & Settings (1-2 tuần)

**Mục tiêu**: Hệ thống email và cấu hình

| Task | Mô tả | Priority |
|------|-------|----------|
| 7.1 | Cấu hình Google OAuth cho Gmail | Medium |
| 7.2 | Email template editor | Medium |
| 7.3 | Gửi email thông tin đăng nhập | Medium |
| 7.4 | Bulk email cho nhiều học viên | Low |
| 7.5 | Trang hướng dẫn sử dụng | Low |

**Deliverables**:
- ✓ Gửi email tự động
- ✓ Template email tùy chỉnh

---

### Phase 8: Polish & Deploy (1-2 tuần)

**Mục tiêu**: Hoàn thiện và deploy

| Task | Mô tả | Priority |
|------|-------|----------|
| 8.1 | UI/UX polish | Medium |
| 8.2 | Performance optimization | Medium |
| 8.3 | Error handling toàn diện | High |
| 8.4 | Testing E2E | Medium |
| 8.5 | Deploy production | High |
| 8.6 | Documentation | Low |

**Deliverables**:
- ✓ App hoạt động ổn định
- ✓ Deploy lên production

---

## Timeline tổng quan

```
Phase 1 ████░░░░░░░░░░░░░░░░░░░░░░░░░░  Tuần 1-3
Phase 2 ░░░░████████░░░░░░░░░░░░░░░░░░  Tuần 3-7
Phase 3 ░░░░░░░░░░░░████████░░░░░░░░░░  Tuần 7-11
Phase 4 ░░░░░░░░░░░░░░░░░░░░████░░░░░░  Tuần 11-14
Phase 5 ░░░░░░░░░░░░░░░░░░░░░░░░████░░  Tuần 14-17
Phase 6 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░██  Tuần 17-20
Phase 7 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  Tuần 20-22
Phase 8 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  Tuần 22-24

Tổng: ~24 tuần (6 tháng) cho full features
MVP (Phase 1-4): ~14 tuần (3.5 tháng)
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| State | TanStack Query, React Context |
| Forms | React Hook Form + Zod |
| Backend | Firebase (Auth, Firestore, Storage) |
| Monorepo | Turborepo + pnpm |
| Testing | Vitest + Testing Library |

---

## Firestore Collections

```
/users/{userId}
  - email, role, displayName, createdAt

/students/{studentId}
  - userId, currentSemester, selectedMajor, progress

/semesters/{semesterId}
  - name, order, isActive, courses[]

/courses/{courseId}
  - title, geniallyUrl, semesterId, requiredSessions, requiredProjects

/majors/{majorId}
  - name, description, startFromSemester, courses[]

/progress/{progressId}
  - studentId, courseId, completedSessions, projects[], status

/settings/{settingId}
  - handbookUrl, emailTemplate, labRequirements
```

---

## Ghi chú

- **MVP Focus**: Phase 1-4 là core, có thể deploy sớm
- **Iterative**: Mỗi phase có thể điều chỉnh dựa trên feedback
- **Parallel Work**: Một số task có thể làm song song nếu có nhiều dev
