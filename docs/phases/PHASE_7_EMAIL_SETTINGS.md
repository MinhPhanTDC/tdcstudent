# Phase 7: Email & Settings

**Thời gian**: 1-2 tuần  
**Mục tiêu**: Hệ thống email và cấu hình

---

## Tổng quan

Phase này xây dựng:
- Cấu hình Google OAuth cho Gmail API
- Email template editor
- Gửi email thông tin đăng nhập
- Bulk email cho nhiều học viên
- Trang hướng dẫn sử dụng

---

## Tasks chi tiết

### 7.1 Cấu hình Google OAuth cho Gmail (Priority: MEDIUM)

**Mô tả**: Liên kết Google account để gửi email qua Gmail API

**Subtasks**:
- [ ] Setup Google Cloud Project
- [ ] Enable Gmail API
- [ ] Cấu hình OAuth consent screen
- [ ] UI kết nối Google account trong Settings
- [ ] Lưu refresh token an toàn
- [ ] Test gửi email

**Setup Steps**:
```
1. Tạo project trên Google Cloud Console
2. Enable Gmail API
3. Tạo OAuth 2.0 credentials
4. Cấu hình redirect URI
5. Lưu Client ID và Client Secret vào env
```

**UI Settings**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Cấu hình Email                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📧 Kết nối Gmail                                                   │
│                                                                      │
│  Trạng thái: ✓ Đã kết nối                                          │
│  Email: admin@thedesigncouncil.com                                  │
│  Kết nối lúc: 15/01/2026 10:30                                      │
│                                                                      │
│  [Ngắt kết nối] [Test gửi email]                                   │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Hoặc nếu chưa kết nối:                                            │
│                                                                      │
│  Trạng thái: ○ Chưa kết nối                                        │
│                                                                      │
│  [🔗 Kết nối với Google]                                           │
│                                                                      │
│  Lưu ý: Cần kết nối để gửi email thông tin đăng nhập cho học viên  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ OAuth flow hoạt động
- ✓ Lưu token an toàn
- ✓ Test gửi email thành công

---

### 7.2 Email Template Editor (Priority: MEDIUM)

**Mô tả**: Admin tùy chỉnh nội dung email

**Subtasks**:
- [ ] Rich text editor cho email template
- [ ] Các biến hỗ trợ: {name}, {email}, {password}, {login_url}, {timestamp}
- [ ] Preview email với data mẫu
- [ ] Lưu template vào Firestore
- [ ] Multiple templates (welcome, reset password, etc.)

**Biến hỗ trợ**:
| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `{name}` | Tên học viên | Nguyễn Văn A |
| `{email}` | Email đăng nhập | a@example.com |
| `{password}` | Mật khẩu (chỉ khi tạo mới) | abc123 |
| `{login_url}` | Link đăng nhập | https://auth.tdc.com |
| `{timestamp}` | Thời gian gửi | 15/01/2026 10:30 |
| `{semester}` | Học kỳ hiện tại | Học kỳ 1 |

**UI Editor**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Email Template                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Template: [Thông tin đăng nhập ▼]                                  │
│                                                                      │
│  Subject:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ [TDC] Thông tin đăng nhập của bạn                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Nội dung:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ [B] [I] [U] | [Link] [Image] | {name} {email} {password}    │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │ Xin chào {name},                                            │    │
│  │                                                              │    │
│  │ Chào mừng bạn đến với The Design Council!                   │    │
│  │                                                              │    │
│  │ Thông tin đăng nhập của bạn:                                │    │
│  │ - Email: {email}                                            │    │
│  │ - Mật khẩu: {password}                                      │    │
│  │                                                              │    │
│  │ Đăng nhập tại: {login_url}                                  │    │
│  │                                                              │    │
│  │ Trân trọng,                                                 │    │
│  │ The Design Council                                          │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [Preview] [Lưu template]                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Preview Modal**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Preview Email                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  From: admin@thedesigncouncil.com                                   │
│  To: nguyenvana@example.com                                         │
│  Subject: [TDC] Thông tin đăng nhập của bạn                        │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Xin chào Nguyễn Văn A,                                            │
│                                                                      │
│  Chào mừng bạn đến với The Design Council!                         │
│                                                                      │
│  Thông tin đăng nhập của bạn:                                      │
│  - Email: nguyenvana@example.com                                   │
│  - Mật khẩu: TDC2026@abc                                           │
│                                                                      │
│  Đăng nhập tại: https://auth.thedesigncouncil.com                  │
│                                                                      │
│  Trân trọng,                                                       │
│  The Design Council                                                │
│                                                                      │
│                                              [Đóng]                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Rich text editor
- ✓ Insert biến
- ✓ Preview với data mẫu
- ✓ Lưu template

---

