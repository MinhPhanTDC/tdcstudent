# Cloud Functions Setup - Custom Claims cho Admin

## 🎯 Mục đích

Tối ưu Storage Rules bằng cách sử dụng **Custom Claims** thay vì Firestore lookup:
- ✅ **0 Firestore reads** khi upload (tiết kiệm chi phí)
- ✅ **Nhanh hơn** (claims được cache trong token)
- ✅ **Tự động** set claims khi tạo/update user

## 📦 Đã tạo

1. `firebase/functions/` - Cloud Functions code
2. `firebase/functions/src/index.ts` - 3 functions:
   - `setUserClaims` - Auto set claims khi tạo user mới
   - `updateUserClaims` - Auto update claims khi role thay đổi
   - `refreshUserClaims` - Callable function để force refresh

## 🚀 Các bước deploy

### Bước 1: Install dependencies

```bash
cd firebase/functions
npm install
```

### Bước 2: Build functions

```bash
npm run build
```

### Bước 3: Deploy functions

```bash
# Deploy tất cả
cd ..
firebase deploy --only functions

# Hoặc deploy từng function
firebase deploy --only functions:setUserClaims
firebase deploy --only functions:updateUserClaims
firebase deploy --only functions:refreshUserClaims
```

### Bước 4: Deploy Storage Rules (đã update)

```bash
firebase deploy --only storage
```

Storage rules đã được update để:
1. **Ưu tiên** check custom claims (nhanh, free)
2. **Fallback** check Firestore nếu claims chưa set (transition period)

### Bước 5: Set claims cho user hiện tại

Có 2 cách:

**Cách 1: Tự động (khuyến nghị)**
- Update user document trong Firestore (thay đổi bất kỳ field nào)
- Cloud Function `updateUserClaims` sẽ tự động chạy

**Cách 2: Manual qua Admin SDK**

Tạo script `firebase/functions/scripts/set-admin-claims.js`:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function setAdminClaims(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
      isActive: true,
    });
    console.log(`✅ Claims set for ${email}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Set claims cho admin
setAdminClaims('thiennmyy@gmail.com');
```

Chạy:
```bash
cd firebase/functions
node scripts/set-admin-claims.js
```

**Cách 3: Dùng callable function từ client**

Trong admin app, tạo utility:

```typescript
// apps/admin/src/lib/refreshClaims.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

export async function refreshUserClaims(userId?: string) {
  const functions = getFunctions();
  const refreshClaims = httpsCallable(functions, 'refreshUserClaims');
  
  try {
    const result = await refreshClaims({ userId });
    console.log('Claims refreshed:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to refresh claims:', error);
    throw error;
  }
}
```

Gọi trong component:
```typescript
import { refreshUserClaims } from '@/lib/refreshClaims';

// Refresh claims cho current user
await refreshUserClaims();

// User cần logout và login lại để token được refresh
```

## 🔄 Workflow

### Khi tạo user mới:
1. Admin tạo user trong Firestore
2. Cloud Function `setUserClaims` trigger
3. Function set custom claims: `{ role: 'admin', isActive: true }`
4. User document updated: `claimsSet: true`

### Khi thay đổi role:
1. Admin update user role trong Firestore
2. Cloud Function `updateUserClaims` trigger
3. Function update custom claims
4. User cần logout/login để refresh token

### Khi upload media:
1. Storage Rules check `request.auth.token.role`
2. Nếu có claims → Allow (0 reads) ✅
3. Nếu chưa có claims → Fallback check Firestore (1 read)

## 📊 So sánh performance

### Trước (Firestore lookup):
```
Upload request → Storage Rules → Firestore read → Check role → Allow/Deny
Chi phí: 1 read mỗi upload
```

### Sau (Custom Claims):
```
Upload request → Storage Rules → Check token claims → Allow/Deny
Chi phí: 0 reads
```

### Với fallback:
```
Upload request → Storage Rules → Check token claims (không có) → Firestore read → Allow/Deny
Chi phí: 1 read (chỉ lần đầu, sau đó 0 reads)
```

## 🧪 Testing

### Test 1: Verify claims được set

```bash
# Get user token
firebase auth:export users.json
cat users.json | grep "thiennmyy@gmail.com"

# Hoặc trong browser console (admin app):
firebase.auth().currentUser.getIdTokenResult().then(token => {
  console.log('Custom Claims:', token.claims);
  // Expected: { role: 'admin', isActive: true }
});
```

### Test 2: Test upload với claims

1. Logout và login lại (để refresh token)
2. Upload media
3. Check console - không có Firestore read logs
4. Check Firebase Console > Functions > Logs

### Test 3: Test fallback

1. Xóa claims của user (manual)
2. Upload media
3. Vẫn work (dùng fallback)
4. Check logs - có Firestore read

## 💰 Chi phí ước tính

### Cloud Functions (Blaze plan):
- **Invocations**: 2M free/month
- **Compute time**: 400,000 GB-seconds/month free
- **Ước tính**: 
  - 10 users mới/tháng = 10 invocations
  - 50 role changes/tháng = 50 invocations
  - **Total: ~60 invocations/tháng** → **FREE**

### Firestore reads (với fallback):
- Chỉ cần 1 read cho mỗi user (lần đầu)
- Sau đó 0 reads mãi mãi
- **Total: ~10 reads/tháng** → **FREE**

### Kết luận:
**Hoàn toàn FREE** với traffic của bạn! 🎉

## 🔧 Troubleshooting

### Functions không deploy được

```bash
# Check Node version (cần 18)
node --version

# Re-install dependencies
cd firebase/functions
rm -rf node_modules package-lock.json
npm install

# Build lại
npm run build
```

### Claims không được set

```bash
# Check function logs
firebase functions:log

# Test function locally
cd firebase/functions
npm run serve

# Trigger function manually
firebase functions:shell
> setUserClaims({userId: 'xxx'})
```

### Token không refresh

User cần:
1. Logout
2. Login lại
3. Hoặc force refresh token:

```typescript
await firebase.auth().currentUser?.getIdToken(true);
```

## 📝 Next Steps

Sau khi deploy functions:

1. ✅ Set claims cho tất cả admin users hiện có
2. ✅ Test upload media (verify 0 reads)
3. ✅ Monitor function logs
4. ✅ Update user creation flow để tự động set claims
5. ✅ Document cho team về logout/login sau role change

## 🎯 Migration Plan

### Phase 1: Deploy functions (ngay)
- Deploy Cloud Functions
- Set claims cho admin users hiện tại
- Storage Rules vẫn có fallback

### Phase 2: Verify (1 tuần)
- Monitor logs
- Verify claims work
- Check performance

### Phase 3: Remove fallback (sau 1 tháng)
- Khi chắc chắn tất cả users có claims
- Remove `isAdminFallback()` từ Storage Rules
- Chỉ dùng `isAdmin()` (custom claims only)

---

**Chi phí cuối cùng: $0/tháng** 💰✨
