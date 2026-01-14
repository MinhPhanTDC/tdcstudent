# The Design Council - Deployment Workflow

## QUAN TRỌNG: Production-First Development

**Nguyên tắc:** Project này đang chạy trên PRODUCTION, không phải local development.

### Quy tắc bắt buộc

1. **KHÔNG BAO GIỜ** giả định đang làm việc trên local
2. **LUÔN LUÔN** deploy sau mỗi thay đổi quan trọng
3. **KIỂM TRA** trên production URL sau khi deploy
4. **BACKUP** trước khi deploy những thay đổi lớn

## Production URLs

```
Auth:    https://login.thedesigncouncil.vn
Admin:   https://admin.thedesigncouncil.vn
Student: https://portfolio.thedesigncouncil.vn
```

## Deployment Commands

### 1. Deploy All (Recommended)

```bash
# Deploy tất cả: hosting + functions + rules
node scripts/auto-deploy-all.js
```

### 2. Deploy Specific Components

```bash
# Chỉ hosting (frontend apps)
firebase deploy --only hosting --project tdcstudent-31d45

# Chỉ functions (backend)
firebase deploy --only functions --project tdcstudent-31d45

# Chỉ storage rules
firebase deploy --only storage --project tdcstudent-31d45

# Chỉ firestore rules
firebase deploy --only firestore:rules --project tdcstudent-31d45
```

### 3. Deploy Single App

```bash
# Chỉ admin app
firebase deploy --only hosting:admin --project tdcstudent-31d45

# Chỉ auth app
firebase deploy --only hosting:auth --project tdcstudent-31d45

# Chỉ student app
firebase deploy --only hosting:student --project tdcstudent-31d45
```

## Deployment Workflow

### Khi thay đổi Frontend Code

```bash
# 1. Build tất cả apps
pnpm build

# 2. Deploy hosting
firebase deploy --only hosting --project tdcstudent-31d45

# 3. Verify trên production URLs
# Mở browser và test
```

### Khi thay đổi Backend (Functions)

```bash
# 1. Test functions locally (optional)
cd firebase/functions
npm run build

# 2. Deploy functions
firebase deploy --only functions --project tdcstudent-31d45

# 3. Verify functions hoạt động
# Check Firebase Console > Functions
```

### Khi thay đổi Rules (Storage/Firestore)

```bash
# Storage rules
firebase deploy --only storage --project tdcstudent-31d45

# Firestore rules
firebase deploy --only firestore:rules --project tdcstudent-31d45

# Cả hai
firebase deploy --only storage,firestore:rules --project tdcstudent-31d45
```

### Khi thay đổi UI Components

```bash
# 1. Build
pnpm build

# 2. Deploy app cụ thể
firebase deploy --only hosting:admin --project tdcstudent-31d45

# 3. Hard refresh browser (Ctrl+Shift+R)
# 4. Test tính năng mới
```

## Pre-Deployment Checklist

### Trước mỗi deployment

- [ ] Code đã được test kỹ
- [ ] Không có TypeScript errors: `pnpm typecheck`
- [ ] Không có ESLint errors: `pnpm lint`
- [ ] Build thành công: `pnpm build`
- [ ] Đã commit code: `git commit -m "..."`

### Deployment quan trọng

- [ ] Backup database (nếu có migration)
- [ ] Thông báo users (nếu có downtime)
- [ ] Có rollback plan
- [ ] Test trên staging trước (nếu có)

## Post-Deployment Verification

### Sau mỗi deployment

1. **Kiểm tra URLs hoạt động:**
   ```bash
   curl -I https://admin.thedesigncouncil.vn
   curl -I https://login.thedesigncouncil.vn
   curl -I https://portfolio.thedesigncouncil.vn
   ```

2. **Mở browser và test:**
   - Đăng nhập
   - Test tính năng vừa deploy
   - Kiểm tra console không có lỗi

3. **Kiểm tra Firebase Console:**
   - Functions đang chạy
   - Storage rules đã update
   - Firestore rules đã update

4. **Monitor logs:**
   ```bash
   firebase functions:log --project tdcstudent-31d45
   ```

## Rollback Strategy

### Nếu deployment có vấn đề

1. **Rollback hosting:**
   ```bash
   # Xem lịch sử deployments
   firebase hosting:channel:list --project tdcstudent-31d45
   
   # Rollback về version trước (manual qua Console)
   # Firebase Console > Hosting > Release history > Rollback
   ```