### 7.3 Gửi email thông tin đăng nhập (Priority: MEDIUM)

**Mô tả**: Gửi email cho học viên mới với thông tin đăng nhập

**Subtasks**:
- [ ] Button "Gửi email" trong trang student detail
- [ ] Confirm trước khi gửi
- [ ] Gửi email qua Gmail API
- [ ] Log email đã gửi
- [ ] Hiển thị trạng thái gửi

**Flow**:
```
Admin tạo student mới
         ↓
    [Gửi email thông tin đăng nhập]
         ↓
    Confirm dialog
         ↓
    Gửi email qua Gmail API
         ↓
    Log: emailSentAt, emailSentBy
         ↓
    Notification: "Đã gửi email thành công"
```

**Acceptance Criteria**:
- ✓ Gửi email thành công
- ✓ Log email đã gửi
- ✓ Error handling

---

### 7.4 Bulk Email cho nhiều học viên (Priority: LOW)

**Mô tả**: Gửi email hàng loạt cho nhiều học viên

**Subtasks**:
- [ ] Checkbox chọn nhiều học viên
- [ ] Button "Gửi email cho X học viên đã chọn"
- [ ] Progress indicator
- [ ] Rate limiting (tránh spam)
- [ ] Report kết quả (success/failed)

**UI**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  [☑ Chọn tất cả]                    [📧 Gửi email cho 5 học viên]  │
├─────────────────────────────────────────────────────────────────────┤
│ ☑ │ Nguyễn Văn A    │ a@example.com    │ Chưa gửi email            │
│ ☑ │ Trần Thị B      │ b@example.com    │ Chưa gửi email            │
│ ☐ │ Lê Văn C        │ c@example.com    │ ✓ Đã gửi 15/01/2026       │
│ ☑ │ Phạm Thị D      │ d@example.com    │ Chưa gửi email            │
└─────────────────────────────────────────────────────────────────────┘
```

**Progress Dialog**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Đang gửi email...                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ████████████████░░░░░░░░░░░░░░ 3/5                                 │
│                                                                      │
│  ✓ Nguyễn Văn A - Đã gửi                                           │
│  ✓ Trần Thị B - Đã gửi                                             │
│  ✓ Phạm Thị D - Đã gửi                                             │
│  ○ Hoàng Văn E - Đang gửi...                                       │
│  ○ Ngô Thị F - Chờ                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✓ Chọn nhiều học viên
- ✓ Bulk send với progress
- ✓ Rate limiting
- ✓ Report kết quả

---

### 7.5 Trang hướng dẫn sử dụng (Priority: LOW)

**Mô tả**: Trang help cho admin

**Subtasks**:
- [ ] Trang Help (`/help`)
- [ ] Các section hướng dẫn
- [ ] Search trong help
- [ ] FAQ
- [ ] Video tutorials (optional)

**Nội dung Help**:
```
1. Bắt đầu
   - Đăng nhập lần đầu
   - Tổng quan Dashboard

2. Quản lý Học kỳ
   - Tạo học kỳ mới
   - Sắp xếp thứ tự
   - Cấu hình phân ngành

3. Quản lý Môn học
   - Tạo môn học
   - Gắn link Genially
   - Cấu hình yêu cầu

4. Quản lý Học viên
   - Tạo học viên
   - Import từ Excel
   - Gửi email đăng nhập

5. Tracking
   - Theo dõi tiến độ
   - Pass/Fail học viên
   - Quick Track

6. Cấu hình
   - Kết nối Gmail
   - Email template
   - Handbook
```

**Acceptance Criteria**:
- ✓ Trang help với nội dung đầy đủ
- ✓ Dễ navigate
- ✓ Search (optional)

---

## Firestore Collections

```
/settings/email
  - gmailConnected: boolean
  - gmailEmail: string
  - gmailRefreshToken: string (encrypted)
  - connectedAt: timestamp
  - connectedBy: string

/emailTemplates/{templateId}
  - id, name, subject, body
  - variables: string[]
  - isDefault: boolean
  - createdAt, updatedAt

/emailLogs/{logId}
  - studentId, studentEmail
  - templateId, subject
  - sentAt, sentBy
  - status: 'sent' | 'failed'
  - errorMessage: string (if failed)
```

---

## Checklist hoàn thành Phase 7

- [ ] Google OAuth setup
- [ ] Gmail API integration
- [ ] Email template editor
- [ ] Preview email
- [ ] Gửi email đơn lẻ
- [ ] Bulk email
- [ ] Email logs
- [ ] Trang Help

---

## Notes

- Gmail API có quota limit, cần rate limiting
- Refresh token cần encrypt trước khi lưu
- Bulk email nên có delay giữa các email (1-2 giây)
- Help page có thể dùng MDX cho dễ maintain
