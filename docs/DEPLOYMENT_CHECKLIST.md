# Deployment Checklist

Checklist đầy đủ cho việc deploy The Design Council LMS lên production.

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] **Firebase Project Setup**
  - [ ] Firebase project đã được tạo với Blaze plan
  - [ ] Authentication đã được enable (Email/Password)
  - [ ] Firestore Database đã được tạo
  - [ ] Storage đã được enable
  - [ ] Hosting đã được configure cho 3 sites

- [ ] **Environment Variables**
  - [ ] `.env.local` đã được tạo với đầy đủ biến
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Storage bucket (supports both formats):
    - Legacy format: `project-id.appspot.com`
    - New format: `project-id.firebasestorage.app`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Messaging sender ID
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
  - [ ] `NEXT_PUBLIC_AUTH_URL` - Production auth URL (must be HTTPS)
  - [ ] `NEXT_PUBLIC_ADMIN_URL` - Production admin URL (must be HTTPS)
  - [ ] `NEXT_PUBLIC_STUDENT_URL` - Production student URL (must be HTTPS)

- [ ] **Validate Environment**
  ```bash
  node scripts/validate-env.js --strict
  ```
  - [ ] All required variables are set
  - [ ] Storage bucket format is valid
  - [ ] Production URLs use HTTPS

### 2. Security Validation

- [ ] **Run Security Validation Script**
  ```bash
  node scripts/validate-security.js
  ```
  - [ ] No unauthenticated write rules in storage.rules
  - [ ] No overly permissive read rules in firestore.rules
  - [ ] No TODO/TEMPORARY comments in rules files

- [ ] **Strict Mode (Recommended for Production)**
  ```bash
  node scripts/validate-security.js --strict
  ```
  - [ ] All warnings treated as errors
  - [ ] Zero security issues detected

### 3. Code Quality

- [ ] **Linting**
  ```bash
  pnpm lint
  ```
  - [ ] Không có ESLint errors
  - [ ] Không có ESLint warnings

- [ ] **Type Checking**
  ```bash
  pnpm typecheck
  ```
  - [ ] Không có TypeScript errors

- [ ] **Tests**
  ```bash
  pnpm test:run
  ```
  - [ ] Tất cả unit tests pass
  - [ ] Tất cả integration tests pass
  - [ ] Tất cả property tests pass

### 4. Build Verification

- [ ] **Build All Apps**
  ```bash
  pnpm build
  ```
  - [ ] Auth app build thành công
  - [ ] Admin app build thành công
  - [ ] Student app build thành công

- [ ] **Static Export Verification**
  - [ ] Auth app: `apps/auth/out/index.html` exists (static export)
  - [ ] Admin app: `apps/admin/.next` directory exists (SSR)
  - [ ] Student app: `apps/student/.next` directory exists (SSR)

- [ ] **Bundle Size Check**
  - [ ] Auth app bundle < 200KB gzipped
  - [ ] Admin app bundle < 200KB gzipped
  - [ ] Student app bundle < 200KB gzipped

### 5. Firebase Rules

- [ ] **Firestore Rules**
  - [ ] Review `firebase/firestore.rules`
  - [ ] Đảm bảo rules bảo vệ dữ liệu đúng cách
  - [ ] Test rules với Firebase Emulator (nếu có)

- [ ] **Storage Rules**
  - [ ] Review `firebase/storage.rules`
  - [ ] Đảm bảo chỉ authenticated users có thể upload
  - [ ] Giới hạn file size và types

- [ ] **Validate Rules Syntax**
  ```bash
  cd firebase
  firebase deploy --only firestore:rules --dry-run
  firebase deploy --only storage --dry-run
  ```

### 6. Database Preparation

- [ ] **Admin User**
  - [ ] Đã tạo admin user trong Firebase Auth
  - [ ] Đã tạo document trong `users` collection với role "admin"

- [ ] **Initial Data**
  - [ ] Đã tạo các học kỳ cơ bản (nếu cần)
  - [ ] Đã tạo các chuyên ngành (nếu cần)
  - [ ] Đã upload Handbook PDF (nếu có)

### 7. Domain Configuration (Optional)

- [ ] **Custom Domains**
  - [ ] DNS records đã được configure
  - [ ] SSL certificates đã được provision
  - [ ] Domains đã được verify trong Firebase Console

---

## Deployment Steps

### Step 1: Final Verification

