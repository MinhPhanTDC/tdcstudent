#!/usr/bin/env node

/**
 * Script kiểm tra toàn bộ cấu hình production
 * Đảm bảo tất cả các app đã được cấu hình đúng để deploy
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function checkMark(passed) {
  return passed ? '✓' : '✗';
}

// Kiểm tra file tồn tại
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Đọc file .env
function readEnvFile(filePath) {
  if (!fileExists(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

// Kiểm tra URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Main checks
const checks = {
  envFiles: [],
  firebaseConfig: [],
  nextConfig: [],
  buildOutput: [],
  firebaseHosting: [],
};

let totalIssues = 0;

// 1. Kiểm tra .env files
logSection('1. KIỂM TRA ENVIRONMENT FILES');

const apps = ['auth', 'admin', 'student'];
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_AUTH_URL',
  'NEXT_PUBLIC_ADMIN_URL',
  'NEXT_PUBLIC_STUDENT_URL',
];

apps.forEach(app => {
  const envPath = path.join(__dirname, '..', 'apps', app, '.env.local');
  log(`\nChecking ${app}/.env.local...`, 'blue');
  
  if (!fileExists(envPath)) {
    log(`  ${checkMark(false)} File không tồn tại`, 'red');
    totalIssues++;
    return;
  }
  
  const env = readEnvFile(envPath);
  let appIssues = 0;
  
  requiredEnvVars.forEach(varName => {
    const value = env[varName];
    if (!value) {
      log(`  ${checkMark(false)} Thiếu ${varName}`, 'red');
      appIssues++;
    } else if (varName.includes('URL') && !isValidUrl(value)) {
      log(`  ${checkMark(false)} ${varName} không hợp lệ: ${value}`, 'red');
      appIssues++;
    } else {
      log(`  ${checkMark(true)} ${varName}`, 'green');
    }
  });
  
  totalIssues += appIssues;
  checks.envFiles.push({ app, issues: appIssues });
});

// 2. Kiểm tra Next.js config
logSection('2. KIỂM TRA NEXT.JS CONFIG');

apps.forEach(app => {
  const configPath = path.join(__dirname, '..', 'apps', app, 'next.config.js');
  log(`\nChecking ${app}/next.config.js...`, 'blue');
  
  if (!fileExists(configPath)) {
    log(`  ${checkMark(false)} File không tồn tại`, 'red');
    totalIssues++;
    return;
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  const requiredSettings = [
    { key: "output: 'export'", name: 'Static export' },
    { key: 'trailingSlash: true', name: 'Trailing slash' },
    { key: 'unoptimized: true', name: 'Image optimization disabled' },
  ];
  
  let appIssues = 0;
  requiredSettings.forEach(({ key, name }) => {
    if (content.includes(key)) {
      log(`  ${checkMark(true)} ${name}`, 'green');
    } else {
      log(`  ${checkMark(false)} Thiếu: ${name}`, 'red');
      appIssues++;
    }
  });
  
  totalIssues += appIssues;
  checks.nextConfig.push({ app, issues: appIssues });
});

// 3. Kiểm tra build output
logSection('3. KIỂM TRA BUILD OUTPUT');

apps.forEach(app => {
  const outPath = path.join(__dirname, '..', 'apps', app, 'out');
  log(`\nChecking ${app}/out/...`, 'blue');
  
  if (!fileExists(outPath)) {
    log(`  ${checkMark(false)} Thư mục out/ không tồn tại - Cần build`, 'yellow');
    log(`    Run: cd apps/${app} && pnpm build`, 'yellow');
    totalIssues++;
    return;
  }
  
  const indexPath = path.join(outPath, 'index.html');
  if (fileExists(indexPath)) {
    log(`  ${checkMark(true)} index.html tồn tại`, 'green');
    
    // Kiểm tra size
    const stats = fs.statSync(indexPath);
    if (stats.size > 0) {
      log(`  ${checkMark(true)} File size: ${(stats.size / 1024).toFixed(2)} KB`, 'green');
    } else {
      log(`  ${checkMark(false)} File rỗng`, 'red');
      totalIssues++;
    }
  } else {
    log(`  ${checkMark(false)} index.html không tồn tại`, 'red');
    totalIssues++;
  }
  
  checks.buildOutput.push({ app, exists: fileExists(outPath) });
});

// 4. Kiểm tra Firebase config
logSection('4. KIỂM TRA FIREBASE CONFIG');

const firebaseJsonPath = path.join(__dirname, '..', 'firebase.json');
if (fileExists(firebaseJsonPath)) {
  log('\nChecking firebase.json...', 'blue');
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf-8'));
  
  if (firebaseConfig.hosting && Array.isArray(firebaseConfig.hosting)) {
    log(`  ${checkMark(true)} Hosting config tồn tại`, 'green');
    
    apps.forEach(app => {
      const hostingConfig = firebaseConfig.hosting.find(h => h.target === app);
      if (hostingConfig) {
        log(`  ${checkMark(true)} ${app}: target="${app}", public="${hostingConfig.public}"`, 'green');
        
        // Kiểm tra rewrites
        if (hostingConfig.rewrites && hostingConfig.rewrites.length > 0) {
          log(`    ${checkMark(true)} Rewrites configured`, 'green');
        } else {
          log(`    ${checkMark(false)} Thiếu rewrites`, 'yellow');
        }
      } else {
        log(`  ${checkMark(false)} Thiếu config cho ${app}`, 'red');
        totalIssues++;
      }
    });
  } else {
    log(`  ${checkMark(false)} Hosting config không hợp lệ`, 'red');
    totalIssues++;
  }
} else {
  log('  ${checkMark(false)} firebase.json không tồn tại', 'red');
  totalIssues++;
}

// 5. Kiểm tra .firebaserc
const firebasercPath = path.join(__dirname, '..', '.firebaserc');
if (fileExists(firebasercPath)) {
  log('\nChecking .firebaserc...', 'blue');
  const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf-8'));
  
  if (firebaserc.projects && firebaserc.projects.default) {
    log(`  ${checkMark(true)} Project ID: ${firebaserc.projects.default}`, 'green');
  } else {
    log(`  ${checkMark(false)} Thiếu project ID`, 'red');
    totalIssues++;
  }
  
  if (firebaserc.targets) {
    const projectId = firebaserc.projects.default;
    if (firebaserc.targets[projectId] && firebaserc.targets[projectId].hosting) {
      const targets = firebaserc.targets[projectId].hosting;
      apps.forEach(app => {
        if (targets[app]) {
          log(`  ${checkMark(true)} ${app} target: ${targets[app][0]}`, 'green');
        } else {
          log(`  ${checkMark(false)} Thiếu target cho ${app}`, 'red');
          totalIssues++;
        }
      });
    }
  }
} else {
  log('  ${checkMark(false)} .firebaserc không tồn tại', 'red');
  totalIssues++;
}

// 6. Kiểm tra Firebase Storage Rules
logSection('5. KIỂM TRA FIREBASE RULES');

const storageRulesPath = path.join(__dirname, '..', 'firebase', 'storage.rules');
if (fileExists(storageRulesPath)) {
  log(`  ${checkMark(true)} storage.rules tồn tại`, 'green');
} else {
  log(`  ${checkMark(false)} storage.rules không tồn tại`, 'yellow');
}

const firestoreRulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');
if (fileExists(firestoreRulesPath)) {
  log(`  ${checkMark(true)} firestore.rules tồn tại`, 'green');
} else {
  log(`  ${checkMark(false)} firestore.rules không tồn tại`, 'yellow');
}

// Summary
logSection('TỔNG KẾT');

if (totalIssues === 0) {
  log('\n✓ Tất cả kiểm tra đều PASS!', 'green');
  log('✓ Dự án đã sẵn sàng để deploy', 'green');
  log('\nĐể deploy, chạy:', 'cyan');
  log('  node scripts/auto-deploy-all.js', 'yellow');
} else {
  log(`\n✗ Phát hiện ${totalIssues} vấn đề cần sửa`, 'red');
  log('\nCác bước khắc phục:', 'yellow');
  
  if (checks.buildOutput.some(b => !b.exists)) {
    log('\n1. Build tất cả apps:', 'cyan');
    log('   pnpm build', 'yellow');
  }
  
  if (checks.envFiles.some(e => e.issues > 0)) {
    log('\n2. Kiểm tra lại các file .env.local', 'cyan');
    log('   Đảm bảo tất cả biến môi trường đều có giá trị hợp lệ', 'yellow');
  }
  
  if (checks.nextConfig.some(n => n.issues > 0)) {
    log('\n3. Cập nhật next.config.js', 'cyan');
    log('   Đảm bảo có: output: "export", trailingSlash: true, images.unoptimized: true', 'yellow');
  }
}

// Production URLs
logSection('PRODUCTION URLs');
log('\nAuth:    https://login.thedesigncouncil.vn', 'cyan');
log('Admin:   https://admin.thedesigncouncil.vn', 'cyan');
log('Student: https://portfolio.thedesigncouncil.vn', 'cyan');

log('\n' + '='.repeat(60) + '\n');

process.exit(totalIssues > 0 ? 1 : 0);
