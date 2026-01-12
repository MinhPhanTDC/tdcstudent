#!/bin/bash

# Deploy script for The Design Council Webapp
# Usage: ./scripts/deploy.sh [target] [options]
# Targets: all, auth, admin, student, rules
# Options:
#   --skip-tests      Skip running tests before deployment (emergency deployments only)
#   --skip-analyze    Skip bundle size analysis
#   --skip-security   Skip security validation (NOT RECOMMENDED)
#   --dry-run         Show what would be deployed without actually deploying
#   --strict          Treat warnings as errors in security validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
TARGET="all"
SKIP_TESTS=false
SKIP_ANALYZE=false
SKIP_SECURITY=false
DRY_RUN=false
STRICT_MODE=false

for arg in "$@"; do
  case $arg in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-analyze)
      SKIP_ANALYZE=true
      shift
      ;;
    --skip-security)
      SKIP_SECURITY=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --strict)
      STRICT_MODE=true
      shift
      ;;
    all|auth|admin|student|rules)
      TARGET=$arg
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Error handling function
handle_error() {
  local step=$1
  local error_code=$2
  
  echo ""
  echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                    DEPLOYMENT FAILED                       ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${RED}❌ Failed at: ${step}${NC}"
  echo -e "${RED}   Exit code: ${error_code}${NC}"
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}📋 Rollback Instructions:${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  case $step in
    "Environment Validation")
      echo "   1. Check your .env.local files in each app directory"
      echo "   2. Ensure all required environment variables are set"
      echo "   3. Run: node scripts/validate-env.js --strict"
      echo "   4. Fix any reported issues and retry deployment"
      ;;
    "Security Validation")
      echo "   1. Review security issues reported above"
      echo "   2. Fix unauthenticated write rules in firebase/storage.rules"
      echo "   3. Remove TODO/TEMPORARY comments from rules files"
      echo "   4. Run: node scripts/validate-security.js"
      echo "   5. Retry deployment after fixing all issues"
      ;;
    "Tests")
      echo "   1. Review failing tests in the output above"
      echo "   2. Fix the failing tests or underlying code issues"
      echo "   3. Run: pnpm test:run"
      echo "   4. Retry deployment after all tests pass"
      echo ""
      echo "   ⚠️  Emergency deployment (NOT RECOMMENDED):"
      echo "   ./scripts/deploy.sh $TARGET --skip-tests"
      ;;
    "Build")
      echo "   1. Review build errors in the output above"
      echo "   2. Fix TypeScript errors or build configuration issues"
      echo "   3. Run: pnpm build"
      echo "   4. Retry deployment after build succeeds"
      ;;
    "Build Output Validation")
      echo "   1. Ensure Next.js apps are configured for static export"
      echo "   2. Check next.config.js has output: 'export' (for auth app)"
      echo "   3. Verify firebase.json points to correct output directories"
      echo "   4. Run: pnpm build"
      echo "   5. Check that output directories exist"
      ;;
    "Firebase Deployment")
      echo "   1. Check Firebase CLI is installed: firebase --version"
      echo "   2. Ensure you're logged in: firebase login"
      echo "   3. Verify project configuration: firebase projects:list"
      echo "   4. Check firebase.json configuration"
      echo ""
      echo "   To rollback to previous version:"
      echo "   firebase hosting:rollback --site=auth"
      echo "   firebase hosting:rollback --site=admin"
      echo "   firebase hosting:rollback --site=student"
      ;;
    *)
      echo "   1. Review the error output above"
      echo "   2. Fix the reported issues"
      echo "   3. Retry deployment"
      ;;
  esac
  
  echo ""
  echo -e "${BLUE}📚 Documentation:${NC}"
  echo "   - Deployment checklist: docs/DEPLOYMENT_CHECKLIST.md"
  echo "   - Firebase docs: https://firebase.google.com/docs/hosting"
  echo ""
  
  exit $error_code
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       The Design Council - Deployment Pipeline             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Target: $TARGET"
echo "🧪 Skip Tests: $SKIP_TESTS"
echo "🔒 Skip Security: $SKIP_SECURITY"
echo "📊 Skip Analyze: $SKIP_ANALYZE"
echo "🔍 Dry Run: $DRY_RUN"
echo "⚠️  Strict Mode: $STRICT_MODE"
echo ""

# Step 1: Validate environment variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Validating environment variables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node scripts/validate-env.js --strict || handle_error "Environment Validation" $?
echo -e "${GREEN}✅ Environment validation passed!${NC}"
echo ""

