# The Design Council - File Structure & Refactoring Guidelines

## Nguyên tắc chia nhỏ file

### Giới hạn kích thước file

| Loại file | Giới hạn tối đa | Hành động khi vượt |
|-----------|-----------------|-------------------|
| Component | 150 dòng | Tách thành sub-components |
| Hook | 100 dòng | Tách logic thành helper functions |
| Utility | 80 dòng | Tách thành nhiều utility files |
| Schema | 100 dòng | Tách thành domain-specific schemas |
| Types | 80 dòng | Tách theo domain |

### Quy tắc chia component

```
# Khi component > 150 dòng, tách theo pattern:

components/features/student-management/
├── StudentList/
│   ├── StudentList.tsx           # Main container (< 100 dòng)
│   ├── StudentListHeader.tsx     # Header với search/filter
│   ├── StudentListTable.tsx      # Table display
│   ├── StudentListPagination.tsx # Pagination controls
│   ├── StudentListFilters.tsx    # Filter panel
│   ├── useStudentList.ts         # Data fetching hook
│   ├── studentList.types.ts      # Types cho feature này
│   ├── studentList.utils.ts      # Helper functions
│   └── index.ts                  # Barrel exports
```

### Quy tắc chia hook

```typescript
// ❌ Sai - Hook quá dài (> 100 dòng)
export function useStudentManagement() {
  // 150+ dòng logic
}

// ✅ Đúng - Tách thành nhiều hooks nhỏ
export function useStudentList(filters: StudentFilters) {
  // Chỉ xử lý list logic
}

export function useStudentMutations() {
  // Chỉ xử lý create/update/delete
}

export function useStudentFilters() {
  // Chỉ xử lý filter state
}
```

## Cấu trúc Feature chuẩn

### Feature đơn giản (< 5 components)

```
features/simple-feature/
├── SimpleFeature.tsx
├── useSimpleFeature.ts
├── simpleFeature.types.ts
└── index.ts
```

### Feature phức tạp (> 5 components)

```
features/complex-feature/
├── components/
│   ├── FeatureHeader.tsx
│   ├── FeatureContent.tsx
│   ├── FeatureFooter.tsx
│   └── index.ts
├── hooks/
│   ├── useFeatureData.ts
│   ├── useFeatureMutations.ts
│   └── index.ts
├── utils/
│   ├── featureHelpers.ts
│   └── index.ts
├── types/
│   ├── feature.types.ts
│   └── index.ts
├── ComplexFeature.tsx          # Main entry component
└── index.ts                    # Public exports
```

## Pattern tách component

### 1. Container/Presenter Pattern

```typescript
// StudentListContainer.tsx - Logic only
export function StudentListContainer() {
  const { data, isLoading, error } = useStudents();
  const [filters, setFilters] = useState<StudentFilters>({});
  
  if (isLoading) return <StudentListSkeleton />;
  if (error) return <StudentListError error={error} />;
  
  return (
    <StudentListPresenter 
      students={data} 
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}

// StudentListPresenter.tsx - UI only
export function StudentListPresenter({ 
  students, 
  filters, 
  onFilterChange 
}: StudentListPresenterProps) {
  return (
    <div>
      <StudentListFilters value={filters} onChange={onFilterChange} />
      <StudentListTable students={students} />
    </div>
  );
}
```

### 2. Compound Component Pattern

```typescript
// Table/Table.tsx
export function Table({ children }: TableProps) {
  return <table className="...">{children}</table>;
}

// Table/TableHeader.tsx
Table.Header = function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
};

// Table/TableBody.tsx
Table.Body = function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
};

// Table/TableRow.tsx
Table.Row = function TableRow({ children }: TableRowProps) {
  return <tr>{children}</tr>;
};

// Usage
<Table>
  <Table.Header>...</Table.Header>
  <Table.Body>...</Table.Body>
</Table>
```

### 3. Render Props / Children Pattern

```typescript
// DataFetcher.tsx - Reusable data fetching wrapper
interface DataFetcherProps<T> {
  queryFn: () => Promise<Result<T>>;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: AppError) => React.ReactNode;
}

export function DataFetcher<T>({ 
  queryFn, 
  children, 
  loadingFallback,
  errorFallback 
}: DataFetcherProps<T>) {
  const { data, isLoading, error } = useQuery({ queryFn });
  
  if (isLoading) return loadingFallback ?? <Spinner />;
  if (error) return errorFallback?.(error) ?? <ErrorMessage error={error} />;
  
  return <>{children(data)}</>;
}
```

## Barrel Exports Pattern

### Cấu trúc index.ts chuẩn

```typescript
// features/student-management/index.ts

// Components
export { StudentList } from './StudentList';
export { StudentCard } from './StudentCard';
export { StudentForm } from './StudentForm';

// Hooks
export { useStudents, useStudent } from './hooks/useStudents';
export { useCreateStudent, useUpdateStudent } from './hooks/useStudentMutations';

// Types (re-export nếu cần public)
export type { StudentListProps, StudentCardProps } from './types';

// KHÔNG export internal components
// ❌ export { StudentListHeader } from './StudentListHeader';
```

## Refactoring Checklist

### Khi nào cần refactor?

- [ ] File > giới hạn dòng cho phép
- [ ] Component có > 3 useState
- [ ] Component có > 2 useEffect
- [ ] Hook có > 5 return values
- [ ] Có logic duplicate giữa các components
- [ ] Component render > 3 conditional branches

### Quy trình refactor

1. **Identify** - Xác định phần cần tách
2. **Extract** - Tách ra file mới
3. **Test** - Đảm bảo không break functionality
4. **Update imports** - Cập nhật barrel exports
5. **Verify** - Chạy lint + typecheck

## Ví dụ thực tế

### Trước refactor

```typescript
// StudentManagement.tsx - 300+ dòng ❌
export function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => { /* fetch students */ }, []);
  useEffect(() => { /* filter logic */ }, [filters]);
  useEffect(() => { /* selected student logic */ }, [selectedStudent]);
  
  // 200+ dòng render logic...
}
```

### Sau refactor

```
student-management/
├── StudentManagement.tsx        # 50 dòng - orchestration
├── components/
│   ├── StudentTable.tsx         # 80 dòng
│   ├── StudentFilters.tsx       # 60 dòng
│   ├── StudentModal.tsx         # 70 dòng
│   └── index.ts
├── hooks/
│   ├── useStudentData.ts        # 40 dòng
│   ├── useStudentFilters.ts     # 30 dòng
│   ├── useStudentSelection.ts   # 25 dòng
│   └── index.ts
└── index.ts
```

## Forbidden Patterns

❌ Không tạo file > giới hạn cho phép
❌ Không có circular imports
❌ Không export internal implementation details
❌ Không có "god components" làm mọi thứ
❌ Không duplicate logic - extract thành shared utils/hooks
❌ Không có deeply nested folder structure (max 3 levels)
