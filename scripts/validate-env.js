#!/usr/bin/env node

/**
 * Validate required environment variables before build
 * 
 * Usage:
 *   node scripts/validate-env.js           # Validate all
 *   node scripts/validate-env.js --strict  # Fail on optional missing too
 *   node scripts/validate-env.js --quiet   # Minimal output
 */

const fs = require('fs');
const path = require('path');

// Parse CLI arguments
const args = process.argv.slice(2);
const isStrict = args.includes('--strict');
const isQuiet = args.includes('--quiet');

// Load .env.local if exists
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const envContent = fs.readFileSync(filePath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        // Don't override existing env vars
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  });
}

// Load env files in order (later files don't override earlier)
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

// Import schema
let envSchema;
try {
  envSchema = require('../packages/config/env/env.schema.js').envSchema;
} catch {
  // Fallback if schema not found
  envSchema = {
    required: [
      { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', description: 'Firebase API Key' },
      { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', description: 'Firebase Auth Domain' },
      { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase Project ID' },
    ],
    optional: [
      { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', description: 'Firebase Storage Bucket' },
      { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', description: 'Firebase Messaging Sender ID' },
      { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', description: 'Firebase App ID' },
    ],
    urls: [
      { key: 'NEXT_PUBLIC_AUTH_URL', description: 'Auth app URL', default: 'http://localhost:3000' },
      { key: 'NEXT_PUBLIC_ADMIN_URL', description: 'Admin app URL', default: 'http://localhost:3001' },
      { key: 'NEXT_PUBLIC_STUDENT_URL', description: 'Student app URL', default: 'http://localhost:3002' },
    ],
  };
}

function log(message) {
  if (!isQuiet) console.log(message);
}

function validateEnv() {
  log('🔍 Validating environment variables...\n');

  const results = {
    required: { present: [], missing: [] },
    optional: { present: [], missing: [] },
    urls: { present: [], missing: [] },
  };

  // Check required vars
  for (const { key, description } of envSchema.required) {
    const value = process.env[key];
    if (value && value !== '' && !value.includes('your-')) {
      results.required.present.push({ key, description });
    } else {
      results.required.missing.push({ key, description });
    }
  }

  // Check optional vars
  for (const { key, description } of envSchema.optional) {
    if (process.env[key]) {
      results.optional.present.push({ key, description });
    } else {
      results.optional.missing.push({ key, description });
    }
  }

  // Check URL vars (apply defaults)
  for (const { key, description, default: defaultValue } of envSchema.urls) {
    if (process.env[key]) {
      results.urls.present.push({ key, description });
    } else {
      results.urls.missing.push({ key, description, default: defaultValue });
    }
  }

  // Report results
  if (results.required.present.length > 0) {
    log('✅ Required environment variables:');
    results.required.present.forEach(({ key }) => log(`   ✓ ${key}`));
    log('');
  }

  if (results.optional.present.length > 0) {
    log('✅ Optional environment variables:');
    results.optional.present.forEach(({ key }) => log(`   ✓ ${key}`));
    log('');
  }

  if (results.urls.missing.length > 0) {
    log('ℹ️  URL variables using defaults:');
    results.urls.missing.forEach(({ key, default: def }) => log(`   - ${key} = ${def}`));
    log('');
  }

  if (results.optional.missing.length > 0) {
    log('⚠️  Optional variables not set:');
    results.optional.missing.forEach(({ key, description }) => 
      log(`   - ${key} (${description})`)
    );
    log('');
  }

  // Handle errors
  if (results.required.missing.length > 0) {
    console.error('❌ REQUIRED environment variables missing:');
    results.required.missing.forEach(({ key, description }) => 
      console.error(`   - ${key} (${description})`)
    );
    console.error('\n📝 To fix this:');
    console.error('   1. Copy .env.example to .env.local');
    console.error('   2. Fill in your Firebase credentials from Firebase Console');
    console.error('   3. Run the build again\n');
    process.exit(1);
  }

  if (isStrict && results.optional.missing.length > 0) {
    console.error('❌ Strict mode: Optional variables are required');
    process.exit(1);
  }

  log('✅ Environment validation passed!\n');
}

validateEnv();
