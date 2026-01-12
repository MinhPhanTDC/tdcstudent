#!/usr/bin/env node

/**
 * Validate required environment variables before build/deployment
 * 
 * Usage:
 *   node scripts/validate-env.js              # Validate for development
 *   node scripts/validate-env.js --strict     # Validate for production (all vars required)
 *   node scripts/validate-env.js --production # Same as --strict
 *   node scripts/validate-env.js --quiet      # Minimal output
 *   node scripts/validate-env.js --json       # Output as JSON
 */

const fs = require('fs');
const path = require('path');

// Parse CLI arguments
const args = process.argv.slice(2);
const isStrict = args.includes('--strict') || args.includes('--production');
const isQuiet = args.includes('--quiet');
const isJson = args.includes('--json');

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

// Environment schema with production requirements
const envSchema = {
  // Firebase - Required for all environments
  required: [
    {
      key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      description: 'Firebase API Key',
      validate: (value) => value && value.length > 10 && !value.includes('your-'),
      errorMessage: 'Must be a valid Firebase API key',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      description: 'Firebase Auth Domain',
      validate: (value) => value && value.includes('.firebaseapp.com'),
      errorMessage: 'Must be a valid Firebase Auth Domain (e.g., project-id.firebaseapp.com)',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      description: 'Firebase Project ID',
      validate: (value) => value && value.length > 3 && !value.includes('your-'),
      errorMessage: 'Must be a valid Firebase Project ID',
    },
  ],

  // Firebase - Optional for dev, required for production
  production: [
    {
      key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      description: 'Firebase Storage Bucket',
      validate: (value) => value && (value.includes('.appspot.com') || value.includes('.firebasestorage.app')),
      errorMessage: 'Must be a valid Firebase Storage Bucket (e.g., project-id.appspot.com or project-id.firebasestorage.app)',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      description: 'Firebase Messaging Sender ID',
      validate: (value) => value && /^\d+$/.test(value),
      errorMessage: 'Must be a numeric Messaging Sender ID',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      description: 'Firebase App ID',
      validate: (value) => value && value.includes(':'),
      errorMessage: 'Must be a valid Firebase App ID',
    },
  ],

  // App URLs - Required for production
  urls: [
    {
      key: 'NEXT_PUBLIC_AUTH_URL',
      description: 'Auth app URL',
      default: 'http://localhost:3000',
      productionValidate: (value) => value && value.startsWith('https://'),
      productionErrorMessage: 'Production URL must use HTTPS',
    },
    {
      key: 'NEXT_PUBLIC_ADMIN_URL',
      description: 'Admin app URL',
      default: 'http://localhost:3001',
      productionValidate: (value) => value && value.startsWith('https://'),
      productionErrorMessage: 'Production URL must use HTTPS',
    },
    {
      key: 'NEXT_PUBLIC_STUDENT_URL',
      description: 'Student app URL',
      default: 'http://localhost:3002',
      productionValidate: (value) => value && value.startsWith('https://'),
      productionErrorMessage: 'Production URL must use HTTPS',
    },
  ],
};

function log(message) {
  if (!isQuiet && !isJson) console.log(message);
}

