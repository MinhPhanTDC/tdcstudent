# ✅ Test Upload Media - Checklist

## 🎯 Đã hoàn thành

- [x] Sửa Storage Rules để check Firestore thay vì custom claims
- [x] Deploy Storage Rules lên Firebase
- [x] Verify user có role "admin" trong Firestore
- [x] Verify Firebase project đúng (tdcstudent-31d45)

## 📋 Các bước test

### Bước 1: Clear Cache & Refresh

```
1. Mở Admin App trong browser
2. Mở DevTools (F12)
3. Application tab > Storage > Clear site data
4. Hoặc: Ctrl + Shift + Delete > Clear cache
5. Hard refresh: Ctrl + F5
```

### Bước 2: Logout & Login lại

```
1. Click vào avatar góc phải > Logout
2. Đăng nhập lại với:
   Email: thiennmyy@gmail.com
   Password: (mật khẩu của bạn)
3. Verify redirect về Admin Dashboard
```

### Bước 3: Kiểm tra User trong Console

Mở DevTools Console và chạy:

```javascript
// Check session user
const user = JSON.parse(sessionStorage.getItem('tdc_auth_user'));
console.log('✅ User Info:', {
  id: user?.id,
  email: user?.email,
  role: user?.role,
  isActive: user?.isActive
});

// Expected output:
// {
//   id: "R5ppocTD7MMJItyoAA6sPnQ0OCzj1",
//   email: "thiennmyy@gmail.com",
//   role: "admin",
//   isActive: true
// }
```

### Bước 4: Test Upload Media

```
1. Vào trang Media (sidebar > Media)
2. Click nút "Upload"
3. Chọn một file ảnh (JPG/PNG, < 10MB)
4. Chọn category: "login-background"
5. Click Upload
6. Xem Console logs
```

### Bước 5: Verify Upload Success

**Console logs mong đợi:**
```
Starting upload: {name: "test.jpg", type: "image", category: "login-background", size: 123456}
Uploading to: media/login-background/1736784000000_test.jpg
Upload complete, getting URL...
Got URL: https://firebasestorage.googleapis.com/v0/b/tdcstudent-31d45.firebasestorage.app/o/media%2Flogin-background%2F1736784000000_test.jpg?alt=media&token=...
Upload successful: {id: "...", url: "...", name: "test.jpg", ...}
```

**UI mong đợi:**
- File xuất hiện trong danh sách media
- Có thumbnail preview
- Có nút Delete và Toggle Active

### Bước 6: Verify trong Firebase Console

```
1. Mở Firebase Console: https://console.firebase.google.com/project/tdcstudent-31d45
2. Storage > Files
3. Verify có folder: media/login-background/
4. Verify có file vừa upload
5. Firestore Database > media collection
6. Verify có document mới với metadata
```

## 🐛 Nếu vẫn lỗi

### Lỗi: "Permission denied"

**Kiểm tra:**
1. User UID trong session có khớp với document ID trong Firestore không?
2. Field `role` trong Firestore có đúng là `"admin"` không?
3. Storage Rules đã deploy chưa? (check timestamp trong Firebase Console)

**Fix:**
```bash
# Re-deploy storage rules
cd firebase
firebase deploy --only storage

# Đợi 1-2 phút để rules propagate
# Logout và login lại trong app
```

### Lỗi: "Failed to load resource"

**Kiểm tra:**
1. Network tab trong DevTools
2. Xem request nào bị fail
3. Check response error message

**Fix:**
- Check internet connection
- Verify Firebase project settings
- Check .env.local có đúng STORAGE_BUCKET

### Lỗi: "Invalid file type"

**Kiểm tra:**
1. File có phải image không? (JPG, PNG, GIF, WebP)
2. File size < 10MB?

**Fix:**
- Chọn file ảnh hợp lệ
- Compress ảnh nếu quá lớn

## 📊 Test Cases

### Test Case 1: Upload Login Background
- [x] Category: login-background
- [x] File type: image/jpeg
- [x] File size: < 10MB
- [x] Expected: Success, auto-active

### Test Case 2: Upload General Media
- [ ] Category: general
- [ ] File type: image/png
- [ ] File size: < 10MB
- [ ] Expected: Success, not active by default

### Test Case 3: Upload Large File
- [ ] File size: > 10MB
- [ ] Expected: Error "File too large"

### Test Case 4: Upload Non-Image
- [ ] File type: application/pdf
- [ ] Expected: Success (stored as document type)

### Test Case 5: Delete Media
- [ ] Click Delete button
- [ ] Expected: File removed from Storage and Firestore

### Test Case 6: Toggle Active
- [ ] Click Toggle Active button
- [ ] Expected: isActive field updated in Firestore

## 🎉 Success Criteria

Upload thành công khi:
- ✅ Console không có error logs
- ✅ File xuất hiện trong media list
- ✅ File có trong Firebase Storage
- ✅ Metadata có trong Firestore
- ✅ Có thể xem preview ảnh
- ✅ Có thể delete và toggle active

## 📞 Support

Nếu vẫn gặp vấn đề, cung cấp:
1. Screenshot console logs (full error)
2. Screenshot Firebase Storage Rules tab
3. Screenshot Firestore users document
4. User UID đang login (từ console log)
5. Screenshot Network tab (failed requests)

---

**Last Updated:** 2026-01-13
**Storage Rules Version:** Deployed with Firestore lookup
**Firebase Project:** tdcstudent-31d45
