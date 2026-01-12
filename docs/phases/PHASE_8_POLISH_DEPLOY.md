# Phase 8: Polish & Deploy

**Thời gian**: 1-2 tuần  
**Mục tiêu**: Hoàn thiện và deploy production

---

## Tổng quan

Phase cuối cùng tập trung vào:
- UI/UX polish
- Performance optimization
- Error handling toàn diện
- Testing
- Deploy production
- Documentation

---

## Tasks chi tiết

### 8.1 UI/UX Polish (Priority: MEDIUM)

**Mô tả**: Hoàn thiện giao diện và trải nghiệm người dùng

**Subtasks**:
- [ ] Review và fix UI inconsistencies
- [ ] Responsive design cho tất cả trang
- [ ] Loading states đẹp (skeleton, spinner)
- [ ] Empty states với illustration
- [ ] Error states với hướng dẫn
- [ ] Animations và transitions
- [ ] Dark mode (optional)
- [ ] Accessibility audit (a11y)

**Checklist UI**:
```
□ Tất cả buttons có hover/active states
□ Forms có validation feedback rõ ràng
□ Tables có loading skeleton
□ Empty states có illustration và CTA
□ Error messages có hướng dẫn fix
□ Mobile responsive hoạt động tốt
□ Keyboard navigation hoạt động
□ Screen reader friendly
```

**Acceptance Criteria**:
- ✓ UI consistent across all pages
- ✓ Responsive trên mobile/tablet/desktop
- ✓ Loading/Empty/Error states đầy đủ

---

### 8.2 Performance Optimization (Priority: MEDIUM)

**Mô tả**: Tối ưu performance cho production

**Subtasks**:
- [ ] Bundle size analysis
- [ ] Code splitting và lazy loading
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Firestore query optimization
- [ ] Lighthouse audit và fix issues

**Performance Checklist**:
```
□ Bundle size < 200KB (gzipped) per route
□ First Contentful Paint < 1.5s
□ Time to Interactive < 3s
□ Lighthouse Performance score > 90
□ Images optimized (WebP, lazy load)
□ Firestore queries có index
□ React components memoized khi cần
```

**Tools**:
- `pnpm build:analyze` - Bundle analysis
- Lighthouse - Performance audit
- React DevTools Profiler - Component performance

**Acceptance Criteria**:
- ✓ Lighthouse score > 90
- ✓ Fast initial load
- ✓ Smooth interactions

---

### 8.3 Error Handling toàn diện (Priority: HIGH)

**Mô tả**: Xử lý lỗi đầy đủ và user-friendly

**Subtasks**:
- [ ] Global error boundary
- [ ] API error handling
- [ ] Network error handling
- [ ] Auth error handling
- [ ] Form validation errors
- [ ] Error logging (optional: Sentry)
- [ ] User-friendly error messages

**Error Boundary**:
```typescript
// packages/ui/src/components/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryPrimitive
      fallback={({ error, resetErrorBoundary }) => (
        <div className="error-page">
          <h1>Đã xảy ra lỗi</h1>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>Thử lại</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundaryPrimitive>
  );
}
```

**Error Messages Map**:
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'Email không tồn tại trong hệ thống',
  'auth/wrong-password': 'Mật khẩu không đúng',
  'auth/too-many-requests': 'Quá nhiều lần thử, vui lòng đợi 5 phút',
  'permission-denied': 'Bạn không có quyền thực hiện thao tác này',
  'network-error': 'Lỗi kết nối, vui lòng kiểm tra internet',
  // ...
};
```

**Acceptance Criteria**:
- ✓ Không có unhandled errors
- ✓ Error messages user-friendly
- ✓ Recovery options khi có lỗi

---

### 8.4 Testing (Priority: MEDIUM)

**Mô tả**: Đảm bảo chất lượng code

**Subtasks**:
- [ ] Unit tests cho utilities và hooks
- [ ] Integration tests cho forms
- [ ] E2E tests cho critical flows
- [ ] Test coverage report
- [ ] Fix failing tests

**Critical Flows cần E2E test**:
```
1. Login flow
   - Login thành công → redirect đúng portal
   - Login thất bại → hiển thị error

