# The Design Council - Coding Standards

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Component | PascalCase.tsx | `UserProfile.tsx` |
| Hook | use + camelCase.ts | `useAuth.ts` |
| Utility | camelCase.ts | `formatDate.ts` |
| Constants | camelCase.ts | `errorCodes.ts` |
| Types | camelCase.types.ts | `user.types.ts` |
| Schema | camelCase.schema.ts | `user.schema.ts` |
| Feature Folder | kebab-case | `student-management/` |

## Import Order

Always organize imports in this order:
```typescript
// 1. External packages
import { useState } from 'react';
import { z } from 'zod';

// 2. Shared packages
import { Button } from '@tdc/ui';
import { UserSchema } from '@tdc/schemas';

// 3. Internal aliases
import { useAuth } from '@/hooks/useAuth';
import { UserCard } from '@/components/UserCard';

// 4. Relative imports
import { formatName } from './utils';
```

## Component Structure

```typescript
// 1. Imports
// 2. Types/Interfaces
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

// 3. Component
export function UserCard({ user, onEdit }: UserCardProps): JSX.Element {
  // hooks first
  const [isLoading, setIsLoading] = useState(false);
  
  // handlers
  const handleEdit = () => {
    onEdit(user.id);
  };
  
  // render
  return (
    <div>...</div>
  );
}
```

## Zod Schema Pattern

```typescript
// user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'student']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Auto-generate type from schema
export type User = z.infer<typeof UserSchema>;
```

## Error Handling Pattern

```typescript
// Always use Result type for async operations
type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function getUser(id: string): Promise<Result<User>> {
  try {
    const data = await fetchUser(id);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: mapToAppError(error) };
  }
}
```

## State Management Decision Tree

1. Single component only → `useState`
2. Parent-child sharing → Props
3. Complex state logic → `useReducer`
4. Cross-component sharing → React Context
5. Server data caching → TanStack Query

## Forbidden Patterns

❌ Never hardcode Firebase config
❌ Never use `any` type
❌ Never use inline styles (use Tailwind)
❌ Never create components > 150 lines
❌ Never skip Zod validation for Firestore data
❌ Never use default exports for utilities
