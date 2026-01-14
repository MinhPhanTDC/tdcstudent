#!/usr/bin/env node

/**
 * Check Media Upload Readiness
 * 
 * This script checks if everything is configured correctly for media upload
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Media Upload Configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: .env.local files
console.log('1️⃣  Checking .env.local files...');
const envFiles = [
  'apps/admin/.env.local',
  'apps/auth/.env.local',
  'apps/student/.env.local',
  '.env.local',
];

envFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for DATABASE_URL
    if (content.includes('NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://')) {
      console.log(`   ✅ ${file} - DATABASE_URL configured`);
    } else if (content.includes('# NEXT_PUBLIC_FIREBASE_DATABASE_URL')) {
      console.log(`   ⚠️  ${file} - DATABASE_URL is commented out`);
      hasWarnings = true;
    } else {
      console.log(`   ❌ ${file} - DATABASE_URL missing`);
      hasErrors = true;
    }
    
    // Check for required vars
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    ];
    
    requiredVars.forEach((varName) => {
      if (!content.includes(`${varName}=`) || content.includes(`${varName}=\n`)) {
        console.log(`   ❌ ${file} - ${varName} missing or empty`);
        hasErrors = true;
      }
    });
  } else {
    console.log(`   ❌ ${file} - File not found`);
    hasErrors = true;
  }
});

// Check 2: Storage rules
console.log('\n2️⃣  Checking storage rules...');
const storageRulesPath = path.join(process.cwd(), 'firebase/storage.rules');
if (fs.existsSync(storageRulesPath)) {
  const content = fs.readFileSync(storageRulesPath, 'utf-8');
  
  if (content.includes('match /media/{allPaths=**}')) {
    console.log('   ✅ Media storage rules defined');
  } else {
    console.log('   ❌ Media storage rules missing');
    hasErrors = true;
  }
  
  if (content.includes('isAdminWithFallback()')) {
    console.log('   ✅ Admin check with fallback configured');
  } else {
    console.log('   ⚠️  Admin check might not have fallback');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ storage.rules file not found');
  hasErrors = true;
}

// Check 3: Required files
console.log('\n3️⃣  Checking required files...');
const requiredFiles = [
  'packages/firebase/src/repositories/media.repository.ts',
  'apps/admin/src/hooks/useMediaFiles.ts',
  'apps/admin/src/components/features/media/MediaLibrary.tsx',
  'apps/admin/src/components/features/media/MediaGrid.tsx',
  'apps/admin/src/components/features/media/MediaUploader.tsx',
  'apps/admin/src/components/debug/UserDebugInfo.tsx',
];

requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing`);
    hasErrors = true;
  }
});

// Check 4: Scripts
console.log('\n4️⃣  Checking helper scripts...');
const scripts = [
  'scripts/setup-custom-claims.js',
  'scripts/verify-admin-claims.js',
  'scripts/deploy-storage-rules.js',
];

scripts.forEach((script) => {
  const scriptPath = path.join(process.cwd(), script);
  if (fs.existsSync(scriptPath)) {
    console.log(`   ✅ ${script}`);
  } else {
    console.log(`   ⚠️  ${script} - Missing (optional)`);
    hasWarnings = true;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary\n');

if (!hasErrors && !hasWarnings) {
  console.log('✅ All checks passed! Media upload should work.');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart dev server: cd apps/admin && pnpm dev');
  console.log('   2. Verify admin claims: node scripts/verify-admin-claims.js');
  console.log('   3. Test upload in browser');
} else if (hasErrors) {
  console.log('❌ Found errors that need to be fixed!');
  console.log('\n🔧 To fix:');
  console.log('   1. Review errors above');
  console.log('   2. Check MEDIA_UPLOAD_FIX.md for detailed instructions');
  console.log('   3. Run this script again after fixing');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Found warnings - media upload might work but not optimal');
  console.log('\n📝 Recommended:');
  console.log('   1. Review warnings above');
  console.log('   2. Uncomment DATABASE_URL in .env.local files');
  console.log('   3. Restart dev server');
}

console.log('\n📚 Documentation:');
console.log('   - MEDIA_UPLOAD_FIX.md - Detailed fix guide');
console.log('   - QUICK_FIX_CHECKLIST.md - Quick checklist');
console.log('='.repeat(60));
