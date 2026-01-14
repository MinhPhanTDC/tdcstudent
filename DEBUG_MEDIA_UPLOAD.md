# Debug Media Upload Issue

## ✅ Đã hoàn thành

1. ✅ Sửa Storage Rules để check role từ Firestore
2. ✅ Deploy Storage Rules lên Firebase thành công
3. ✅ Verify user có role "admin" trong Firestore

## 🔍 Kiểm tra tiếp theo

### 1. Verify Storage Rules đã active

Mở Firebase Console:
- Storage > Rules tab
- Xem version mới nhất (vừa deploy)
- Verify có function `isAdmin()` check Firestore

### 2. Check user đang login trong Admin App

Mở Admin App trong browser:
1. Mở DevTools Console (F12)
2. Chạy lệnh sau để xem user info:

```javascript
// Get current user from session
const user = JSON.parse(sessionStorage.getItem('tdc_auth_user'));
console.log('Current User:', user);
console.log('User ID:', user?.id);
console.log('User Role:', user?.role);
console.log('User Email:', user?.email);

// Get Firebase Auth user
firebase.auth().currentUser.then(authUser => {
  console.log('Firebase Auth UID:', authUser?.uid);
  console.log('Firebase Auth Email:', authUser?.email);
});
```

### 3. Verify Firestore user document

Kiểm tra trong Firebase Console:
1. Firestore Database > users collection
2. Tìm document với ID = User UID từ bước 2
3. Verify fields:
   - `role: "admin"` ✅
   - `email: "thiennmyy@gmail.com"` ✅
   - `isActive: true` ✅

### 4. Test upload lại

1. **Clear browser cache**: Ctrl + Shift + Delete
2. **Hard refresh**: Ctrl + F5
3. **Logout và login lại** để refresh session
4. Vào Media page
5. Thử upload ảnh

### 5. Check Console Logs

Khi upload, xem console logs:

**Logs thành công:**
```
Starting upload: {name: "image.jpg", type: "image", category: "login-background", size: 123456}
Uploading to: media/login-background/1234567890_image.jpg
Upload complete, getting URL...
Got URL: https://firebasestorage.googleapis.com/...
Upload successful: {id: "...", url: "...", ...}
```

**Logs lỗi (nếu còn):**
```
Upload error: FirebaseError: Firebase Storage: User does not have permission...
```

## 🐛 Nếu vẫn lỗi

### Kiểm tra 1: User UID khớp với Firestore document ID

```javascript
// Trong browser console
const sessionUser = JSON.parse(sessionStorage.getItem('tdc_auth_user'));
const authUser = await firebase.auth().currentUser;

console.log('Session User ID:', sessionUser?.id);
console.log('Auth User UID:', authUser?.uid);
console.log('Match:', sessionUser?.id === authUser?.uid);
```

Nếu **không khớp**, cần logout và login lại.

### Kiểm tra 2: Storage Rules syntax

Xem file `firebase/storage.rules` có đúng syntax:

```javascript
function isAdmin() {
  return isAuthenticated() && 
    firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Kiểm tra 3: IAM Permissions

Firebase Console > Storage > Rules tab:
- Verify có message: "Cross-service rules enabled"
- Nếu không, chạy lại: `firebase deploy --only storage`

### Kiểm tra 4: Wait for propagation

Storage rules có thể mất 1-2 phút để propagate:
- Đợi 2 phút
- Clear cache
- Thử lại

## 🔧 Debug Commands

### Check Firebase project
```bash
firebase projects:list
firebase use
```

### Check Storage Rules
```bash
cd firebase
cat storage.rules
firebase deploy --only storage --dry-run
```

### Re-deploy if needed
```bash
cd firebase
firebase deploy --only storage
```

## 📊 Expected Behavior

### Upload Flow:
1. User clicks Upload button
2. File selected
3. `mediaRepository.create()` called
4. Upload to Storage: `media/login-background/timestamp_filename.jpg`
5. Storage Rules check:
   - User authenticated? ✅
   - Get user from Firestore: `/users/{uid}`
   - Check `role == "admin"`? ✅
   - Allow upload ✅
6. Get download URL
7. Save metadata to Firestore `media` collection
8. Display in media list

### Storage Path:
```
media/
  ├── login-background/
  │   ├── 1234567890_image1.jpg
  │   └── 1234567891_image2.png
  ├── handbook/
  │   └── handbook.pdf
  └── course-materials/
      └── ...
```

## 🎯 Next Steps

Sau khi upload thành công:

1. ✅ Verify file xuất hiện trong Storage bucket
2. ✅ Verify metadata trong Firestore `media` collection
3. ✅ Test toggle active/inactive
4. ✅ Test delete media
5. ✅ Test upload handbook PDF
6. ✅ Test login background rotation

## 📝 Notes

- Storage Rules check Firestore mỗi lần upload (1 read operation)
- Chi phí: ~$0.06 per 100,000 reads (rất rẻ)
- Alternative: Implement Cloud Functions để set custom claims (phức tạp hơn)

## 🆘 Nếu vẫn không được

Hãy cung cấp:
1. Screenshot console logs khi upload
2. Screenshot Storage Rules trong Firebase Console
3. Screenshot user document trong Firestore
4. User UID đang login (từ console)
