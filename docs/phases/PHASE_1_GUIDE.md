# Phase 1: Hướng dẫn thực hiện chi tiết

## Tổng quan tiến độ

Code đã có sẵn:
- ✅ Firebase config (`packages/firebase/src/config.ts`)
- ✅ Auth functions (`packages/firebase/src/auth.ts`)
- ✅ User schema (`packages/schemas/src/user.schema.ts`)
- ✅ Login form (`apps/auth/src/components/LoginForm.tsx`)
- ✅ Redirect logic (`apps/auth/src/lib/redirect.ts`)
- ✅ Error handling (`packages/firebase/src/errors.ts`)
- ✅ useAuth hook (`packages/firebase/src/hooks/useAuth.ts`)
- ✅ AuthContext cho Admin (`apps/admin/src/contexts/AuthContext.tsx`)
- ✅ AuthContext cho Student (`apps/student/src/contexts/AuthContext.tsx`)

**Bạn chỉ cần làm thủ công**:
- ⬜ Task 1.1: Setup Firebase Project
- ⬜ Task 1.2: Tạo Admin + Student user
- ⬜ Task 1.3: Cấu hình Security Rules
- ⬜ Task 1.4: Test Auth flow

---

## Task 1.1: Setup Firebase Project (THỦ CÔNG)

### Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Create a project"**
3. Nhập tên project: `the-design-council` (hoặc tên bạn muốn)
4. Bỏ chọn Google Analytics (không cần thiết lúc này)
5. Click **"Create project"**
6. Đợi project được tạo xong, click **"Continue"**

### Bước 2: Enable Authentication

1. Trong Firebase Console, chọn project vừa tạo
2. Menu bên trái → **"Build"** → **"Authentication"**
3. Click **"Get started"**
4. Tab **"Sign-in method"** → Click **"Email/Password"**
5. Enable **"Email/Password"** (toggle ON)
6. Click **"Save"**

### Bước 3: Tạo Firestore Database

1. Menu bên trái → **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in production mode"**
4. Chọn location gần nhất (ví dụ: `asia-southeast1` cho Việt Nam)
5. Click **"Enable"**

### Bước 4: Lấy Firebase Config

1. Click icon ⚙️ (Settings) bên cạnh "Project Overview"
2. Chọn **"Project settings"**
3. Scroll xuống phần **"Your apps"**
4. Click icon **"</>"** (Web) để thêm web app
5. Nhập tên app: `tdc-web`
6. Click **"Register app"**
7. Copy các giá trị config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Bước 5: Cập nhật .env.local

Mở file `.env.local` ở root project và thay thế các giá trị test:

```env
# Firebase Configuration (THAY THẾ BẰNG GIÁ TRỊ THẬT)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...your-real-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# App URLs (giữ nguyên cho local dev)
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_STUDENT_URL=http://localhost:3002
```

### Bước 6: Verify

Chạy lệnh để verify:
```bash
pnpm env:check
```

Kết quả mong đợi:
```
✅ Required environment variables:
   ✓ NEXT_PUBLIC_FIREBASE_API_KEY
   ✓ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   ✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID
✅ Environment validation passed!
```

---

## Task 1.2: Tạo Admin User đầu tiên (THỦ CÔNG)

### Bước 1: Tạo user trong Firebase Auth

1. Firebase Console → **Authentication** → Tab **"Users"**
2. Click **"Add user"**
3. Nhập:
   - Email: `admin@thedesigncouncil.com` (hoặc email của bạn)
   - Password: `Admin@123456` (hoặc password mạnh hơn)
4. Click **"Add user"**
5. **QUAN TRỌNG**: Copy **User UID** (cột đầu tiên, dạng `abc123xyz...`)

### Bước 2: Tạo User document trong Firestore

1. Firebase Console → **Firestore Database**
2. Click **"Start collection"**
3. Collection ID: `users`
4. Click **"Next"**
5. Document ID: **Paste User UID** từ bước trên
6. Thêm các fields:

| Field | Type | Value |
|-------|------|-------|
| email | string | admin@thedesigncouncil.com |
| displayName | string | Admin |
| role | string | admin |
| isActive | boolean | true |
| createdAt | timestamp | (click icon clock để chọn now) |
| updatedAt | timestamp | (click icon clock để chọn now) |
| lastLoginAt | null | null |

