# The Design Council Webapp

Hệ thống quản lý học viên với 3 ứng dụng: Auth App, Admin App, và Student App.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **Forms:** react-hook-form + Zod
- **Data Fetching:** TanStack Query v5
- **Auth & Database:** Firebase (Auth + Firestore + Storage)
- **Monorepo:** Turborepo + pnpm
- **Testing:** Vitest + Testing Library + fast-check (Property-Based Testing)

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
├── firebase/      # Firebase configuration & rules
├── scripts/       # Deployment & utility scripts
└── docs/          # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- pnpm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (for hosting)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd the-design-council

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` in the root directory with the following variables:

```env
# ===========================================
# Firebase Configuration (REQUIRED)
# ===========================================
# Get these from Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Storage bucket - supports both formats:
#   - Legacy: your-project-id.appspot.com
#   - New: your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ===========================================
# App URLs
# ===========================================
# Development (default)
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_STUDENT_URL=http://localhost:3002

# Production (uncomment for production)
# NEXT_PUBLIC_AUTH_URL=https://auth.thedesigncouncil.vn
# NEXT_PUBLIC_ADMIN_URL=https://admin.thedesigncouncil.vn
# NEXT_PUBLIC_STUDENT_URL=https://student.thedesigncouncil.vn
```

#### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon > **Project settings**
4. Scroll down to **Your apps** section
5. Click **Add app** > **Web** if you haven't added a web app
6. Copy the configuration values to your `.env.local`

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev --filter @tdc/auth      # Auth app on port 3000
pnpm dev --filter @tdc/admin     # Admin app on port 3001
pnpm dev --filter @tdc/student   # Student app on port 3002

# Run shared packages in watch mode
pnpm dev --filter @tdc/ui
```

### Build & Test

```bash
# Build all packages and apps
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Run all tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with coverage
pnpm test:coverage
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name and follow the wizard
4. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** provider for OAuth

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location closest to your users

### 4. Enable Storage

1. Go to **Storage**
2. Click **Get started**
3. Accept the default security rules (we'll update them)

### 5. Deploy Security Rules

```bash
# Login to Firebase CLI
firebase login

# Initialize Firebase in the project (if not done)
cd firebase
firebase init

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

### 6. Create Admin User

After setting up Firebase Auth, create the first admin user:

1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Enter admin email and password
4. Note the User UID
5. In **Firestore**, create a document in `users` collection:
   ```json
   {
     "id": "<user-uid>",
     "email": "admin@example.com",
     "displayName": "Admin",
     "role": "admin",
     "createdAt": "<timestamp>",
     "updatedAt": "<timestamp>"
   }
   ```

## Deployment

### Quick Start Deployment

For a quick production deployment:

```bash
# 1. Ensure all environment variables are set
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# 2. Run the automated deployment
./scripts/deploy.sh all
```

The deploy script will automatically:
- Validate environment variables
- Run security validation on Firebase rules
- Run all tests
- Build all apps
- Validate build outputs
- Deploy to Firebase Hosting

### Security Validation

Before deploying to production, always run the security validation script:

```bash
# Standard validation
node scripts/validate-security.js

# Strict mode (recommended for production)
node scripts/validate-security.js --strict
```

The security validation checks for:
- Unauthenticated write rules in `firebase/storage.rules`
- Overly permissive read rules in `firebase/firestore.rules`
- TODO/TEMPORARY comments that should be removed before production

### Deploy Commands

```bash
# Deploy all apps and rules
./scripts/deploy.sh all

# Deploy specific target
./scripts/deploy.sh auth      # Auth app only
./scripts/deploy.sh admin     # Admin app only
./scripts/deploy.sh student   # Student app only
./scripts/deploy.sh rules     # Firestore & Storage rules only
```

### Deploy Options

```bash
# Skip tests (emergency deployments only - NOT RECOMMENDED)
./scripts/deploy.sh all --skip-tests

# Skip security validation (NOT RECOMMENDED)
./scripts/deploy.sh all --skip-security

# Strict mode (treat warnings as errors)
./scripts/deploy.sh all --strict

# Dry run (show what would be deployed)
./scripts/deploy.sh all --dry-run
```

### Manual Deployment Steps

1. **Validate environment**
   ```bash
   node scripts/validate-env.js --strict
   ```

2. **Run security validation**
   ```bash
   node scripts/validate-security.js --strict
   ```

3. **Run tests**
   ```bash
   pnpm test:run
   ```

4. **Build all apps**
   ```bash
   pnpm build
   ```

5. **Deploy to Firebase**
   ```bash
   cd firebase
   firebase deploy --only hosting
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

### Production URLs

After deployment, your apps will be available at:

- **Auth:** https://auth.thedesigncouncil.vn
- **Admin:** https://admin.thedesigncouncil.vn
- **Student:** https://student.thedesigncouncil.vn

## Project Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint on all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm clean` | Clean all build artifacts |

## Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md) - Detailed project documentation
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [Admin Help](apps/admin/src/app/(dashboard)/help) - In-app admin guide

## Troubleshooting

### Common Issues

**1. Firebase connection errors**
- Verify `.env.local` has correct Firebase credentials
- Check if Firebase project exists and is properly configured
- Ensure Firestore and Auth are enabled

**2. Build failures**
- Run `pnpm clean` then `pnpm install`
- Check for TypeScript errors with `pnpm typecheck`
- Verify all environment variables are set

**3. Deployment failures**
- Ensure Firebase CLI is logged in: `firebase login`
- Check Firebase project permissions
- Verify hosting targets are configured in `firebase.json`

**4. Tests failing**
- Run `pnpm test:run` to see detailed error messages
- Check if Firebase emulators are needed for integration tests

### Getting Help

- Check the [Admin Help page](apps/admin/src/app/(dashboard)/help) for usage guides
- Review [Project Overview](docs/PROJECT_OVERVIEW.md) for architecture details
- Contact the development team for technical support

## License

Private - The Design Council
