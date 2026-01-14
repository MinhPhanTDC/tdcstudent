# 🔍 Firebase Blaze Plan - Optimization Analysis

## 📊 Current Architecture Analysis

### Repositories Found (16 total):
1. activity.repository
2. base.repository
3. course.repository
4. email-log.repository
5. lab-progress.repository
6. lab-requirement.repository
7. major-course.repository
8. major.repository
9. media.repository ✅ (đã tối ưu)
10. notification.repository
11. progress.repository
12. project-submission.repository
13. semester.repository
14. student.repository
15. tracking-log.repository
16. user.repository

### Query Patterns Found:

#### Admin App:
- **Dashboard Stats**: Multiple queries cho statistics
- **Student Management**: List, search, pagination
- **Course Management**: List by semester, CRUD
- **Tracking**: Complex queries với filters
- **Lab Verification**: Pending approvals
- **Majors**: List, courses per major

#### Student App:
- **My Courses**: Student's enrolled courses
- **My Progress**: Overall progress calculation
- **My Major**: Major courses và progress
- **Notifications**: User notifications
- **Lab Progress**: Lab requirements progress
- **Semester Courses**: Courses by semester

## 🎯 Optimization Opportunities

### 1. ✅ Custom Claims (Đã implement)
**Current**: Storage Rules check Firestore
**Optimized**: Storage Rules check custom claims
**Savings**: 100% Firestore reads on uploads
**Status**: ✅ DONE

### 2. 🔥 Firestore Rules Optimization

**Issue**: `isAdmin()` function trong Firestore Rules:
```javascript
function isAdmin() {
  return isAuthenticated() && getUserDoc().data.role == 'admin';
}
```

**Problem**: Mỗi lần admin query Firestore → 1 extra read để check role

**Solution**: Dùng custom claims trong Firestore Rules:
```javascript
function isAdmin() {
  return isAuthenticated() && request.auth.token.role == 'admin';
}
```

**Impact**:
- Admin queries: ~100-200/day
- Savings: 100-200 reads/day
- Cost savings: ~$0.01/day = $0.30/month

### 3. 🚀 Realtime Database cho Presence

**Current**: Sử dụng Realtime Database cho presence tracking
**Status**: ✅ Đã implement đúng
**Note**: RTDB tốt hơn Firestore cho realtime presence

### 4. 📊 Dashboard Stats Aggregation

**Current**: Query multiple collections để tính stats
**Issue**: Mỗi lần load dashboard → nhiều reads

**Solution**: Cloud Functions scheduled để pre-aggregate stats

**Example**:
```typescript
// Current: Query on-demand
const totalStudents = await getDocs(collection('students'));
const activeStudents = await getDocs(query(collection('students'), where('isActive', '==', true)));

// Optimized: Pre-aggregated
const stats = await getDoc(doc('stats', 'dashboard'));
// stats: { totalStudents: 150, activeStudents: 120, ... }
```

**Impact**:
- Dashboard loads: ~50/day
- Current reads: ~5 reads/load = 250 reads/day
- Optimized reads: 1 read/load = 50 reads/day
- Savings: 200 reads/day = $0.01/day

### 5. 🔔 Notifications Optimization

**Current**: Query notifications mỗi lần load
**Issue**: Có thể có nhiều notifications cũ

**Solution**: 
- Limit notifications (chỉ lấy 50 gần nhất)
- Archive old notifications
- Use pagination

### 6. 📈 Progress Calculation

**Current**: Calculate progress on-demand từ multiple collections
**Issue**: Complex queries, nhiều reads

**Solution**: Cloud Functions trigger để update progress khi có thay đổi

**Example**:
```typescript
// Trigger khi progress document update
export const updateStudentProgress = functions.firestore
  .document('progress/{progressId}')
  .onUpdate(async (change, context) => {
    // Calculate overall progress
    // Update student document với cached progress
  });
```

### 7. 🗂️ Composite Indexes

**Current**: Có thể thiếu indexes cho complex queries
**Check**: `firebase/firestore.indexes.json`

**Action**: Review và add indexes cho:
- Tracking queries với multiple filters
- Student search queries
- Course queries by semester + status

## 💰 Cost Estimation

### Current Usage (Estimated):

| Operation | Reads/Day | Cost/Day | Cost/Month |
|-----------|-----------|----------|------------|
| Admin queries | 500 | $0.03 | $0.90 |
| Student queries | 1000 | $0.06 | $1.80 |
| Dashboard stats | 250 | $0.01 | $0.30 |
| Notifications | 200 | $0.01 | $0.30 |
| **Total** | **1950** | **$0.11** | **$3.30** |

