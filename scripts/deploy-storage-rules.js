#!/usr/bin/env node

/**
 * Deploy Firebase Storage Rules
 * 
 * This script deploys only the storage rules to Firebase.
 * Useful for quick fixes without deploying the entire app.
 * 
 * Usage:
 *   node scripts/deploy-storage-rules.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔥 Deploying Firebase Storage Rules...\n');

try {
  // Change to firebase directory
  const firebaseDir = path.join(__dirname, '..', 'firebase');
  
  // Deploy storage rules
  execSync('firebase deploy --only storage', {
    cwd: firebaseDir,
    stdio: 'inherit',
  });
  
  console.log('\n✅ Storage rules deployed successfully!');
  console.log('\n📝 Changes:');
  console.log('   - Updated isAdmin() to check Firestore instead of custom claims');
  console.log('   - Media upload now requires authenticated admin user');
  console.log('\n💡 Next steps:');
  console.log('   1. Refresh your admin app');
  console.log('   2. Try uploading media again');
  
} catch (error) {
  console.error('\n❌ Failed to deploy storage rules');
  console.error('\nError:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure you are logged in: firebase login');
  console.error('   2. Check if you have permission to deploy');
  console.error('   3. Verify Firebase project is set: firebase use <project-id>');
  process.exit(1);
}
