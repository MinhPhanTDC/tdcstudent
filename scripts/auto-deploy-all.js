#!/usr/bin/env node

/**
 * Auto Deploy All - Cloud Functions + Storage Rules + Set Claims
 * 
 * This script automates the entire deployment process:
 * 1. Deploy Storage Rules
 * 2. Deploy Cloud Functions
 * 3. Set custom claims for admin user
 * 
 * Usage:
 *   node scripts/auto-deploy-all.js
 */

const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Auto Deploy - Cloud Functions + Storage Rules         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const firebaseDir = path.join(__dirname, '..', 'firebase');
  const functionsDir = path.join(firebaseDir, 'functions');

  // Step 1: Verify Firebase login
  console.log('\n📋 Step 1: Verify Firebase login...');
  if (!exec('firebase projects:list')) {
    console.error('\n❌ Not logged in to Firebase. Please run: firebase login');
    process.exit(1);
  }

  // Step 2: Install functions dependencies
  console.log('\n📋 Step 2: Install Cloud Functions dependencies...');
  if (!exec('npm install', functionsDir)) {
    console.error('\n❌ Failed to install dependencies');
    process.exit(1);
  }

  // Step 3: Build functions
  console.log('\n📋 Step 3: Build Cloud Functions...');
  if (!exec('npm run build', functionsDir)) {
    console.error('\n❌ Failed to build functions');
    process.exit(1);
  }

  // Step 4: Deploy Storage Rules first
  console.log('\n📋 Step 4: Deploy Storage Rules...');
  if (!exec('firebase deploy --only storage', firebaseDir)) {
    console.error('\n❌ Failed to deploy storage rules');
    process.exit(1);
  }

  console.log('\n✅ Storage Rules deployed successfully!');
  console.log('\n⏳ Waiting 30 seconds to avoid quota limits...');
  await sleep(30000);

  // Step 5: Deploy Functions
  console.log('\n📋 Step 5: Deploy Cloud Functions...');
  console.log('⚠️  This may take 2-3 minutes...\n');
  
  if (!exec('firebase deploy --only functions', firebaseDir)) {
    console.error('\n❌ Failed to deploy functions');
    console.error('\n💡 If you see quota limit error, wait 1-2 minutes and run:');
    console.error('   cd firebase && firebase deploy --only functions');
    process.exit(1);
  }

  console.log('\n✅ Cloud Functions deployed successfully!');

  // Step 6: Set custom claims for admin
  console.log('\n📋 Step 6: Set custom claims for admin user...');
  
  const setClaimsNow = await question('\nDo you want to set custom claims now? (y/n): ');
  
  if (setClaimsNow.toLowerCase() === 'y') {
    const email = await question('Enter admin email (default: thiennmyy@gmail.com): ');
    const adminEmail = email.trim() || 'thiennmyy@gmail.com';
    
    console.log(`\n🔧 Setting claims for: ${adminEmail}`);
    console.log('⚠️  This requires Firebase Admin SDK...\n');
    
    // Try to run the setup script
    const setupScript = path.join(__dirname, 'setup-custom-claims.js');
    if (!exec(`node "${setupScript}" ${adminEmail}`)) {
      console.log('\n⚠️  Could not set claims automatically.');
      console.log('\n📝 Manual options:');
      console.log('   1. Update user in Firestore (add any field to trigger function)');
      console.log('   2. Use Firebase Console to manually set claims');
      console.log('   3. Run: node scripts/setup-custom-claims.js <email>');
    }
  } else {
    console.log('\n📝 To set claims later, run:');
    console.log('   node scripts/setup-custom-claims.js <admin-email>');
  }

  // Step 7: Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ Deployment Complete!                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📊 What was deployed:');
  console.log('   ✅ Storage Rules (with custom claims + fallback)');
  console.log('   ✅ Cloud Functions:');
  console.log('      - setUserClaims (auto-set on user create)');
  console.log('      - updateUserClaims (auto-update on role change)');
  console.log('      - refreshUserClaims (callable from client)');

  console.log('\n🎯 Next steps:');
  console.log('   1. Verify functions in Firebase Console > Functions');
  console.log('   2. Set custom claims for admin user (if not done)');
  console.log('   3. Logout and login in admin app');
  console.log('   4. Test media upload (should be 0 Firestore reads!)');

  console.log('\n💡 To verify claims:');
  console.log('   In browser console (admin app):');
  console.log('   firebase.auth().currentUser.getIdTokenResult().then(t => console.log(t.claims))');

  console.log('\n📚 Documentation:');
  console.log('   - CLOUD_FUNCTIONS_SETUP.md');
  console.log('   - DEPLOY_INSTRUCTIONS.md');
  console.log('   - TEST_UPLOAD_CHECKLIST.md');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Deployment failed:', error);
  rl.close();
  process.exit(1);
});
