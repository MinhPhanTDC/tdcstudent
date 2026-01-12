# Phase 1: Foundation & Core Auth

**Thời gian**: 2-3 tuần  
**Mục tiêu**: Setup infrastructure và authentication cơ bản

---

## Tổng quan

Phase này tập trung vào việc thiết lập nền tảng vững chắc cho toàn bộ hệ thống, bao gồm:
- Cấu hình Firebase project thật
- Hoàn thiện authentication flow
- Phân quyền và protected routes

---

## Tasks chi tiết

### 1.1 Setup Firebase Project (Priority: HIGH)

**Mô tả**: Tạo và cấu hình Firebase project cho production

**Subtasks**:
- [ ] Tạo Firebase project mới trên Firebase Console
- [ ] Enable Authentication với Email/Password provider
- [ ] Tạo Firestore database (production mode)
- [ ] Tạo Storage bucket cho file uploads
- [ ] Cấu hình Security Rules cơ bản
- [ ] Lấy credentials và cập nhật `.env.local`

**Files liên quan**:
```
packages/firebase/src/config.ts
.env.local
firebase/firestore.rules
```

**Acceptance Criteria**:
- ✓ Firebase project hoạt động
- ✓ Có thể connect từ local dev
- ✓ Security rules block unauthorized access

---

### 1.2 Hoàn thiện Auth Flow (Priority: HIGH)

**Mô tả**: Login, Logout, Reset Password hoạt động đầy đủ

**Subtasks**:
- [ ] Login form với validation (Zod + React Hook Form)
- [ ] Error handling cho các case: wrong password, user not found, too many attempts
- [ ] Logout functionality
- [ ] Forgot password - gửi email reset
- [ ] Reset password page với token validation
- [ ] Remember me functionality (optional)
- [ ] Loading states và error messages

**Files liên quan**:
```
apps/auth/src/app/page.tsx                    # Login page
apps/auth/src/app/reset-password/page.tsx     # Reset password
apps/auth/src/components/LoginForm.tsx
apps/auth/src/components/ForgotPasswordForm.tsx
packages/firebase/src/auth.ts
```

**UI Components cần**:
- LoginForm
- ForgotPasswordForm  
- ResetPasswordForm
- AuthLayout (2 columns: form | handbook)

**Acceptance Criteria**:
- ✓ User có thể đăng nhập với email/password
- ✓ Error messages hiển thị đúng
- ✓ Forgot password gửi email thành công
- ✓ Reset password hoạt động

---

### 1.3 Phân quyền Admin vs Student (Priority: HIGH)

**Mô tả**: Hệ thống phân biệt role và quyền truy cập

**Subtasks**:
- [ ] Định nghĩa User schema với role field
- [ ] Tạo admin user đầu tiên (manual hoặc script)
- [ ] AuthContext lưu user info và role
- [ ] Helper functions: `isAdmin()`, `isStudent()`
- [ ] Firestore rules theo role

**Schema**:
```typescript
// packages/schemas/src/user.schema.ts
export const UserRoleSchema = z.enum(['admin', 'student']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

**Firestore Rules**:
```javascript
function isAdmin() {
  return request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function isStudent() {
  return request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
}
```

**Acceptance Criteria**:
- ✓ User document có role field
- ✓ AuthContext cung cấp role info
- ✓ Firestore rules phân quyền đúng

---

### 1.4 Redirect sau Login theo Role (Priority: HIGH)

**Mô tả**: Sau khi login, redirect user đến đúng portal

**Subtasks**:
- [ ] Sau login thành công, fetch user document
- [ ] Check role và redirect:
  - Admin → `NEXT_PUBLIC_ADMIN_URL`
  - Student → `NEXT_PUBLIC_STUDENT_URL`
- [ ] Handle case user không có document (error)
- [ ] Handle case role không hợp lệ

**Logic Flow**:
```
Login Success
    ↓
Fetch User Document from Firestore
    ↓
Check Role
    ├── admin → redirect to Admin Dashboard
    ├── student → redirect to Student Portal
    └── unknown → show error
```

**Files liên quan**:
```
apps/auth/src/components/LoginForm.tsx
apps/auth/src/lib/auth-redirect.ts
packages/firebase/src/auth.ts
```

**Acceptance Criteria**:
- ✓ Admin login → vào Admin Dashboard
- ✓ Student login → vào Student Portal
- ✓ Error handling cho edge cases

---

### 1.5 Protected Routes (Priority: HIGH)

**Mô tả**: Các route yêu cầu authentication và đúng role

**Subtasks**:
- [ ] AuthProvider cho mỗi app (Admin, Student)
- [ ] useAuth hook để check auth state
- [ ] ProtectedRoute component/middleware
- [ ] Redirect về Auth app nếu chưa login
- [ ] Redirect về đúng portal nếu sai role
- [ ] Loading state khi checking auth

**Implementation**:
```typescript
// packages/firebase/src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getUser(firebaseUser.uid);
        setUser(userDoc.success ? userDoc.data : null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  return { user, loading, isAdmin: user?.role === 'admin', isStudent: user?.role === 'student' };
}
```

**Protected Route Pattern**:
```typescript
// apps/admin/src/components/ProtectedRoute.tsx
export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) {
    redirect(process.env.NEXT_PUBLIC_AUTH_URL);
    return null;
  }
  if (!isAdmin) {
    redirect(process.env.NEXT_PUBLIC_STUDENT_URL);
    return null;
  }
  
  return <>{children}</>;
}
```

**Acceptance Criteria**:
- ✓ Chưa login → redirect về Auth
- ✓ Student vào Admin → redirect về Student Portal
- ✓ Admin vào Student → redirect về Admin Dashboard
- ✓ Loading state hiển thị đúng

---

## Firestore Collections cần tạo

```
/users/{userId}
  - id: string
  - email: string
  - displayName: string
  - role: 'admin' | 'student'
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp
```

---

## Environment Variables cần có

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# App URLs
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_STUDENT_URL=http://localhost:3002
```

---

## Checklist hoàn thành Phase 1

- [ ] Firebase project đã setup và hoạt động
- [ ] Login/Logout hoạt động
- [ ] Forgot/Reset password hoạt động
- [ ] User có role (admin/student)
- [ ] Redirect đúng portal sau login
- [ ] Protected routes hoạt động
- [ ] Có ít nhất 1 admin account để test
- [ ] Có ít nhất 1 student account để test

---

## Notes

- Tạo admin account đầu tiên có thể dùng Firebase Console hoặc script
- Nên test kỹ các edge cases: token expired, user deleted, role changed
- Security rules rất quan trọng, review kỹ trước khi deploy
