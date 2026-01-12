# The Design Council - Error & Warning Handling Policy

## Zero Tolerance Policy

Mọi lỗi và warning phải được fix ngay lập tức khi phát hiện. Không được để lại "technical debt" dưới dạng lỗi hoặc warning chưa xử lý.

## Quy tắc bắt buộc

### 1. TypeScript Errors

❌ KHÔNG BAO GIỜ commit code có TypeScript errors
❌ KHÔNG sử dụng `@ts-ignore` hoặc `@ts-expect-error` trừ khi có comment giải thích rõ ràng
❌ KHÔNG sử dụng `any` type - luôn định nghĩa type cụ thể

```typescript
// ❌ Sai
const data: any = fetchData();
// @ts-ignore
const result = data.unknownMethod();

// ✅ Đúng
interface ApiResponse {
  items: Item[];
  total: number;
}
const data: ApiResponse = await fetchData();
```

### 2. ESLint Warnings & Errors

❌ KHÔNG commit code có ESLint errors
❌ KHÔNG sử dụng `eslint-disable` trừ khi thực sự cần thiết và có comment giải thích
⚠️ ESLint warnings phải được fix trong cùng PR/commit

```typescript
// ❌ Sai - disable không có lý do
// eslint-disable-next-line
const unused = 'value';

// ✅ Đúng - nếu thực sự cần disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Third-party library returns any
const externalData: any = thirdPartyLib.getData();
```

### 3. Console Warnings (React, Next.js)

❌ KHÔNG để lại React key warnings
❌ KHÔNG để lại hydration mismatch warnings
❌ KHÔNG để lại deprecated API warnings

```typescript
// ❌ Sai
{items.map(item => <Item {...item} />)}

// ✅ Đúng
{items.map(item => <Item key={item.id} {...item} />)}
```

### 4. Build Warnings

❌ KHÔNG ignore build warnings
❌ Fix tất cả unused imports/variables
❌ Fix tất cả missing dependencies trong useEffect

```typescript
// ❌ Sai - missing dependency
useEffect(() => {
  fetchUser(userId);
}, []); // Warning: missing dependency 'userId'

// ✅ Đúng
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

## Quy trình xử lý

### Khi phát hiện lỗi/warning

1. **Dừng lại** - Không tiếp tục code thêm
2. **Fix ngay** - Xử lý lỗi/warning trước khi làm tiếp
3. **Verify** - Chạy lại build/lint để đảm bảo đã fix xong
4. **Commit** - Chỉ commit khi không còn lỗi/warning

### Trước khi commit

```bash
# Chạy tất cả checks
pnpm lint        # Không có errors/warnings
pnpm typecheck   # Không có TypeScript errors
pnpm build       # Build thành công không warnings
```

### Trong CI/CD

- Build phải fail nếu có bất kỳ error nào
- Warnings được treat as errors trong production build

## Cấu hình khuyến nghị

### ESLint - Treat warnings as errors

```javascript
// .eslintrc.js
module.exports = {
  // ... other config
  rules: {
    // Upgrade warnings to errors
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
};
```

### TypeScript - Strict mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Next.js - Strict build

```javascript
// next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: false, // KHÔNG ignore ESLint errors
  },
  typescript: {
    ignoreBuildErrors: false, // KHÔNG ignore TS errors
  },
};
```

## Lý do

1. **Lỗi tích lũy** - 1 warning hôm nay = 100 warnings sau 1 tháng
2. **Khó debug** - Nhiều warnings làm khó phát hiện warnings mới quan trọng
3. **Code quality** - Warnings thường chỉ ra potential bugs
4. **Team productivity** - Dễ maintain codebase sạch hơn codebase nhiều lỗi

## Ngoại lệ

Chỉ được phép bỏ qua warning/error khi:

1. Là bug của third-party library (phải có issue link)
2. Là false positive đã được verify (phải có comment giải thích)
3. Đã được team lead approve (phải có comment với tên người approve)

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Reason: Firebase SDK returns any for custom claims
// Approved by: [Team Lead Name] on [Date]
// Issue: https://github.com/firebase/firebase-js-sdk/issues/XXXX
const claims: any = user.customClaims;
```
