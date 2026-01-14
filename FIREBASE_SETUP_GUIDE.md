# Firebase Setup Guide - Fix Media Upload Issue

## 🔍 Vấn đề hiện tại

Khi upload media trong Admin app, gặp lỗi:
```
Firebase Storage: User does not have permission to access 'media/login-background/...'
```

## 🎯 Nguyên nhân

Storage rules yêu cầu check `isAdmin()` từ **custom claims**, nhưng Firebase Auth chưa set custom claims cho user.

Custom claims chỉ có thể set từ Firebase Admin SDK (backend/Cloud Functions), không thể set từ client.

## ✅ Giải pháp đã áp dụng

Đã sửa Storage Rules để check role từ **Firestore** thay vì custom claims:

```javascript
// Trước (không hoạt động)
function isAdmin() {
  return isAuthenticated() && request.auth.token.role == 'admin';
}

// Sau (hoạt động)
function isAdmin() {
  return isAuthenticated() && 
    firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## 🚀 Các bước deploy

### Bước 1: Login Firebase CLI

```bash
firebase login
```

Nếu gặp lỗi, thử:
```bash
firebase login --no-localhost
```

Sau đó làm theo hướng dẫn:
1. Copy session ID
2. Mở link trong browser
3. Đăng nhập Google account có quyền truy cập Firebase project
4. Copy authorization code
5. Paste vào terminal

### Bước 2: Kiểm tra project

```bash
# Xem danh sách projects
firebase projects:list

# Set project hiện tại
cd firebase
firebase use tdcstudent-31d45
```

### Bước 3: Deploy Storage Rules

**Option A: Deploy chỉ Storage Rules (Nhanh)**
```bash
cd firebase
firebase deploy --only storage
```

**Option B: Dùng script có sẵn**
```bash
node scripts/deploy-storage-rules.js
```

**Option C: Deploy tất cả rules**
```bash
cd firebase
firebase deploy --only firestore:rules,storage
```

### Bước 4: Verify

1. Refresh admin app trong browser
2. Thử upload media lại
3. Check console - không còn permission error

## 🔐 Kiểm tra User Role trong Firestore

Đảm bảo user hiện tại có role `admin` trong Firestore:

### Cách 1: Firebase Console
1. Mở https://console.firebase.google.com/
2. Chọn project `tdcstudent-31d45`
3. Vào **Firestore Database**
4. Tìm collection `users`
5. Tìm document với ID = User UID đang login
6. Kiểm tra field `role` = `"admin"`

### Cách 2: Dùng Firebase CLI
```bash
# Get current user UID from browser console
# Trong admin app, mở DevTools Console và chạy:
# firebase.auth().currentUser.uid

# Sau đó query Firestore
firebase firestore:get users/<USER_UID>
```

### Cách 3: Tạo admin user mới (nếu chưa có)

Trong Firebase Console:

1. **Authentication** > **Users** > **Add user**
   - Email: admin@example.com
   - Password: (tạo password mạnh)
   - Copy User UID

2. **Firestore Database** > **users** collection > **Add document**
   - Document ID: (paste User UID từ bước 1)
   - Fields:
     ```
     id: <USER_UID>
     email: "admin@example.com"
     displayName: "Admin"
     role: "admin"
     isActive: true
     createdAt: (timestamp - now)
     updatedAt: (timestamp - now)
     lastLoginAt: null
     ```

## 🐛 Troubleshooting

### Lỗi: "Failed to authenticate"
```bash
firebase logout
firebase login
```

### Lỗi: "Permission denied" sau khi deploy
- Đợi 1-2 phút để rules được propagate
- Clear browser cache và refresh
- Kiểm tra user có role admin trong Firestore

### Lỗi: "Realtime Database not configured"
Đây chỉ là warning, không ảnh hưởng upload. Nếu muốn tắt warning:

**Option 1: Enable Realtime Database**
1. Firebase Console > Realtime Database > Create Database
2. Chọn region: asia-southeast1
3. Start in locked mode
4. Copy Database URL
5. Thêm vào `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tdcstudent-31d45-default-rtdb.asia-southeast1.firebasedatabase.app
   ```

**Option 2: Remove Realtime Database init**
Sửa `packages/firebase/src/config.ts` để không init RTDB nếu không cần.

## 📊 Kiểm tra Storage Rules hiện tại

```bash
cd firebase
cat storage.rules
```

Hoặc xem trong Firebase Console:
1. Storage > Rules tab
2. Xem version history
3. Verify rules đã được deploy

## 🎯 Next Steps

Sau khi deploy storage rules thành công:

1. ✅ Test upload media trong admin app
2. ✅ Test upload handbook PDF
3. ✅ Test upload login background images
4. ✅ Verify files xuất hiện trong Storage bucket
5. ✅ Verify metadata được lưu trong Firestore `media` collection

## 📝 Notes

- Storage rules check Firestore sẽ tốn thêm 1 read operation mỗi lần upload
- Với admin app, chi phí này không đáng kể
- Nếu cần optimize, có thể implement Cloud Functions để set custom claims

## 🔗 Resources

- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [Firestore in Storage Rules](https://firebase.google.com/docs/storage/security/rules-conditions#firestore)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
