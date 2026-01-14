#!/usr/bin/env node

/**
 * Quick Deploy Functions Only
 * 
 * This script quickly deploys only Cloud Functions.
 * Useful when you've made changes to functions code.
 * 
 * Usage:
 *   node scripts/quick-deploy-functions.js
 */

const { execSync } = require('child_process');
const path = require('path');

function exec(command, cwd) {
  console.log(`\n💻 Running: ${command}`);
  try {
    execSync(command, {
      cwd: cwd || process.cwd(),
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Quick Deploy - Cloud Functions Only              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const firebaseDir = path.join(__dirname, '..', 'firebase');
  const functionsDir = path.join(firebaseDir, 'functions');

  // Step 1: Build functions
  console.log('📋 Step 1: Build Cloud Functions...');
  if (!exec('npm run build', functionsDir)) {
    console.error('\n❌ Failed to build functions');
    process.exit(1);
  }

  // Step 2: Deploy functions
  console.log('\n📋 Step 2: Deploy Cloud Functions...');
  console.log('⚠️  This may take 2-3 minutes...\n');
  
  if (!exec('firebase deploy --only functions', firebaseDir)) {
    console.error('\n❌ Failed to deploy functions');
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ Functions Deployed Successfully!            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📊 Deployed functions:');
  console.log('   - setUserClaims');
  console.log('   - updateUserClaims');
  console.log('   - refreshUserClaims');

  console.log('\n🎯 Next: Set custom claims for admin user');
  console.log('   node scripts/setup-custom-claims.js <admin-email>');
}

main().catch(error => {
  console.error('\n❌ Deployment failed:', error);
  process.exit(1);
});