### After Optimization:

| Operation | Reads/Day | Cost/Day | Cost/Month | Savings |
|-----------|-----------|----------|------------|---------|
| Admin queries | 300 | $0.02 | $0.60 | 40% ↓ |
| Student queries | 800 | $0.05 | $1.50 | 20% ↓ |
| Dashboard stats | 50 | $0.00 | $0.00 | 80% ↓ |
| Notifications | 100 | $0.01 | $0.30 | 50% ↓ |
| **Total** | **1250** | **$0.08** | **$2.40** | **27% ↓** |

**Annual Savings**: ~$11/year

## 🎯 Recommended Optimizations (Priority Order)

### Priority 1: High Impact, Low Effort

1. **✅ Custom Claims in Storage Rules** (DONE)
   - Impact: 100% reduction in upload reads
   - Effort: 1 hour
   - Status: ✅ Completed

2. **🔥 Custom Claims in Firestore Rules**
   - Impact: 40% reduction in admin queries
   - Effort: 30 minutes
   - Status: ⏳ Recommended

3. **📊 Dashboard Stats Aggregation**
   - Impact: 80% reduction in dashboard reads
   - Effort: 2 hours
   - Status: ⏳ Recommended

### Priority 2: Medium Impact, Medium Effort

4. **📈 Progress Caching**
   - Impact: 30% reduction in progress queries
   - Effort: 3 hours
   - Status: 💡 Optional

5. **🔔 Notifications Pagination**
   - Impact: 50% reduction in notification reads
   - Effort: 1 hour
   - Status: 💡 Optional

### Priority 3: Low Impact, High Effort

6. **🗂️ Query Optimization**
   - Impact: 10-20% overall reduction
   - Effort: 4-6 hours
   - Status: 💡 Future

## 🚀 Quick Wins (Implement Now)

### 1. Update Firestore Rules (5 minutes)

```javascript
// firebase/firestore.rules
function isAdmin() {
  // Old: return isAuthenticated() && getUserDoc().data.role == 'admin';
  // New: Use custom claims (0 extra reads)
  return isAuthenticated() && request.auth.token.role == 'admin';
}
```

### 2. Add Notifications Limit (10 minutes)

```typescript
// packages/firebase/src/repositories/notification.repository.ts
export async function findByUser(userId: string): Promise<Result<Notification[]>> {
  const q = query(
    collection(db.instance, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50) // Add this line
  );
  // ...
}
```

### 3. Dashboard Stats Cloud Function (30 minutes)

Create scheduled function to aggregate stats every hour.

## 📝 Implementation Plan

### Week 1: Quick Wins
- [ ] Update Firestore Rules với custom claims
- [ ] Add notifications limit
- [ ] Test và verify

### Week 2: Dashboard Optimization
- [ ] Create stats aggregation Cloud Function
- [ ] Schedule function (every hour)
- [ ] Update dashboard to use aggregated stats

### Week 3: Progress Caching
- [ ] Create progress update triggers
- [ ] Cache progress in student documents
- [ ] Update queries to use cached data

### Week 4: Testing & Monitoring
- [ ] Monitor Firestore usage
- [ ] Verify cost reduction
- [ ] Document optimizations

## 🔍 Monitoring

### Firebase Console Metrics:
- Firestore > Usage tab
- Functions > Dashboard
- Storage > Usage

### Key Metrics to Track:
- Document reads/day
- Function invocations/day
- Storage downloads/day
- Monthly cost trend

## 💡 Additional Recommendations

### 1. Enable Firestore Caching
```typescript
// In Firebase config
enableIndexedDbPersistence(db.instance);
```

### 2. Use TanStack Query Caching
```typescript
// Already implemented ✅
// staleTime, cacheTime configured
```

### 3. Implement Request Deduplication
```typescript
// TanStack Query already handles this ✅
```

### 4. Add Loading Skeletons
- Reduce perceived load time
- Better UX while queries run

## 🎯 Expected Results

After implementing all optimizations:

- **Firestore Reads**: 27% reduction
- **Response Time**: 20-30% faster
- **Monthly Cost**: $0.90 savings
- **User Experience**: Improved perceived performance

## 📚 Resources

- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Optimization](https://firebase.google.com/docs/functions/tips)
- [Custom Claims Guide](https://firebase.google.com/docs/auth/admin/custom-claims)

---

**Status**: Analysis complete
**Next Action**: Implement Priority 1 optimizations
**Estimated Time**: 1 hour
**Expected Savings**: $0.50/month