# Step 2: Security validation (Requirements 5.1, 5.2)
if [ "$SKIP_SECURITY" = false ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔒 Step 2: Running security validation..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  SECURITY_ARGS=""
  if [ "$STRICT_MODE" = true ]; then
    SECURITY_ARGS="--strict"
  fi
  
  node scripts/validate-security.js $SECURITY_ARGS || handle_error "Security Validation" $?
  echo -e "${GREEN}✅ Security validation passed!${NC}"
  echo ""
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${YELLOW}⚠️  Step 2: Skipping security validation (--skip-security flag used)${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${RED}   WARNING: Deploying without security validation is DANGEROUS!${NC}"
  echo "   Security vulnerabilities may be deployed to production."
  echo ""
fi

# Step 3: Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 Step 3: Running tests..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  pnpm test:run || handle_error "Tests" $?
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${YELLOW}⚠️  Step 3: Skipping tests (--skip-tests flag used)${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${RED}   WARNING: Deploying without running tests is not recommended!${NC}"
  echo ""
fi

# Step 4: Validate Firestore rules (if deploying rules or all)
if [ "$TARGET" = "all" ] || [ "$TARGET" = "rules" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔒 Step 4: Validating Firestore rules syntax..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Check if firebase-tools is available
  if command -v firebase &> /dev/null; then
    # Validate rules syntax by attempting to compile them
    firebase firestore:rules:validate firebase/firestore.rules 2>/dev/null || {
      # If validate command doesn't exist, try a dry-run deploy
      echo "   Checking rules syntax..."
      firebase deploy --only firestore:rules --dry-run 2>&1 | grep -i "error" && {
        handle_error "Firestore Rules Validation" 1
      }
    }
    
    echo -e "${GREEN}✅ Firestore rules are valid!${NC}"
  else
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Skipping rules validation.${NC}"
  fi
  echo ""
fi

# Step 5: Build all packages
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 5: Building packages..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm build || handle_error "Build" $?
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""

# Step 6: Validate build outputs (Requirements 5.1)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 6: Validating build outputs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BUILD_VALID=true

# Check auth app output (static export)
if [ "$TARGET" = "all" ] || [ "$TARGET" = "auth" ]; then
  if [ -d "apps/auth/out" ]; then
    if [ -f "apps/auth/out/index.html" ]; then
      echo "   ✅ Auth app: out/index.html exists"
    else
      echo -e "   ${RED}❌ Auth app: out/index.html not found${NC}"
      BUILD_VALID=false
    fi
  else
    echo -e "   ${RED}❌ Auth app: out directory not found${NC}"
    BUILD_VALID=false
  fi
fi

# Check admin app output (static export)
if [ "$TARGET" = "all" ] || [ "$TARGET" = "admin" ]; then
  if [ -d "apps/admin/out" ]; then
    if [ -f "apps/admin/out/index.html" ]; then
      echo "   ✅ Admin app: out/index.html exists"
    else
      echo -e "   ${RED}❌ Admin app: out/index.html not found${NC}"
      BUILD_VALID=false
    fi
  else
    echo -e "   ${RED}❌ Admin app: out directory not found${NC}"
    BUILD_VALID=false
  fi
fi

# Check student app output (static export)
if [ "$TARGET" = "all" ] || [ "$TARGET" = "student" ]; then
  if [ -d "apps/student/out" ]; then
    if [ -f "apps/student/out/index.html" ]; then
      echo "   ✅ Student app: out/index.html exists"
    else
      echo -e "   ${RED}❌ Student app: out/index.html not found${NC}"
      BUILD_VALID=false
    fi
  else
    echo -e "   ${RED}❌ Student app: out directory not found${NC}"
    BUILD_VALID=false
  fi
fi

if [ "$BUILD_VALID" = false ]; then
  handle_error "Build Output Validation" 1
fi

echo -e "${GREEN}✅ Build output validation passed!${NC}"
echo ""

# Step 7: Analyze bundle sizes (unless skipped)
if [ "$SKIP_ANALYZE" = false ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Step 7: Analyzing bundle sizes..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ -f "scripts/build-analyze.js" ]; then
    node scripts/build-analyze.js || echo -e "${YELLOW}⚠️  Bundle analysis skipped (script error)${NC}"
  else
    echo -e "${YELLOW}⚠️  Bundle analysis script not found, skipping...${NC}"
  fi
  echo ""
fi

# Step 8: Deploy to Firebase
if [ "$DRY_RUN" = true ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Step 8: Dry run - showing what would be deployed..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   Target: $TARGET"
  echo ""
  echo "   Would deploy:"
  case $TARGET in
    "all")
      echo "   - Auth app (apps/auth/out)"
      echo "   - Admin app (apps/admin/.next)"
      echo "   - Student app (apps/student/.next)"
      echo "   - Firestore rules"
      echo "   - Storage rules"
      ;;
    "auth")
      echo "   - Auth app (apps/auth/out)"
      ;;
    "admin")
      echo "   - Admin app (apps/admin/.next)"
      ;;
    "student")
      echo "   - Student app (apps/student/.next)"
      ;;
    "rules")
      echo "   - Firestore rules"
      echo "   - Storage rules"
      ;;
  esac
  echo ""
  echo -e "${BLUE}   This is a dry run. No actual deployment will occur.${NC}"
  echo ""
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔥 Step 8: Deploying to Firebase..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  case $TARGET in
    "all")
      echo "   Deploying all apps and rules..."
      firebase deploy --only hosting || handle_error "Firebase Deployment" $?
      firebase deploy --only firestore:rules || handle_error "Firebase Deployment" $?
      firebase deploy --only storage || handle_error "Firebase Deployment" $?
      ;;
    "auth")
      echo "   Deploying Auth app..."
      firebase deploy --only hosting:auth || handle_error "Firebase Deployment" $?
      ;;
    "admin")
      echo "   Deploying Admin app..."
      firebase deploy --only hosting:admin || handle_error "Firebase Deployment" $?
      ;;
    "student")
      echo "   Deploying Student app..."
      firebase deploy --only hosting:student || handle_error "Firebase Deployment" $?
      ;;
    "rules")
      echo "   Deploying Firestore and Storage rules..."
      firebase deploy --only firestore:rules || handle_error "Firebase Deployment" $?
      firebase deploy --only storage || handle_error "Firebase Deployment" $?
      ;;
    *)
      echo -e "${RED}❌ Unknown target: $TARGET${NC}"
      echo "   Available targets: all, auth, admin, student, rules"
      exit 1
      ;;
  esac
  
  echo -e "${GREEN}✅ Firebase deployment completed!${NC}"
