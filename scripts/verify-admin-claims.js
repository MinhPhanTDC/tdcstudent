#!/usr/bin/env node

/**
 * Verify Admin Custom Claims
 * 
 * This script checks if the current admin user has proper custom claims set
 * and provides instructions to fix if not.
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../firebase/functions/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function verifyAdminClaims() {
  try {
    console.log('🔍 Verify Admin Custom Claims\n');

    // Get admin email
    const email = await question('Enter admin email to verify: ');
    
    if (!email) {
      console.error('❌ Email is required');
      process.exit(1);
    }

    console.log(`\n📧 Looking up user: ${email}...`);

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);

    // Check custom claims
    const customClaims = user.customClaims || {};
    console.log('\n📋 Current custom claims:', JSON.stringify(customClaims, null, 2));

    if (customClaims.role === 'admin') {
      console.log('\n✅ User has admin role in custom claims');
      console.log('✅ Storage rules should work correctly');
    } else {
      console.log('\n⚠️  User does NOT have admin role in custom claims');
      console.log('\n🔧 To fix this, run:');
      console.log(`   node scripts/setup-custom-claims.js`);
      console.log('\n   Or manually set claims:');
      console.log(`   firebase functions:shell`);
      console.log(`   setAdminClaim("${email}")`);
    }

    // Check Firestore user document
    console.log('\n📄 Checking Firestore user document...');
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ User document exists');
      console.log(`   Role in Firestore: ${userData.role}`);
      
      if (userData.role === 'admin') {
        console.log('✅ User has admin role in Firestore (fallback will work)');
      } else {
        console.log('⚠️  User does NOT have admin role in Firestore');
      }
    } else {
      console.log('❌ User document does not exist in Firestore');
    }

    console.log('\n✅ Verification complete');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

verifyAdminClaims();