2. **Rollback functions:**
   ```bash
   # Redeploy version cũ từ git
   git checkout <previous-commit>
   firebase deploy --only functions --project tdcstudent-31d45
   git checkout main
   ```

3. **Rollback rules:**
   ```bash
   # Restore từ backup hoặc git
   git checkout <previous-commit> firebase/storage.rules
   firebase deploy --only storage --project tdcstudent-31d45
   ```

## Environment Variables

### Production Environment

**QUAN TRỌNG:** Production sử dụng Firebase Hosting environment, KHÔNG dùng .env.local

Environment variables được set qua:

1. **Firebase Hosting config** (firebase.json)
2. **Build-time variables** (Next.js build)
3. **Firebase Functions config** (functions:config:set)

### Set Functions Config

```bash
# Set config cho functions
firebase functions:config:set \
  firebase.api_key="..." \
  firebase.project_id="tdcstudent-31d45" \
  --project tdcstudent-31d45

# Xem config hiện tại
firebase functions:config:get --project tdcstudent-31d45
```

### Build-time Variables

Trong `firebase.json`, env vars được inject vào build:

```json
{
  "hosting": [
    {
      "target": "admin",
      "public": "apps/admin/out",
      "rewrites": [...],
      "headers": [...]
    }
  ]
}
```

## Common Issues & Solutions

### Issue: Changes không hiển thị sau deploy

**Nguyên nhân:** Browser cache

**Fix:**
```bash
# 1. Hard refresh: Ctrl+Shift+R
# 2. Clear cache
# 3. Incognito mode
# 4. Check deployment time trong Firebase Console
```

### Issue: Functions không update

**Nguyên nhân:** Functions cache hoặc deploy failed

**Fix:**
```bash
# 1. Check functions log
firebase functions:log --project tdcstudent-31d45

# 2. Redeploy với force
firebase deploy --only functions --force --project tdcstudent-31d45

# 3. Check Firebase Console > Functions
```

### Issue: Rules không apply

**Nguyên nhân:** Rules deploy failed hoặc syntax error

**Fix:**
```bash
# 1. Validate rules
firebase deploy --only storage --project tdcstudent-31d45

# 2. Check console output cho errors
# 3. Fix syntax errors
# 4. Redeploy
```

## Monitoring & Debugging

### Check Deployment Status

```bash
# Xem deployment history
firebase hosting:channel:list --project tdcstudent-31d45

# Xem functions status
firebase functions:list --project tdcstudent-31d45

# Xem logs
firebase functions:log --project tdcstudent-31d45 --limit 50
```

### Debug Production Issues

1. **Browser DevTools:**
   - Console tab: Check errors
   - Network tab: Check API calls
   - Application tab: Check storage/cookies

2. **Firebase Console:**
   - Functions logs
   - Storage usage
   - Firestore data
   - Authentication users

3. **Remote Debugging:**
   ```javascript
   // Thêm vào code để debug production
   console.log('[DEBUG]', { user, data, error });
   ```

## Best Practices

### DO ✅

- Deploy thường xuyên (nhỏ, incremental)
- Test trên production sau mỗi deploy
- Monitor logs sau deploy
- Commit code trước khi deploy
- Document breaking changes
- Backup trước major changes

### DON'T ❌

- Deploy code chưa test
- Deploy nhiều thay đổi cùng lúc
- Ignore deployment errors
- Deploy vào giờ cao điểm (nếu có downtime)
- Quên verify sau deploy
- Deploy trực tiếp production mà không có backup

## Quick Reference

```bash
# Full deployment
node scripts/auto-deploy-all.js

# Frontend only
pnpm build && firebase deploy --only hosting --project tdcstudent-31d45

# Backend only
firebase deploy --only functions --project tdcstudent-31d45

# Rules only
firebase deploy --only storage,firestore:rules --project tdcstudent-31d45

# Single app
firebase deploy --only hosting:admin --project tdcstudent-31d45

# Check status
firebase hosting:channel:list --project tdcstudent-31d45
firebase functions:log --project tdcstudent-31d45

# Rollback (via Console)
# Firebase Console > Hosting > Release history > Rollback
```

## Emergency Contacts

Nếu có vấn đề nghiêm trọng:

1. Rollback ngay lập tức
2. Check Firebase Console status
3. Review deployment logs
4. Contact team lead
5. Document incident

## Notes

- Project ID: `tdcstudent-31d45`
- Region: `asia-southeast1`
- Hosting: Firebase Hosting
- Functions: Cloud Functions for Firebase
- Database: Firestore + Realtime Database
- Storage: Firebase Storage