7. Click **"Save"**

### Bước 3: Tạo Student user để test

Lặp lại bước 1-2 với:
- Email: `student@test.com`
- Password: `Student@123456`
- role: `student`
- displayName: `Test Student`

---

## Task 1.3: Cấu hình Firestore Security Rules (THỦ CÔNG)

1. Firebase Console → **Firestore Database** → Tab **"Rules"**
2. Thay thế rules hiện tại bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isStudent() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    // Users collection
    match /users/{userId} {
      // User can read their own profile, admin can read all
      allow read: if isOwner(userId) || isAdmin();
      // Only admin can create/update/delete users
      allow write: if isAdmin();
      // Allow user to update their own lastLoginAt
      allow update: if isOwner(userId) && 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastLoginAt']);
    }
    
    // Students collection (sẽ dùng sau)
    match /students/{studentId} {
      allow read: if isAdmin() || 
        (isStudent() && resource.data.userId == request.auth.uid);
      allow write: if isAdmin();
    }
    
    // Semesters collection (sẽ dùng sau)
    match /semesters/{semesterId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Courses collection (sẽ dùng sau)
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

3. Click **"Publish"**

---

## Task 1.4: Test Auth Flow

### Bước 1: Install dependencies (nếu chưa)

```bash
pnpm install
```

### Bước 2: Chạy Auth app

```bash
# Terminal 1 - Chạy auth app
pnpm dev --filter=@tdc/auth
```

Mở browser: http://localhost:3000

### Bước 3: Test Login Admin

1. Nhập email: `admin@thedesigncouncil.com`
2. Nhập password: `Admin@123456`
3. Click **"Đăng nhập"**
4. **Kết quả mong đợi**: Redirect đến `http://localhost:3001/dashboard`
   - (Sẽ báo lỗi 404 vì Admin app chưa chạy - đó là bình thường)

### Bước 4: Chạy cả 3 apps để test đầy đủ

```bash
# Dừng terminal hiện tại (Ctrl+C)
# Chạy tất cả apps
pnpm dev
```

Các apps sẽ chạy ở:
- Auth: http://localhost:3000
- Admin: http://localhost:3001
- Student: http://localhost:3002

### Bước 5: Test Login Student

1. Mở http://localhost:3000
2. Nhập email: `student@test.com`
3. Nhập password: `Student@123456`
4. Click **"Đăng nhập"**
5. **Kết quả mong đợi**: Redirect đến `http://localhost:3002/dashboard`

### Bước 6: Test Protected Routes

1. Mở trực tiếp http://localhost:3001/dashboard (Admin) khi chưa login
   - **Kết quả**: Redirect về http://localhost:3000 (Login)

2. Login với student account, sau đó mở http://localhost:3001/dashboard
   - **Kết quả**: Redirect về http://localhost:3000 (vì student không có quyền admin)

### Bước 7: Test Forgot Password

1. Quay lại http://localhost:3000
2. Click **"Quên mật khẩu?"**
3. Nhập email
4. Click gửi
5. **Kết quả mong đợi**: Hiển thị thông báo thành công
6. Kiểm tra email (có thể vào spam)

### Troubleshooting

**Lỗi "User profile not found"**:
- Kiểm tra User UID trong Firestore có khớp với Auth không
- Đảm bảo document ID trong Firestore = User UID

**Lỗi "Invalid user data"**:
- Kiểm tra các fields trong Firestore document
- Đảm bảo có đủ: email, displayName, role, isActive, createdAt, updatedAt

**Lỗi "Permission denied"**:
- Kiểm tra Security Rules đã publish chưa
- Đợi 1-2 phút để rules propagate

**Lỗi khi chạy `pnpm dev`**:
- Chạy `pnpm install` trước
- Kiểm tra Node.js version >= 20

---

## Task 1.5: Setup Protected Routes ✅ (ĐÃ HOÀN THÀNH)

Code đã được tạo tự động:

### Files đã tạo:

1. `apps/admin/src/providers/AuthProvider.tsx` - Auth provider cho Admin (requires 'admin' role)
2. `apps/student/src/providers/AuthProvider.tsx` - Auth provider cho Student (requires 'student' role)
3. `apps/admin/src/providers/index.ts` - Barrel exports
4. `apps/student/src/providers/index.ts` - Barrel exports

### Files đã cập nhật:

1. `apps/admin/src/app/(dashboard)/layout.tsx` - Wrap với AdminAuthProvider
2. `apps/student/src/app/(portal)/layout.tsx` - Wrap với StudentAuthProvider

### Cách hoạt động:

- Khi user truy cập Admin Dashboard, `AdminAuthProvider` sẽ:
  - Kiểm tra user đã đăng nhập chưa
  - Kiểm tra user có role 'admin' không
  - Nếu không → redirect về trang login
  
- Khi user truy cập Student Portal, `StudentAuthProvider` sẽ:
  - Kiểm tra user đã đăng nhập chưa
  - Kiểm tra user có role 'student' không
  - Nếu không → redirect về trang login

---

## Checklist Phase 1

Sau khi hoàn thành, đánh dấu:

- [x] Firebase project đã tạo (Task 1.1)
- [x] Authentication enabled (Email/Password) (Task 1.1)
- [x] Firestore database đã tạo (Task 1.1)
- [x] .env.local đã cập nhật với credentials thật (Task 1.1)
- [x] Admin user đã tạo trong Auth + Firestore (Task 1.2)
- [x] Student user đã tạo để test (Task 1.2)
- [x] Security Rules đã publish (Task 1.3)
- [x] `pnpm env:check` pass
- [x] Login Admin → redirect đến Admin Dashboard
- [x] Login Student → redirect đến Student Portal
- [x] Protected routes hoạt động (code đã setup - Task 1.5)
- [ ] Forgot password gửi email thành công (optional - test sau)

---

## ✅ PHASE 1 HOÀN THÀNH!

Bạn đã hoàn thành Phase 1 - Foundation. Tiếp theo là Phase 2 - Admin Basic.

---

## Ghi chú kỹ thuật: Cross-Domain Authentication

### Vấn đề
Firebase Auth persistence sử dụng IndexedDB theo origin (domain + port). Khi các app chạy trên các port khác nhau (3000, 3001, 3002), chúng được coi là các origin khác nhau và không share auth state.

### Giải pháp đã implement
1. **Auth app** (localhost:3000): Sau khi đăng nhập thành công, lấy ID token và truyền qua URL khi redirect
2. **Admin/Student app**: Nhận token từ URL, verify với Firebase REST API, lấy user data từ Firestore
3. **Session persistence**: User data được lưu vào sessionStorage để persist across page refreshes

### Flow chi tiết
```
1. User đăng nhập ở Auth app (localhost:3000)
2. Auth app gọi signIn() → Firebase Auth
3. Sau khi thành công, gọi getIdToken() để lấy ID token
4. Redirect đến Admin/Student app với token trong URL:
   http://localhost:3001/dashboard?token=eyJhbG...
5. Admin/Student app nhận token, gọi exchangeToken():
   - Verify token với Firebase REST API
   - Lấy user data từ Firestore
6. User data được lưu vào sessionStorage
7. Token được xóa khỏi URL (security)
```

### Lưu ý bảo mật
- ID token có thời hạn 1 giờ
- Token được xóa khỏi URL ngay sau khi xử lý
- sessionStorage chỉ tồn tại trong browser tab hiện tại
- Khi đóng tab/browser, session sẽ bị xóa

### Cho Production
Trong production, nên sử dụng một trong các giải pháp sau:
1. **Firebase Hosting** với custom domain để tất cả apps share cùng origin
2. **Firebase Admin SDK** với API route để tạo custom token
3. **Session cookies** với httpOnly flag

---

## Tóm tắt các bước

```
1. Tạo Firebase Project trên console.firebase.google.com
2. Enable Authentication > Email/Password
3. Tạo Firestore Database
4. Copy config vào .env.local
5. Tạo Admin user trong Auth
6. Tạo Admin document trong Firestore (ID = User UID)
7. Tạo Student user tương tự
8. Publish Security Rules
9. Chạy pnpm dev và test
```

Khi hoàn thành Phase 1, báo cho tôi để chuyển sang Phase 2!
