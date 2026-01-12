#!/usr/bin/env node

/**
 * Validate Firestore and Storage rules syntax
 * 
 * Usage:
 *   node scripts/validate-rules.js           # Validate all rules
 *   node scripts/validate-rules.js firestore # Validate Firestore rules only
 *   node scripts/validate-rules.js storage   # Validate Storage rules only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse CLI arguments
const args = process.argv.slice(2);
const target = args[0] || 'all';

const FIREBASE_DIR = path.join(__dirname, '..', 'firebase');
const FIRESTORE_RULES = path.join(FIREBASE_DIR, 'firestore.rules');
const STORAGE_RULES = path.join(FIREBASE_DIR, 'storage.rules');

/**
 * Check if Firebase CLI is available
 */
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate rules file exists and has content
 */
function validateRulesFile(filePath, name) {
  console.log(`\n📄 Checking ${name} rules file...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ ${name} rules file not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.trim()) {
    console.error(`   ❌ ${name} rules file is empty`);
    return false;
  }
  
  // Basic syntax checks
  if (!content.includes('rules_version')) {
    console.error(`   ❌ ${name} rules missing 'rules_version' declaration`);
    return false;
  }
  
  // Check for balanced braces
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    console.error(`   ❌ ${name} rules have unbalanced braces (${openBraces} open, ${closeBraces} close)`);
    return false;
  }
  
  console.log(`   ✅ ${name} rules file structure is valid`);
  return true;
}

/**
 * Validate Firestore rules specific syntax
 */
function validateFirestoreRules() {
  console.log('\n🔥 Validating Firestore rules...');
  
  if (!validateRulesFile(FIRESTORE_RULES, 'Firestore')) {
    return false;
  }
  
  const content = fs.readFileSync(FIRESTORE_RULES, 'utf-8');
  
  // Check for required service declaration
  if (!content.includes('service cloud.firestore')) {
    console.error('   ❌ Missing "service cloud.firestore" declaration');
    return false;
  }
  
  // Check for database match
  if (!content.includes('match /databases/{database}/documents')) {
    console.error('   ❌ Missing database documents match pattern');
    return false;
  }
  
  // Check for common security patterns
  const hasAuthCheck = content.includes('request.auth');
  if (!hasAuthCheck) {
    console.warn('   ⚠️  Warning: No authentication checks found (request.auth)');
  }
  
  // Check for allow rules
  const allowRules = content.match(/allow\s+(read|write|create|update|delete|get|list)/g) || [];
  if (allowRules.length === 0) {
    console.error('   ❌ No allow rules found');
    return false;
  }
  
  console.log(`   ✅ Found ${allowRules.length} allow rules`);
  
  // Try Firebase CLI validation if available
  if (checkFirebaseCLI()) {
    console.log('   🔍 Running Firebase CLI validation...');
    try {
      execSync(`firebase deploy --only firestore:rules --dry-run`, {
        cwd: FIREBASE_DIR,
        stdio: 'pipe'
      });
      console.log('   ✅ Firebase CLI validation passed');
    } catch (error) {
      const stderr = error.stderr?.toString() || '';
      if (stderr.includes('Error')) {
        console.error('   ❌ Firebase CLI validation failed:');
        console.error(`      ${stderr.split('\n').filter(l => l.includes('Error')).join('\n      ')}`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate Storage rules specific syntax
 */
function validateStorageRules() {
  console.log('\n📦 Validating Storage rules...');
  
  if (!validateRulesFile(STORAGE_RULES, 'Storage')) {
    return false;
  }
  
  const content = fs.readFileSync(STORAGE_RULES, 'utf-8');
  
  // Check for required service declaration
  if (!content.includes('service firebase.storage')) {
    console.error('   ❌ Missing "service firebase.storage" declaration');
    return false;
  }
  
  // Check for bucket match
  if (!content.includes('match /b/{bucket}/o')) {
    console.error('   ❌ Missing bucket match pattern');
    return false;
  }
  
  // Check for allow rules
  const allowRules = content.match(/allow\s+(read|write|create|update|delete|get|list)/g) || [];
  if (allowRules.length === 0) {
    console.error('   ❌ No allow rules found');
    return false;
  }
  
  console.log(`   ✅ Found ${allowRules.length} allow rules`);
  
  // Try Firebase CLI validation if available
  if (checkFirebaseCLI()) {
    console.log('   🔍 Running Firebase CLI validation...');
    try {
      execSync(`firebase deploy --only storage --dry-run`, {
        cwd: FIREBASE_DIR,
        stdio: 'pipe'
      });
      console.log('   ✅ Firebase CLI validation passed');
    } catch (error) {
      const stderr = error.stderr?.toString() || '';
      if (stderr.includes('Error')) {
        console.error('   ❌ Firebase CLI validation failed:');
        console.error(`      ${stderr.split('\n').filter(l => l.includes('Error')).join('\n      ')}`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Main validation function
 */
function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           Firebase Rules Validation                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  let success = true;
  
  if (target === 'all' || target === 'firestore') {
    if (!validateFirestoreRules()) {
      success = false;
    }
  }
  
  if (target === 'all' || target === 'storage') {
    if (!validateStorageRules()) {
      success = false;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (success) {
    console.log('✅ All rules validation passed!\n');
    process.exit(0);
  } else {
    console.error('❌ Rules validation failed!\n');
    process.exit(1);
  }
}

main();
