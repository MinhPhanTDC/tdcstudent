# Deploy Instructions - Cloud Functions + Storage Rules

## ⚠️ Lỗi vừa gặp

```
Error: Quota exceeded for quota metric 'Mutate requests' and limit 'Mutate requests per minute'
```

**Nguyên nhân**: Firebase đang enable nhiều APIs cùng lúc, vượt quota limit.

**Giải pháp**: Đợi 1-2 phút rồi thử lại.

## 🚀 Các bước deploy

### Bước 1: Enable APIs manually (nếu cần)

Mở Firebase Console và enable các APIs sau:
1. Cloud Functions API
2. Cloud Build API  
3. Artifact Registry API

Hoặc dùng gcloud CLI:
```bash
gcloud services enable cloudfunctions.googleapis.com --project=tdcstudent-31d45
gcloud services enable cloudbuild.googleapis.com --project=tdcstudent-31d45
gcloud services enable artifactregistry.googleapis.com --project=tdcstudent-31d45
```

### Bước 2: Deploy Storage Rules trước

```bash
cd firebase
firebase deploy --only storage
```

### Bước 3: Đợi 1-2 phút

Để tránh quota limit.

### Bước 4: Deploy Functions

```bash
firebase deploy --only functions
```

### Bước 5: Verify deployment

```bash
# List deployed functions
firebase functions:list

# Expected output:
# - setUserClaims
# - updateUserClaims  
# - refreshUserClaims
```

## 🔧 Set claims cho admin user hiện tại

### Option 1: Trigger function bằng cách update Firestore

1. Mở Firebase Console > Firestore
2. Tìm document: `users/R5ppocTD7MMJItyoAA6sPnQ0OCzj1`
3. Edit document, thêm field mới: `triggerUpdate: true`
4. Save
5. Cloud Function `updateUserClaims` sẽ tự động chạy
6. Check Functions logs để verify

### Option 2: Dùng Firebase Admin SDK script

Tạo file `firebase/functions/scripts/set-admin-claims.js`:

```javascript
const admin = require('firebase-admin');

// Initialize with service account
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaims() {
  const email = 'thiennmyy@gmail.com';
  
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
      isActive: true,
    });
    
    console.log('✅ Custom claims set successfully!');
    console.log('Claims:', { role: 'admin', isActive: true });
    
    // Update Firestore document
    await admin.firestore().collection('users').doc(user.uid).update({
      claimsSet: true,
      claimsSetAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Firestore document updated!');
    console.log('\n⚠️  User needs to logout and login again to refresh token.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdminClaims();
```

**Lưu ý**: Cần download service account key từ Firebase Console:
1. Project Settings > Service Accounts
2. Generate new private key
3. Save as `firebase/functions/service-account-key.json`
4. **KHÔNG commit file này vào git!**

Chạy script:
```bash
cd firebase/functions
node scripts/set-admin-claims.js
```

### Option 3: Dùng callable function từ client

Sau khi deploy functions, trong admin app:

```typescript
// Trong browser console hoặc tạo button trong UI
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const refreshClaims = httpsCallable(functions, 'refreshUserClaims');

// Refresh claims cho current user
const result = await refreshClaims();
console.log('Result:', result.data);

// Logout và login lại để refresh token
await firebase.auth().signOut();
```

## ✅ Verify claims đã được set

### Trong browser console (admin app):

```javascript
// Get current token with claims
const token = await firebase.auth().currentUser.getIdTokenResult();
console.log('Custom Claims:', token.claims);

// Expected output:
// {
//   role: 'admin',
//   isActive: true,
//   iss: '...',
//   aud: '...',
//   ...
// }
```

### Check Firebase Console:

1. Authentication > Users
2. Click vào user `thiennmyy@gmail.com`
3. Scroll xuống "Custom claims"
4. Verify có: `{ "role": "admin", "isActive": true }`

## 🧪 Test upload sau khi set claims

1. **Logout và login lại** (bắt buộc để refresh token)
2. Vào Media page
3. Upload ảnh
4. Check console logs - không có Firestore read
5. Check Firebase Console > Functions > Logs - verify function chạy

## 📊 Monitor

### Functions logs:
```bash
firebase functions:log
```

### Realtime logs:
```bash
firebase functions:log --only setUserClaims
firebase functions:log --only updateUserClaims
```

### Check function invocations:
Firebase Console > Functions > Dashboard > Metrics

## 💰 Chi phí

Với Blaze plan:
- **Functions invocations**: 2M free/month
- **Compute time**: 400,000 GB-seconds/month free
- **Ước tính usage**: ~100 invocations/month
- **Chi phí**: **$0/month** (trong free tier)

## 🎯 Kết quả mong đợi

Sau khi hoàn thành:
- ✅ Upload media: 0 Firestore reads
- ✅ Nhanh hơn (không cần query Firestore)
- ✅ Tự động set claims cho user mới
- ✅ Tự động update claims khi role thay đổi
- ✅ Có fallback nếu claims chưa set

---

**Lưu ý quan trọng**: User phải **logout và login lại** sau khi claims được set để token được refresh!