function validateEnv() {
  log('╔════════════════════════════════════════════════════════════╗');
  log('║           Environment Variables Validation                 ║');
  log('╚════════════════════════════════════════════════════════════╝');
  log('');
  log(`Mode: ${isStrict ? 'Production (strict)' : 'Development'}`);
  log('');

  const results = {
    required: { valid: [], invalid: [], missing: [] },
    production: { valid: [], invalid: [], missing: [] },
    urls: { valid: [], invalid: [], missing: [], defaults: [] },
  };

  // Check required vars
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('📋 Required Environment Variables:');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const { key, description, validate, errorMessage } of envSchema.required) {
    const value = process.env[key];
    
    if (!value) {
      results.required.missing.push({ key, description });
      log(`   ❌ ${key} - MISSING`);
    } else if (validate && !validate(value)) {
      results.required.invalid.push({ key, description, errorMessage });
      log(`   ❌ ${key} - INVALID (${errorMessage})`);
    } else {
      results.required.valid.push({ key, description });
      log(`   ✅ ${key}`);
    }
  }
  log('');

  // Check production vars (required in strict mode)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`📋 Production Environment Variables ${isStrict ? '(Required)' : '(Optional)'}:`);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const { key, description, validate, errorMessage } of envSchema.production) {
    const value = process.env[key];
    
    if (!value) {
      results.production.missing.push({ key, description });
      log(`   ${isStrict ? '❌' : '⚠️ '} ${key} - ${isStrict ? 'MISSING' : 'Not set'}`);
    } else if (validate && !validate(value)) {
      results.production.invalid.push({ key, description, errorMessage });
      log(`   ❌ ${key} - INVALID (${errorMessage})`);
    } else {
      results.production.valid.push({ key, description });
      log(`   ✅ ${key}`);
    }
  }
  log('');

  // Check URL vars
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`📋 Application URLs ${isStrict ? '(Production)' : '(Development)'}:`);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const { key, description, default: defaultValue, productionValidate, productionErrorMessage } of envSchema.urls) {
    const value = process.env[key];
    
    if (!value) {
      results.urls.defaults.push({ key, description, default: defaultValue });
      log(`   ℹ️  ${key} = ${defaultValue} (default)`);
    } else if (isStrict && productionValidate && !productionValidate(value)) {
      results.urls.invalid.push({ key, description, errorMessage: productionErrorMessage });
      log(`   ❌ ${key} - INVALID (${productionErrorMessage})`);
    } else {
      results.urls.valid.push({ key, description, value });
      log(`   ✅ ${key} = ${value}`);
    }
  }
  log('');

  // Calculate errors
  const errors = [];
  
  // Required vars must always be present and valid
  if (results.required.missing.length > 0) {
    errors.push({
      type: 'MISSING_REQUIRED',
      message: 'Required environment variables are missing',
      variables: results.required.missing,
    });
  }
  
  if (results.required.invalid.length > 0) {
    errors.push({
      type: 'INVALID_REQUIRED',
      message: 'Required environment variables are invalid',
      variables: results.required.invalid,
    });
  }
  
  // Production vars required in strict mode
  if (isStrict) {
    if (results.production.missing.length > 0) {
      errors.push({
        type: 'MISSING_PRODUCTION',
        message: 'Production environment variables are missing',
        variables: results.production.missing,
      });
    }
    
    if (results.production.invalid.length > 0) {
      errors.push({
        type: 'INVALID_PRODUCTION',
        message: 'Production environment variables are invalid',
        variables: results.production.invalid,
      });
    }
    
    if (results.urls.invalid.length > 0) {
      errors.push({
        type: 'INVALID_URLS',
        message: 'Production URLs are invalid',
        variables: results.urls.invalid,
      });
    }
    
    if (results.urls.defaults.length > 0) {
      errors.push({
        type: 'MISSING_URLS',
        message: 'Production URLs are using development defaults',
        variables: results.urls.defaults,
      });
    }
  }

  // Output JSON if requested
  if (isJson) {
    console.log(JSON.stringify({
      success: errors.length === 0,
      mode: isStrict ? 'production' : 'development',
      results,
      errors,
    }, null, 2));
    process.exit(errors.length > 0 ? 1 : 0);
    return;
  }

  // Report errors
  if (errors.length > 0) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ VALIDATION ERRORS:');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    errors.forEach(({ type, message, variables }) => {
      console.error(`\n   ${type}: ${message}`);
      variables.forEach(({ key, description, errorMessage }) => {
        console.error(`      - ${key} (${description})`);
        if (errorMessage) {
          console.error(`        ${errorMessage}`);
        }
      });
    });
    
    console.error('\n📝 To fix this:');
    console.error('   1. Copy .env.example to .env.local');
    console.error('   2. Fill in your Firebase credentials from Firebase Console');
    console.error('   3. For production, ensure all URLs use HTTPS');
    console.error('   4. Run the validation again\n');
    
    process.exit(1);
  }

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('✅ Environment validation passed!');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');
}

// Export for testing
module.exports = { validateEnv, envSchema };

// Run if called directly
if (require.main === module) {
  validateEnv();
}
