# The Design Council Webapp

Hệ thống quản lý học viên với 3 ứng dụng: Auth App, Admin App, và Student App.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **Forms:** react-hook-form + Zod
- **Data Fetching:** TanStack Query v5
- **Auth & Database:** Firebase (Auth + Firestore)
- **Monorepo:** Turborepo + pnpm

## Project Structure

```
the-design-council/
├── apps/
│   ├── auth/      # Login page (port 3000)
│   ├── admin/     # Admin dashboard (port 3001)
│   └── student/   # Student portal (port 3002)
├── packages/
│   ├── ui/        # Shared UI components
│   ├── schemas/   # Zod schemas
│   ├── firebase/  # Firebase SDK wrapper
│   ├── types/     # Shared TypeScript types
│   └── config/    # Shared configs (ESLint, TS, Tailwind)
└── firebase/      # Firebase configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Firebase project

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment files
cp apps/auth/.env.local.example apps/auth/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
cp apps/student/.env.local.example apps/student/.env.local

# Update .env.local files with your Firebase credentials
```

### Development

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm dev --filter @tdc/auth
pnpm dev --filter @tdc/admin
pnpm dev --filter @tdc/student
```

### Build

```bash
# Build all
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Environment Variables

Required environment variables for each app:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_STUDENT_URL=http://localhost:3002
```

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy security rules:

```bash
cd firebase
firebase deploy --only firestore:rules
```

## License

Private - The Design Council
