# ✅ Functions Deployed Successfully!

## 🎉 Đã deploy 3 Cloud Functions:

1. ✅ **setUserClaims** - Auto set claims khi tạo user mới
2. ✅ **updateUserClaims** - Auto update claims khi role thay đổi  
3. ✅ **refreshUserClaims** - Callable function để force refresh

## 🔧 Bây giờ: Set Custom Claims cho Admin User

### Cách 1: Trigger Function qua Firestore (Dễ nhất - Khuyến nghị)

1. **Mở Firebase Console**: https://console.firebase.google.com/project/tdcstudent-31d45/firestore

2. **Tìm user document**:
   - Collection: `users`
   - Document ID: `R5ppocTD7MMJItyoAA6sPnQ0OCzj1`
   - Email: `thiennmyy@gmail.com`

3. **Edit document**:
   - Click vào document
   - Click "Edit" (icon bút chì)
   - Thêm field mới:
     - Field: `triggerUpdate`
     - Type: `boolean`
     - Value: `true`
   - Click "Update"

4. **Verify trong Functions Logs**:
   - Firebase Console > Functions > Logs
   - Xem log: "Custom claims updated for user..."
   - Hoặc chạy: `firebase functions:log --only updateUserClaims`

### Cách 2: Dùng Script (Cần Service Account Key)

**Bước 1**: Download Service Account Key
1. Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save file as: `firebase/functions/service-account-key.json`
4. ⚠️ **KHÔNG commit file này vào git!**

**Bước 2**: Run script
```bash
node scripts/setup-custom-claims.js thiennmyy@gmail.com
```

### Cách 3: Manual trong Firebase Console

1. Firebase Console > Authentication > Users
2. Click vào user `thiennmyy@gmail.com`
3. Scroll xuống "Custom claims"
4. Click "Edit"
5. Paste JSON:
```json
{
  "role": "admin",
  "isActive": true
}
```
6. Save

## ✅ Verify Claims đã được set

### Trong Browser Console (Admin App):

```javascript
// Get current token with claims
firebase.auth().currentUser.getIdTokenResult().then(token => {
  console.log('Custom Claims:', token.claims);
});

// Expected output:
// {
//   role: 'admin',
//   isActive: true,
//   iss: '...',
//   aud: '...',
//   ...
// }
```

### Check Firestore Document:

Sau khi function chạy, document sẽ có thêm:
- `claimsSet: true`
- `claimsSetAt: <timestamp>`

## 🔄 Logout & Login (Bắt buộc!)

Sau khi set claims, user **PHẢI logout và login lại** để refresh token:

1. Admin App > Click avatar > Logout
2. Login lại với email: `thiennmyy@gmail.com`
3. Token mới sẽ có custom claims

## 🧪 Test Upload Media

1. Vào Media page
2. Upload một ảnh
3. **Check Console** - không có Firestore read logs
4. **Check Functions Logs** - không có function calls
5. **Success!** Upload dùng custom claims (0 reads) 🎉

## 📊 So sánh Performance

### Trước (Firestore lookup):
```
Upload → Storage Rules → Firestore read → Check role → Allow
Time: ~200ms | Cost: 1 read
```

### Sau (Custom Claims):
```
Upload → Storage Rules → Check token claims → Allow
Time: ~50ms | Cost: 0 reads
```

**Nhanh hơn 4x và FREE!** ✨

## 🔍 Monitor Functions

### View logs:
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only setUserClaims
firebase functions:log --only updateUserClaims
firebase functions:log --only refreshUserClaims
```

### View metrics:
Firebase Console > Functions > Dashboard

## 🎯 Next Steps

1. ✅ Set claims (chọn 1 trong 3 cách trên)
2. ✅ Verify claims trong browser console
3. ✅ Logout và login lại
4. ✅ Test upload media
5. ✅ Celebrate! 🎉

---

**Khuyến nghị**: Dùng **Cách 1** (trigger qua Firestore) - dễ nhất và không cần service account key!
