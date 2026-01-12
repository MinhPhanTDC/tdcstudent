# Design Document: UI Integration Fixes

## Overview

Spec này giải quyết các vấn đề về UI integration đã được phát hiện trong quá trình kiểm tra codebase từ Phase 1-7. Thiết kế tập trung vào việc tích hợp các services/repositories đã tồn tại vào UI, bổ sung các link navigation còn thiếu, và hoàn thiện các pages có nội dung placeholder.

### Scope

- Thêm link "Lab Training" vào AdminSidebar
- Tạo hệ thống notifications UI cho student portal
- Tích hợp TrackingLogList vào tracking page với modal
- Hoàn thiện Progress page cho student
- Thêm notification bell indicator vào StudentSidebar

### Out of Scope

- Tạo mới notification service/repository (đã tồn tại)
- Tạo mới tracking log service/repository (đã tồn tại)
- Thay đổi logic business của notifications
- Real-time notifications với WebSocket (sử dụng polling hoặc refetch on focus)

## Architecture

### Component Hierarchy

```
apps/admin/
├── components/layout/
│   └── AdminSidebar.tsx (UPDATE - thêm Lab Training link)
├── components/features/tracking/
│   ├── TrackingRow.tsx (UPDATE - thêm nút Lịch sử)
│   └── TrackingLogModal/ (NEW)
│       ├── TrackingLogModal.tsx
│       └── index.ts

apps/student/
├── components/layout/
│   └── StudentSidebar.tsx (UPDATE - thêm notification bell + badge)
├── app/(portal)/
│   ├── notifications/
│   │   └── page.tsx (NEW)
│   └── progress/
│       └── page.tsx (UPDATE - implement full UI)
├── components/features/
│   ├── notifications/ (NEW)
│   │   ├── NotificationList.tsx
│   │   ├── NotificationItem.tsx
│   │   └── index.ts
│   └── progress/ (UPDATE)
│       ├── ProgressOverview.tsx (NEW)
│       ├── SemesterProgress.tsx (NEW)
│       └── CourseProgressItem.tsx (NEW)
├── hooks/
│   └── useNotifications.ts (NEW)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student Portal                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  StudentSidebar ──────────────────────────────────────────────┐ │
│       │                                                        │ │
│       ▼                                                        │ │
│  useNotifications() ◄──── NotificationService                  │ │
│       │                         │                              │ │
│       ▼                         ▼                              │ │
│  NotificationBell          NotificationRepository              │ │
│  (unread count)                  │                             │ │
│       │                         ▼                              │ │
│       ▼                    Firestore                           │ │
│  /notifications ──► NotificationsPage                          │ │
│                          │                                     │ │
│                          ▼                                     │ │
│                    NotificationList                            │ │
│                          │                                     │ │
│                          ▼                                     │ │
│                    NotificationItem                            │ │
│                                                                │ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Admin Portal                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TrackingRow ──────────────────────────────────────────────────┐│
│       │                                                         ││
│       ▼                                                         ││
│  "Lịch sử" button                                               ││
│       │                                                         ││
│       ▼                                                         ││
│  TrackingLogModal ◄──── useTrackingLogs()                      ││
│       │                      │                                  ││
│       ▼                      ▼                                  ││
│  TrackingLogList      TrackingLogRepository                    ││
│                              │                                  ││
│                              ▼                                  ││
│                         Firestore                               ││
│                                                                 ││
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. AdminSidebar Update

```typescript
// apps/admin/src/components/layout/AdminSidebar.tsx
// Thêm vào navItems array sau "Tracking"

const navItems: NavItem[] = [
  // ... existing items
  {
    label: 'Tracking',
    href: '/tracking',
    icon: <TrackingIcon />,
  },
  // NEW: Lab Training link
  {
    label: 'Lab Training',
    href: '/lab-settings',
    icon: <FlaskIcon />, // SVG flask/beaker icon
  },
  // ... rest of items
];
```

### 2. useNotifications Hook

```typescript
// apps/student/src/hooks/useNotifications.ts

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: AppError | null;
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  // Implementation using TanStack Query
  // Fetches from notificationService.getNotificationsForUser()
}
```

### 3. NotificationList Component

```typescript
// apps/student/src/components/features/notifications/NotificationList.tsx

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  isLoading?: boolean;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  isLoading,
}: NotificationListProps): JSX.Element;
```

### 4. NotificationItem Component

```typescript
// apps/student/src/components/features/notifications/NotificationItem.tsx

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

// Styling based on notification type:
// - course_completed: success (green) + checkmark icon
// - course_rejected: warning (yellow/orange) + alert icon  
// - course_unlocked: info (blue) + unlock icon
// - semester_unlocked: info (blue) + calendar icon
```

### 5. TrackingLogModal Component

```typescript
// apps/admin/src/components/features/tracking/TrackingLogModal/TrackingLogModal.tsx