2. Student flow
   - Xem danh sách môn học
   - Học môn (Genially embed)
   - Submit dự án

3. Admin flow
   - Tạo học viên
   - Import học viên
   - Tracking và pass học viên
```

**Test Commands**:
```bash
pnpm test:run          # Run all tests
pnpm test:coverage     # Coverage report
pnpm test:e2e          # E2E tests (if setup)
```

**Acceptance Criteria**:
- ✓ Critical paths có tests
- ✓ No failing tests
- ✓ Coverage > 60% cho core logic

---

### 8.5 Deploy Production (Priority: HIGH)

**Mô tả**: Deploy lên production environment

**Subtasks**:
- [ ] Setup Firebase Hosting cho 3 apps
- [ ] Configure custom domains
- [ ] Setup SSL certificates
- [ ] Environment variables cho production
- [ ] CI/CD pipeline (optional)
- [ ] Monitoring setup

**Firebase Hosting Config**:
```json
// firebase.json
{
  "hosting": [
    {
      "target": "auth",
      "public": "apps/auth/out",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "admin",
      "public": "apps/admin/out",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "student",
      "public": "apps/student/out",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

**Custom Domains**:
```
auth.thedesigncouncil.com    → Auth app
admin.thedesigncouncil.com   → Admin app
portal.thedesigncouncil.com  → Student app
```

**Deploy Commands**:
```bash
pnpm build                    # Build all apps
pnpm deploy                   # Deploy all
pnpm deploy:auth              # Deploy auth only
pnpm deploy:admin             # Deploy admin only
pnpm deploy:student           # Deploy student only
```

**Acceptance Criteria**:
- ✓ All apps deployed
- ✓ Custom domains working
- ✓ SSL enabled
- ✓ Production env vars set

---

### 8.6 Documentation (Priority: LOW)

**Mô tả**: Tài liệu cho developers và users

**Subtasks**:
- [ ] README.md cập nhật
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide
- [ ] User manual (cho admin)

**README Structure**:
```markdown
# The Design Council - LMS

## Overview
## Tech Stack
## Getting Started
  - Prerequisites
  - Installation
  - Environment Setup
  - Running Locally
## Project Structure
## Development
  - Code Style
  - Testing
  - Building
## Deployment
## Contributing
```

**Acceptance Criteria**:
- ✓ README đầy đủ
- ✓ Setup guide rõ ràng
- ✓ Deployment guide

---

## Pre-Deploy Checklist

```
Environment:
□ Production Firebase project created
□ Production env vars set
□ Security rules reviewed and deployed
□ Firestore indexes created

Code:
□ All tests passing
□ No TypeScript errors
□ No ESLint errors
□ Bundle size acceptable

Security:
□ No hardcoded secrets
□ CORS configured correctly
□ Rate limiting in place
□ Input validation complete

Performance:
□ Lighthouse score > 90
□ Images optimized
□ Code splitting implemented

Monitoring:
□ Error tracking setup (optional)
□ Analytics setup (optional)
□ Uptime monitoring (optional)
```

---

## Post-Deploy Tasks

```
□ Smoke test all critical flows
□ Verify custom domains
□ Test email sending
□ Create initial admin account
□ Import initial data (if any)
□ Notify stakeholders
□ Monitor for errors
```

---

## Checklist hoàn thành Phase 8

- [ ] UI/UX polished
- [ ] Performance optimized
- [ ] Error handling complete
- [ ] Tests passing
- [ ] Production deployed
- [ ] Custom domains configured
- [ ] Documentation updated
- [ ] Stakeholders notified

---

## Notes

- Deploy từng app riêng để dễ rollback
- Backup Firestore trước khi deploy major changes
- Monitor closely trong 24-48h đầu sau deploy
- Có plan rollback nếu có issues
