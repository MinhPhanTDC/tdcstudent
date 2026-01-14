# 🚀 Quick Start - Deploy Functions & Fix Upload

## ✅ Đã hoàn thành

- ✅ Storage Rules deployed thành công
- ✅ Functions code đã build
- ⏳ Đang chờ deploy Functions (quota limit)

## 🎯 Bước tiếp theo (2 phút)

### Bước 1: Đợi 2 phút

Để tránh quota limit error khi enable APIs.

### Bước 2: Deploy Functions

```bash
cd firebase
firebase deploy --only functions
```

Hoặc dùng script:
```bash
node scripts/quick-deploy-functions.js
```

### Bước 3: Set Custom Claims

**Option A: Tự động (cần service account key)**

1. Download service account key:
   - Firebase Console > Project Settings > Service Accounts
   - Generate new private key
   - Save as: `firebase/functions/service-account-key.json`

2. Run script:
```bash
node scripts/setup-custom-claims.js thiennmyy@gmail.com
```

**Option B: Manual (dễ hơn)**

1. Mở Firebase Console > Firestore
2. Tìm document: `users/R5ppocTD7MMJItyoAA6sPnQ0OCzj1`
3. Click Edit
4. Thêm field: `triggerUpdate: true`
5. Save
6. Cloud Function `updateUserClaims` sẽ tự động chạy và set claims

### Bước 4: Verify Claims

Trong browser console (admin app):
```javascript
firebase.auth().currentUser.getIdTokenResult().then(t => {
  console.log('Custom Claims:', t.claims);
});

// Expected: { role: 'admin', isActive: true, ... }
```

### Bước 5: Logout & Login

**Bắt buộc** để refresh token với claims mới!

### Bước 6: Test Upload

1. Vào Media page
2. Upload ảnh
3. Check console - không có Firestore read logs
4. Success! 🎉

## 📊 Kết quả

### Trước (Firestore lookup):
- Upload → Storage Rules → **Firestore read** → Check role → Allow
- Chi phí: 1 read/upload

### Sau (Custom Claims):
- Upload → Storage Rules → **Check token claims** → Allow
- Chi phí: **0 reads** ✨

## 🐛 Troubleshooting

### Nếu vẫn gặp quota limit:

Đợi thêm 2-3 phút, hoặc enable APIs manually:

1. Mở: https://console.cloud.google.com/apis/library
2. Search và enable:
   - Cloud Functions API
   - Cloud Build API
   - Artifact Registry API
3. Chờ 1 phút
4. Deploy lại: `firebase deploy --only functions`

### Nếu claims không được set:

Check Functions logs:
```bash
firebase functions:log
```

Hoặc xem trong Firebase Console > Functions > Logs

## 📝 Scripts có sẵn

```bash
# Deploy tất cả (auto)
node scripts/auto-deploy-all.js

# Deploy chỉ functions
node scripts/quick-deploy-functions.js

# Deploy chỉ storage rules
node scripts/deploy-storage-rules.js

# Set custom claims
node scripts/setup-custom-claims.js <email>
```

## 💡 Tại sao cần Custom Claims?

1. **Nhanh hơn**: Không cần query Firestore
2. **Rẻ hơn**: 0 Firestore reads
3. **Scalable**: Claims được cache trong token
4. **Tự động**: Functions tự động set/update claims

## 🎯 Timeline

- **Bây giờ**: Storage Rules đã deploy ✅
- **+2 phút**: Deploy Functions
- **+5 phút**: Set claims + test upload
- **Total**: ~7 phút để hoàn thành

---

**Current Status**: Waiting for quota limit cooldown (2 minutes)
**Next Action**: Deploy Functions
