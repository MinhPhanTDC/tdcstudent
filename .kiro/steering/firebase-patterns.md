# The Design Council - Firebase Patterns

## Firestore Data Access Pattern

Always validate data with Zod when reading/writing:

```typescript
// packages/firebase/src/firestore.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserSchema, type User } from '@tdc/schemas';

export async function getUser(userId: string): Promise<Result<User>> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: new AppError('USER_NOT_FOUND') };
    }
    
    // Always validate with Zod
    const parsed = UserSchema.safeParse(docSnap.data());
    if (!parsed.success) {
      return { success: false, error: new AppError('INVALID_DATA', parsed.error) };
    }
    
    return { success: true, data: parsed.data };
  } catch (error) {
    return { success: false, error: mapFirebaseError(error) };
  }
}
```

## Firebase Auth Pattern

```typescript
// packages/firebase/src/auth.ts
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export async function login(email: string, password: string): Promise<Result<AuthUser>> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userResult = await getUser(credential.user.uid);
    
    if (!userResult.success) {
      return userResult;
    }
    
    return { success: true, data: userResult.data };
  } catch (error) {
    return { success: false, error: mapFirebaseError(error) };
  }
}
```

## Firebase Error Mapping

```typescript
// packages/firebase/src/errors.ts
const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/user-not-found': 'USER_NOT_FOUND',
  'auth/wrong-password': 'INVALID_CREDENTIALS',
  'auth/email-already-in-use': 'EMAIL_EXISTS',
  'auth/too-many-requests': 'TOO_MANY_ATTEMPTS',
  'permission-denied': 'UNAUTHORIZED',
};

export function mapFirebaseError(error: unknown): AppError {
  if (error instanceof FirebaseError) {
    const code = FIREBASE_ERROR_MAP[error.code] || 'UNKNOWN_ERROR';
    return new AppError(code, error.message);
  }
  return new AppError('UNKNOWN_ERROR');
}
```

## Firestore Collection Structure

```
/users/{userId}
  - id: string
  - email: string
  - role: 'admin' | 'student'
  - displayName: string
  - createdAt: timestamp
  - updatedAt: timestamp

/students/{studentId}
  - userId: string (reference to users)
  - enrolledCourses: string[]
  - progress: Record<courseId, number>
  - createdAt: timestamp
  - updatedAt: timestamp

/courses/{courseId}
  - id: string
  - title: string
  - description: string
  - lessons: Lesson[]
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Security Rules Template

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isAdmin();
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow write: if isAdmin();
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

## Environment Variables

Required environment variables (never hardcode):

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App URLs
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_STUDENT_URL=
NEXT_PUBLIC_AUTH_URL=
```
