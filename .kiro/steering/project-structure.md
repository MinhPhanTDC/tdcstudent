# The Design Council - Project Structure

## Monorepo Structure

```
the-design-council/
├── apps/
│   ├── auth/                    # Login page (Next.js)
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router
│   │   │   ├── components/      # App-specific components
│   │   │   └── lib/             # App-specific utilities
│   │   ├── .env.local           # Environment variables
│   │   └── next.config.js
│   │
│   ├── admin/                   # Admin dashboard (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (dashboard)/ # Dashboard routes group
│   │   │   │   │   ├── students/
│   │   │   │   │   ├── courses/
│   │   │   │   │   └── analytics/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout/      # Sidebar, Header, etc.
│   │   │   │   └── features/    # Feature-specific components
│   │   │   ├── hooks/           # App-specific hooks
│   │   │   └── lib/
│   │   └── next.config.js
│   │
│   └── student/                 # Student portal (Next.js)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (portal)/    # Portal routes group
│       │   │   │   ├── courses/
│       │   │   │   ├── progress/
│       │   │   │   └── profile/
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   ├── hooks/
│       │   └── lib/
│       └── next.config.js
│
├── packages/
│   ├── ui/                      # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   ├── Card/
│   │   │   │   └── ...
│   │   │   ├── hooks/           # Shared hooks
│   │   │   └── utils/
│   │   │       └── cn.ts        # className utility
│   │   ├── index.ts             # Barrel exports
│   │   └── package.json
│   │
│   ├── schemas/                 # Zod schemas + generated types
│   │   ├── src/
│   │   │   ├── user.schema.ts
│   │   │   ├── student.schema.ts
│   │   │   ├── course.schema.ts
│   │   │   └── common.schema.ts
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── firebase/                # Firebase SDK wrapper
│   │   ├── src/
│   │   │   ├── config.ts        # Firebase initialization
│   │   │   ├── auth.ts          # Auth functions
│   │   │   ├── firestore.ts     # Firestore functions
│   │   │   ├── errors.ts        # Error mapping
│   │   │   └── types.ts
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── config/                  # Shared configs
│   │   ├── eslint/
│   │   │   └── index.js
│   │   ├── typescript/
│   │   │   └── base.json
│   │   └── tailwind/
│   │       └── preset.js
│   │
│   └── types/                   # Shared TypeScript types
│       ├── src/
│       │   ├── result.types.ts  # Result type pattern
│       │   ├── error.types.ts   # AppError class
│       │   └── common.types.ts
│       ├── index.ts
│       └── package.json
│
├── firebase/                    # Firebase configuration
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── firebase.json
│
├── turbo.json                   # Turborepo config
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace config
└── .kiro/
    ├── specs/                   # Feature specifications
    └── steering/                # Coding guidelines
```

## Package Aliases

Configure in each app's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@tdc/ui": ["../../packages/ui"],
      "@tdc/schemas": ["../../packages/schemas"],
      "@tdc/firebase": ["../../packages/firebase"],
      "@tdc/types": ["../../packages/types"]
    }
  }
}
```

## Feature Folder Structure

When adding a new feature, follow this structure:

```
src/components/features/student-management/
├── StudentList.tsx           # Main component
├── StudentCard.tsx           # Sub-component
├── StudentForm.tsx           # Form component
├── useStudentList.ts         # Data fetching hook
├── studentList.types.ts      # Feature-specific types
└── index.ts                  # Barrel exports
```

## Shared Component Structure

```
packages/ui/src/components/Button/
├── Button.tsx                # Component implementation
├── Button.test.tsx           # Unit tests
├── Button.stories.tsx        # Storybook stories (optional)
└── index.ts                  # Export
```
