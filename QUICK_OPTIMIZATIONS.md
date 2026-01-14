# ⚡ Quick Optimizations - Implement Now (30 minutes)

## 🎯 3 Optimizations có thể làm ngay

### 1. Update Firestore Rules - Custom Claims (5 phút)

**Vấn đề**: Mỗi query của admin → 1 extra read để check role

**Fix**:

```bash
# Sửa file firebase/firestore.rules
```

Thay đổi function `isAdmin()`:

```javascript
// ❌ Cũ (tốn 1 read mỗi query)
function isAdmin() {
  return isAuthenticated() && getUserDoc().data.role == 'admin';
}

// ✅ Mới (0 extra reads)
function isAdmin() {
  return isAuthenticated() && request.auth.token.role == 'admin';
}
```

**Deploy**:
```bash
cd firebase
firebase deploy --only firestore:rules
```

**Impact**: 
- Savings: ~100-200 reads/day
- Cost: $0.01/day = $0.30/month

---

### 2. Add Notifications Limit (10 phút)

**Vấn đề**: Load tất cả notifications → nhiều reads nếu có nhiều

**Fix**: Thêm limit trong notification repository

File: `packages/firebase/src/repositories/notification.repository.ts`

Tìm function `findByUser` và thêm `limit(50)`:

```typescript
export async function findByUser(userId: string): Promise<Result<Notification[]>> {
  try {
    const q = query(
      collection(db.instance, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50) // ← Thêm dòng này
    );
    
    const snapshot = await getDocs(q);
    // ... rest of code
  }
}
```

**Impact**:
- Savings: 50% reads nếu user có >50 notifications
- Better UX: Faster load time

---

### 3. Dashboard Stats Caching (15 phút)

**Vấn đề**: Mỗi lần load dashboard → query nhiều collections

**Fix**: Cache stats trong TanStack Query với staleTime dài

File: `apps/admin/src/hooks/useDashboardStats.ts`

```typescript
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      // ... existing code
    },
    staleTime: 5 * 60 * 1000, // ← Thêm: Cache 5 phút
    cacheTime: 10 * 60 * 1000, // ← Thêm: Keep in memory 10 phút
  });
}
```

**Impact**:
- Savings: 80% reads (chỉ query mỗi 5 phút thay vì mỗi lần load)
- Dashboard loads: ~50/day → 10 queries/day

---

## 🚀 Implement All 3 Now

### Script tự động:

```bash
# 1. Update Firestore Rules
node scripts/optimize-firestore-rules.js

# 2. Update Notification Repository  
node scripts/optimize-notifications.js

# 3. Update Dashboard Caching
node scripts/optimize-dashboard.js

# 4. Deploy
cd firebase
firebase deploy --only firestore:rules
```

---

## 📊 Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Admin query reads | 500/day | 300/day | **40% ↓** |
| Dashboard reads | 250/day | 50/day | **80% ↓** |
| Notification reads | 200/day | 100/day | **50% ↓** |
| **Total** | **950/day** | **450/day** | **53% ↓** |

**Monthly Savings**: ~$0.90/month

---

## ✅ Checklist

- [ ] Update Firestore Rules với custom claims
- [ ] Add limit(50) trong notification repository
- [ ] Add staleTime trong dashboard hook
- [ ] Deploy Firestore Rules
- [ ] Test admin queries
- [ ] Test dashboard load
- [ ] Test notifications
- [ ] Monitor Firestore usage

---

## 🔍 Verify Optimizations

### 1. Check Firestore Rules:
```bash
cd firebase
cat firestore.rules | grep "function isAdmin"
```

Should see:
```javascript
function isAdmin() {
  return isAuthenticated() && request.auth.token.role == 'admin';
}
```

### 2. Check Notifications Limit:
```bash
grep -n "limit(50)" packages/firebase/src/repositories/notification.repository.ts
```

### 3. Check Dashboard Caching:
```bash
grep -n "staleTime" apps/admin/src/hooks/useDashboardStats.ts
```

---

## 📝 Notes

- Firestore Rules change cần deploy
- Code changes cần rebuild apps
- Test thoroughly sau khi deploy
- Monitor usage trong Firebase Console

---

**Total Time**: 30 minutes
**Total Savings**: $0.90/month
**Difficulty**: Easy ⭐