interface TrackingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  courseId: string;
  studentName: string;
  courseName: string;
}

export function TrackingLogModal({
  isOpen,
  onClose,
  studentId,
  courseId,
  studentName,
  courseName,
}: TrackingLogModalProps): JSX.Element;
```

### 6. Progress Page Components

```typescript
// apps/student/src/components/features/progress/ProgressOverview.tsx
interface ProgressOverviewProps {
  completionPercentage: number;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
}

// apps/student/src/components/features/progress/SemesterProgress.tsx
interface SemesterProgressProps {
  semester: {
    id: string;
    name: string;
    courses: CourseProgress[];
  };
  isExpanded: boolean;
  onToggle: () => void;
}

// apps/student/src/components/features/progress/CourseProgressItem.tsx
interface CourseProgressItemProps {
  course: {
    id: string;
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'locked';
  };
}
```

## Data Models

### Existing Models (No Changes)

```typescript
// packages/schemas/src/notification.schema.ts (đã tồn tại)
interface Notification {
  id: string;
  userId: string;
  type: 'course_completed' | 'course_rejected' | 'course_unlocked' | 'semester_unlocked';
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// packages/schemas/src/tracking-log.schema.ts (đã tồn tại)
interface TrackingLog {
  id: string;
  studentId: string;
  courseId: string;
  action: TrackingAction;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy: string;
  performedAt: Date;
  createdAt: Date;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified:

### Property 1: Unread badge count matches unread notifications
*For any* list of notifications, the badge count displayed on the notification menu item should equal the count of notifications where `isRead` is `false`.
**Validates: Requirements 2.2, 5.2**

### Property 2: Notifications sorted by date descending
*For any* list of notifications displayed on the notifications page, each notification's `createdAt` timestamp should be greater than or equal to the next notification's `createdAt` timestamp.
**Validates: Requirements 2.5**

### Property 3: Mark as read updates notification state
*For any* notification, when `markAsRead` is called with that notification's ID, the notification's `isRead` property should become `true` and the unread count should decrease by 1.
**Validates: Requirements 2.6, 6.6**

### Property 4: Tracking log displays all required fields
*For any* tracking log entry displayed in TrackingLogList, the rendered output should contain: action type, timestamp, and performer ID. If `previousValue` or `newValue` exists, they should also be displayed.
**Validates: Requirements 3.4**

### Property 5: Progress percentage calculation
*For any* progress data, the overall completion percentage should equal `(completedCourses / totalCourses) * 100`, rounded to the nearest integer.
**Validates: Requirements 4.2, 4.3**

### Property 6: Unread count computation
*For any* array of notifications returned by `useNotifications`, the `unreadCount` value should equal the length of notifications filtered by `isRead === false`.
**Validates: Requirements 6.3**

## Error Handling

### Network Errors
- All data fetching hooks should handle network errors gracefully
- Display user-friendly error messages in Vietnamese
- Provide retry functionality where appropriate

### Empty States
- Notifications page: "Bạn chưa có thông báo nào"
- Tracking logs modal: "Chưa có lịch sử thay đổi"
- Progress page: "Bắt đầu học để theo dõi tiến độ của bạn"

### Loading States
- Use skeleton components for all loading states
- Maintain layout stability during loading

### Error Codes
```typescript
// Reuse existing error codes from @tdc/types
ErrorCode.NETWORK_ERROR    // Network request failed
ErrorCode.UNAUTHORIZED     // User not authenticated
ErrorCode.USER_NOT_FOUND   // User data not found
ErrorCode.DATABASE_ERROR   // Firestore operation failed
```

## Testing Strategy

### Property-Based Testing Library
- **Library**: fast-check (đã được cài đặt trong project)
- **Minimum iterations**: 100 per property test

### Unit Tests
Unit tests will cover:
- Component rendering with various props
- Hook return values and state management
- Navigation behavior
- Conditional styling based on notification/course status

### Property-Based Tests
Property tests will verify:
1. **Unread count invariant**: Badge count always matches actual unread count
2. **Sort order invariant**: Notifications always sorted by date descending
3. **Mark as read state change**: isRead always becomes true after markAsRead
4. **Tracking log field presence**: All required fields always displayed
5. **Progress calculation**: Percentage always computed correctly
6. **Unread count computation**: unreadCount always equals filtered count

### Test File Locations
```
apps/student/src/hooks/__tests__/useNotifications.property.test.ts
apps/student/src/components/features/notifications/__tests__/NotificationList.property.test.ts
apps/student/src/app/(portal)/progress/__tests__/ProgressPage.property.test.ts
apps/admin/src/components/features/tracking/__tests__/TrackingLogModal.property.test.ts
```

### Test Annotation Format
Each property-based test must include:
```typescript
/**
 * **Feature: ui-integration-fixes, Property {number}: {property_text}**
 * **Validates: Requirements {X.Y}**
 */
```
