#!/usr/bin/env node

/**
 * Production Readiness Check
 * 
 * Kiểm tra toàn bộ codebase xem đã sẵn sàng cho production chưa
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Production Readiness...\n');
console.log('='.repeat(60));

let hasErrors = false;
let hasWarnings = false;
const issues = [];

// 1. Check firebase.json
console.log('\n1️⃣  Checking firebase.json...');
const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
if (fs.existsSync(firebaseJsonPath)) {
  const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf-8'));
  
  // Check hosting config
  if (firebaseJson.hosting && Array.isArray(firebaseJson.hosting)) {
    console.log(`   ✅ Found ${firebaseJson.hosting.length} hosting targets`);
    
    firebaseJson.hosting.forEach((host) => {
      const outPath = path.join(process.cwd(), host.public);
      if (fs.existsSync(outPath)) {
        const files = fs.readdirSync(outPath);
        console.log(`   ✅ ${host.target}: ${files.length} files in ${host.public}`);
      } else {
        console.log(`   ❌ ${host.target}: Output directory ${host.public} not found`);
        issues.push(`Missing output directory: ${host.public}`);
        hasErrors = true;
      }
    });
  }
} else {
  console.log('   ❌ firebase.json not found');
  hasErrors = true;
}

// 2. Check .firebaserc
console.log('\n2️⃣  Checking .firebaserc...');
const firebasercPath = path.join(process.cwd(), '.firebaserc');
if (fs.existsSync(firebasercPath)) {
  const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf-8'));
  
  if (firebaserc.projects && firebaserc.projects.default) {
    console.log(`   ✅ Default project: ${firebaserc.projects.default}`);
  }
  
  if (firebaserc.targets) {
    const projectId = firebaserc.projects.default;
    const targets = firebaserc.targets[projectId];
    
    if (targets && targets.hosting) {
      Object.entries(targets.hosting).forEach(([name, sites]) => {
        console.log(`   ✅ Hosting target "${name}": ${sites.join(', ')}`);
      });
    }
  }
} else {
  console.log('   ❌ .firebaserc not found');
  hasErrors = true;
}

// 3. Check environment variables in apps
console.log('\n3️⃣  Checking app configurations...');
const apps = ['admin', 'auth', 'student'];

apps.forEach((app) => {
  console.log(`\n   📱 ${app.toUpperCase()} App:`);
  
  // Check next.config.js
  const nextConfigPath = path.join(process.cwd(), `apps/${app}/next.config.js`);
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf-8');
    
    // Check for output: 'export'
    if (content.includes("output: 'export'")) {
      console.log(`      ✅ Static export enabled`);
    } else {
      console.log(`      ⚠️  Static export not configured`);
      issues.push(`${app}: Missing output: 'export' in next.config.js`);
      hasWarnings = true;
    }
    
    // Check for trailingSlash
    if (content.includes('trailingSlash: true')) {
      console.log(`      ✅ Trailing slash enabled`);
    } else {
      console.log(`      ⚠️  Trailing slash not configured`);
      hasWarnings = true;
    }
  } else {
    console.log(`      ❌ next.config.js not found`);
    hasErrors = true;
  }
  
  // Check .env.local
  const envPath = path.join(process.cwd(), `apps/${app}/.env.local`);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    ];
    
    let missingVars = [];
    requiredVars.forEach((varName) => {
      if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=\n`)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length === 0) {
      console.log(`      ✅ All required env vars present`);
    } else {
      console.log(`      ❌ Missing env vars: ${missingVars.join(', ')}`);
      hasErrors = true;
    }
  }
});

// 4. Check for hardcoded localhost URLs
console.log('\n4️⃣  Checking for hardcoded localhost URLs...');
const searchDirs = ['apps/admin/src', 'apps/auth/src', 'apps/student/src', 'packages'];

function searchForLocalhost(dir) {
  const results = [];
  
  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walk(filePath);
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for localhost URLs
        if (content.includes('localhost:') || content.includes('127.0.0.1')) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('localhost:') || line.includes('127.0.0.1')) {
              results.push({
                file: filePath.replace(process.cwd(), ''),
                line: index + 1,
                content: line.trim(),
              });
            }
          });
        }
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    walk(dir);
  }
  
  return results;
}

let localhostFound = false;
searchDirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  const results = searchForLocalhost(dirPath);
  
  if (results.length > 0) {
    localhostFound = true;
    console.log(`   ⚠️  Found localhost references in ${dir}:`);
    results.forEach((result) => {
      console.log(`      ${result.file}:${result.line}`);
      console.log(`         ${result.content}`);
    });
  }
});

if (!localhostFound) {
  console.log('   ✅ No hardcoded localhost URLs found');
} else {
  hasWarnings = true;
  issues.push('Hardcoded localhost URLs found - should use env vars');
}

// 5. Check Firebase config usage
console.log('\n5️⃣  Checking Firebase configuration...');
const firebaseConfigPath = path.join(process.cwd(), 'packages/firebase/src/config.ts');
if (fs.existsSync(firebaseConfigPath)) {
  const content = fs.readFileSync(firebaseConfigPath, 'utf-8');
  
  if (content.includes('process.env.NEXT_PUBLIC_FIREBASE')) {
    console.log('   ✅ Using environment variables for Firebase config');
  } else {
    console.log('   ⚠️  Firebase config might be hardcoded');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ Firebase config file not found');
  hasErrors = true;
}

// 6. Check for console.log in production code
console.log('\n6️⃣  Checking for console.log statements...');
let consoleLogCount = 0;

searchDirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  
  function countConsoleLogs(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const files = fs.readdirSync(currentPath);
    
    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        countConsoleLogs(filePath);
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(/console\.(log|debug|info)/g);
        if (matches) {
          consoleLogCount += matches.length;
        }
      }
    });
  }
  
  countConsoleLogs(dirPath);
});

if (consoleLogCount > 0) {
  console.log(`   ⚠️  Found ${consoleLogCount} console.log statements`);
  console.log('      Consider removing or using proper logging in production');
  hasWarnings = true;
} else {
  console.log('   ✅ No console.log statements found');
}

// 7. Check storage rules
console.log('\n7️⃣  Checking Firebase Storage rules...');
const storageRulesPath = path.join(process.cwd(), 'firebase/storage.rules');
if (fs.existsSync(storageRulesPath)) {
  const content = fs.readFileSync(storageRulesPath, 'utf-8');
  
  if (content.includes('isAdminWithFallback()')) {
    console.log('   ✅ Admin check with fallback configured');
  } else {
    console.log('   ⚠️  Admin check might not have fallback');
    hasWarnings = true;
  }
  
  if (content.includes('match /media/{allPaths=**}')) {
    console.log('   ✅ Media storage rules defined');
  } else {
    console.log('   ❌ Media storage rules missing');
    hasErrors = true;
  }
} else {
  console.log('   ❌ storage.rules file not found');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary\n');

if (!hasErrors && !hasWarnings) {
  console.log('✅ All checks passed! Ready for production deployment.');
} else if (hasErrors) {
  console.log('❌ Found critical errors that must be fixed before deployment!');
  console.log('\n🔧 Issues to fix:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Found warnings - deployment possible but not optimal');
  console.log('\n📝 Recommendations:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

console.log('\n📚 Next steps:');
console.log('   1. Fix any errors or warnings above');
console.log('   2. Run: pnpm build');
console.log('   3. Run: firebase deploy --only hosting --project tdcstudent-31d45');
console.log('   4. Verify custom domains in Firebase Console');
console.log('   5. Test on production URLs');

console.log('\n🌐 Production URLs (after domain verification):');
console.log('   Auth:    https://login.thedesigncouncil.vn');
console.log('   Admin:   https://admin.thedesigncouncil.vn');
console.log('   Student: https://portfolio.thedesigncouncil.vn');

console.log('\n🔗 Firebase URLs (available now):');
console.log('   Auth:    https://tdc-auth.web.app');
console.log('   Admin:   https://tdc-admin-2854e.web.app');
console.log('   Student: https://tdc-student.web.app');

console.log('='.repeat(60));