```bash
# Chạy tất cả checks
pnpm lint
pnpm typecheck
pnpm test:run

# Validate environment
node scripts/validate-env.js --strict

# Run security validation
node scripts/validate-security.js --strict

# Build all apps
pnpm build
```

### Step 2: Deploy

**Option A: Automated Deploy (Recommended)**
```bash
./scripts/deploy.sh all
```

The deploy script automatically:
1. Validates environment variables
2. Runs security validation
3. Runs all tests
4. Builds all apps
5. Validates build outputs
6. Deploys to Firebase

**Option B: Manual Deploy**
```bash
# 1. Validate environment
node scripts/validate-env.js --strict

# 2. Run security validation
node scripts/validate-security.js --strict

# 3. Build
pnpm build

# 4. Verify build outputs
# Auth: apps/auth/out/index.html should exist
# Admin: apps/admin/.next should exist
# Student: apps/student/.next should exist

# 5. Deploy hosting
cd firebase
firebase deploy --only hosting

# 6. Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Step 3: Verify Deployment

- [ ] **Auth App**
  - [ ] Truy cập được trang login
  - [ ] Đăng nhập thành công
  - [ ] Redirect đúng theo role

- [ ] **Admin App**
  - [ ] Dashboard hiển thị đúng
  - [ ] CRUD học viên hoạt động
  - [ ] CRUD khóa học hoạt động
  - [ ] Tracking hoạt động

- [ ] **Student App**
  - [ ] Danh sách môn học hiển thị
  - [ ] Xem bài học Genially hoạt động
  - [ ] Nộp dự án hoạt động

---

## Post-Deployment Checklist

### 1. Smoke Testing

- [ ] **Authentication Flow**
  - [ ] Login với admin account
  - [ ] Login với student account
  - [ ] Logout hoạt động
  - [ ] Reset password hoạt động

- [ ] **Core Features**
  - [ ] Tạo học viên mới
  - [ ] Import học viên từ Excel
  - [ ] Tạo khóa học mới
  - [ ] Tracking tiến độ
  - [ ] Gửi email (nếu đã configure)

### 2. Performance Check

- [ ] **Lighthouse Audit**
  - [ ] Performance score >= 80
  - [ ] Accessibility score >= 90
  - [ ] Best Practices score >= 90
  - [ ] SEO score >= 80

- [ ] **Load Time**
  - [ ] First Contentful Paint < 2s
  - [ ] Time to Interactive < 4s

### 3. Monitoring Setup

- [ ] **Firebase Console**
  - [ ] Kiểm tra Analytics đang track
  - [ ] Kiểm tra Crashlytics (nếu có)
  - [ ] Set up alerts cho errors

- [ ] **Error Tracking**
  - [ ] Kiểm tra error logs trong Firebase
  - [ ] Set up notification cho critical errors

### 4. Documentation

- [ ] **Update URLs**
  - [ ] Cập nhật production URLs trong documentation
  - [ ] Thông báo cho team về URLs mới

- [ ] **Backup Configuration**
  - [ ] Lưu lại environment configuration
  - [ ] Document any custom settings

---

## Rollback Procedure

Nếu cần rollback sau khi deploy:

### 1. Rollback Hosting

```bash
# List previous versions
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live
```

### 2. Rollback Rules

```bash
# Firestore rules được version trong Firebase Console
# Vào Firebase Console > Firestore > Rules > History
# Chọn version cần rollback và publish
```

### 3. Rollback Database

- Liên hệ Firebase Support nếu cần restore data
- Sử dụng point-in-time recovery nếu có Blaze plan

---

## Emergency Deployment

Trong trường hợp khẩn cấp cần deploy nhanh:

```bash
# Skip tests (KHÔNG KHUYẾN KHÍCH)
./scripts/deploy.sh all --skip-tests

# Deploy chỉ một app
./scripts/deploy.sh auth
./scripts/deploy.sh admin
./scripts/deploy.sh student

# Deploy chỉ rules
./scripts/deploy.sh rules
```

> ⚠️ **Warning**: Emergency deployment bỏ qua tests có thể gây ra bugs trong production. Chỉ sử dụng khi thực sự cần thiết và phải test thủ công sau khi deploy.

---

## Contact Information

Nếu gặp vấn đề trong quá trình deployment:

- **Technical Support**: [Contact Info]
- **Firebase Issues**: https://firebase.google.com/support
- **Project Repository**: [Repository URL]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-13 | Initial deployment checklist |
| 1.1 | 2026-01-13 | Added security validation step, updated environment variable documentation, added static export verification steps |