fi

# Step 9: Output deployed URLs and verification steps (Requirements 5.3)
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   Deployment Complete!                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = false ]; then
  echo -e "${GREEN}🌐 Deployed URLs:${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  case $TARGET in
    "all")
      echo "   🔐 Auth:    https://auth.thedesigncouncil.vn"
      echo "   👨‍💼 Admin:   https://admin.thedesigncouncil.vn"
      echo "   🎓 Student: https://student.thedesigncouncil.vn"
      ;;
    "auth")
      echo "   🔐 Auth:    https://auth.thedesigncouncil.vn"
      ;;
    "admin")
      echo "   👨‍💼 Admin:   https://admin.thedesigncouncil.vn"
      ;;
    "student")
      echo "   🎓 Student: https://student.thedesigncouncil.vn"
      ;;
    "rules")
      echo "   📜 Firestore rules deployed"
      echo "   📦 Storage rules deployed"
      ;;
  esac

  echo ""
  echo -e "${BLUE}📋 Verification Steps:${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  case $TARGET in
    "all"|"auth")
      echo ""
      echo "   🔐 Auth App Verification:"
      echo "   1. Visit https://auth.thedesigncouncil.vn"
      echo "   2. Verify login page loads correctly"
      echo "   3. Test login with valid credentials"
      echo "   4. Verify redirect to appropriate dashboard"
      ;;
  esac
  
  case $TARGET in
    "all"|"admin")
      echo ""
      echo "   👨‍💼 Admin App Verification:"
      echo "   1. Visit https://admin.thedesigncouncil.vn"
      echo "   2. Login with admin credentials"
      echo "   3. Verify dashboard loads correctly"
      echo "   4. Test CRUD operations on students/courses"
      echo "   5. Test media upload functionality"
      ;;
  esac
  
  case $TARGET in
    "all"|"student")
      echo ""
      echo "   🎓 Student App Verification:"
      echo "   1. Visit https://student.thedesigncouncil.vn"
      echo "   2. Login with student credentials"
      echo "   3. Verify course list loads correctly"
      echo "   4. Test progress tracking functionality"
      ;;
  esac
  
  case $TARGET in
    "all"|"rules")
      echo ""
      echo "   📜 Rules Verification:"
      echo "   1. Test authenticated user can upload files"
      echo "   2. Test unauthenticated user cannot upload files"
      echo "   3. Verify file size limits are enforced"
      echo "   4. Test Firestore read/write permissions"
      ;;
  esac
  
  echo ""
  echo -e "${YELLOW}⚠️  Rollback Commands (if needed):${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   firebase hosting:rollback --site=auth"
  echo "   firebase hosting:rollback --site=admin"
  echo "   firebase hosting:rollback --site=student"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment pipeline completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
