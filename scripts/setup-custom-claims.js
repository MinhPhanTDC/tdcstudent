#!/usr/bin/env node

/**
 * Setup Custom Claims for Admin User
 * 
 * This script sets custom claims for an admin user using Firebase Admin SDK.
 * 
 * Usage:
 *   node scripts/setup-custom-claims.js <admin-email>
 * 
 * Example:
 *   node scripts/setup-custom-claims.js thiennmyy@gmail.com
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('\nUsage: node scripts/setup-custom-claims.js <admin-email>');
  console.log('Example: node scripts/setup-custom-claims.js thiennmyy@gmail.com');
  process.exit(1);
}

async function setupClaims() {
  console.log('🔧 Setting up custom claims for admin user...\n');

  try {
    // Try to find service account key
    const serviceAccountPath = path.join(__dirname, '..', 'firebase', 'functions', 'service-account-key.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('✅ Found service account key');
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.log('⚠️  Service account key not found');
      console.log('📝 Trying to initialize with application default credentials...\n');
      
      // Try with application default credentials
      admin.initializeApp();
    }

    // Get user by email
    console.log(`🔍 Looking up user: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}\n`);

    // Set custom claims
    console.log('�  Setting custom claims...');
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Custom claims set successfully!');
    console.log('   Claims: { role: "admin", isActive: true }\n');

    // Update Firestore document
    console.log('� SUpdating Firestore document...');
    await admin.firestore().collection('users').doc(user.uid).update({
      claimsSet: true,
      claimsSetAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Firestore document updated!\n');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ Claims Set Successfully!                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('⚠️  IMPORTANT: User must logout and login again to refresh token!\n');

    console.log('🧪 To verify claims in browser console (admin app):');
    console.log('   firebase.auth().currentUser.getIdTokenResult().then(t => {');
    console.log('     console.log("Custom Claims:", t.claims);');
    console.log('   });\n');

    console.log('Expected output:');
    console.log('   { role: "admin", isActive: true, ... }\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting custom claims:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User not found. Please check:');
      console.log('   1. Email is correct');
      console.log('   2. User exists in Firebase Authentication');
    } else if (error.message.includes('service account')) {
      console.log('\n💡 Service account key not found. To fix:');
      console.log('   1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('   2. Click "Generate new private key"');
      console.log('   3. Save as: firebase/functions/service-account-key.json');
      console.log('   4. Run this script again');
      console.log('\n⚠️  DO NOT commit service-account-key.json to git!');
    } else {
      console.log('\n💡 Alternative methods:');
      console.log('   1. Update user document in Firestore (triggers Cloud Function)');
      console.log('   2. Use callable function from client app');
      console.log('   3. Manually set in Firebase Console');
    }
    
    process.exit(1);
  }
}

setupClaims();
