#!/usr/bin/env node

/**
 * Script kiểm tra kết nối Firebase và cấu hình
 * Sử dụng Firebase Admin SDK để verify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
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

function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Kiểm tra Firebase CLI
logSection('1. KIỂM TRA FIREBASE CLI');

const firebaseCheck = runCommand('firebase --version', true);
if (firebaseCheck.success) {
  log(`✓ Firebase CLI đã cài đặt: ${firebaseCheck.output.trim()}`, 'green');
} else {
  log('✗ Firebase CLI chưa cài đặt', 'red');
  log('\nCài đặt Firebase CLI:', 'yellow');
  log('  npm install -g firebase-tools', 'cyan');
  process.exit(1);
}

// Kiểm tra đăng nhập
logSection('2. KIỂM TRA ĐĂNG NHẬP');

const loginCheck = runCommand('firebase projects:list', true);
if (loginCheck.success) {
  log('✓ Đã đăng nhập Firebase', 'green');
  console.log(loginCheck.output);
} else {
  log('✗ Chưa đăng nhập Firebase', 'red');
  log('\nĐăng nhập:', 'yellow');
  log('  firebase login', 'cyan');
  process.exit(1);
}

// Kiểm tra project hiện tại
logSection('3. KIỂM TRA PROJECT');

const firebasercPath = path.join(__dirname, '..', '.firebaserc');
if (fs.existsSync(firebasercPath)) {
  const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf-8'));
  const projectId = firebaserc.projects.default;
  
  log(`Project ID: ${projectId}`, 'cyan');
  
  // Kiểm tra project có tồn tại không
  const projectCheck = runCommand(`firebase projects:list --json`, true);
  if (projectCheck.success) {
    const projects = JSON.parse(projectCheck.output);
    const project = projects.result.find(p => p.projectId === projectId);
    
    if (project) {
      log(`✓ Project tồn tại: ${project.displayName}`, 'green');
    } else {
      log(`✗ Project ${projectId} không tồn tại hoặc không có quyền truy cập`, 'red');
      process.exit(1);
    }
  }
} else {
  log('✗ .firebaserc không tồn tại', 'red');
  process.exit(1);
}

// Kiểm tra hosting sites
logSection('4. KIỂM TRA HOSTING SITES');

const hostingCheck = runCommand('firebase hosting:sites:list --json', true);
if (hostingCheck.success) {
  try {
    const sites = JSON.parse(hostingCheck.output);
    if (sites.result && sites.result.length > 0) {
      log('✓ Hosting sites:', 'green');
      sites.result.forEach(site => {
        log(`  - ${site.name}: ${site.defaultUrl}`, 'cyan');
      });
    } else {
      log('⚠ Không có hosting sites nào', 'yellow');
    }
  } catch (error) {
    log('⚠ Không thể parse hosting sites', 'yellow');
  }
}

// Kiểm tra functions
logSection('5. KIỂM TRA FUNCTIONS');

const functionsCheck = runCommand('firebase functions:list --json', true);
if (functionsCheck.success) {
  try {
    const functions = JSON.parse(functionsCheck.output);
    if (functions.result && functions.result.length > 0) {
      log('✓ Cloud Functions:', 'green');
      functions.result.forEach(fn => {
        log(`  - ${fn.name}`, 'cyan');
      });
    } else {
      log('⚠ Chưa có functions nào được deploy', 'yellow');
    }
  } catch (error) {
    log('⚠ Không thể parse functions', 'yellow');
  }
}

// Kiểm tra storage
logSection('6. KIỂM TRA STORAGE');

const storageCheck = runCommand('firebase storage:buckets:list --json', true);
if (storageCheck.success) {
  try {
    const buckets = JSON.parse(storageCheck.output);
    if (buckets.result && buckets.result.length > 0) {
      log('✓ Storage buckets:', 'green');
      buckets.result.forEach(bucket => {
        log(`  - ${bucket.name}`, 'cyan');
      });
    } else {
      log('⚠ Không có storage buckets', 'yellow');
    }
  } catch (error) {
    log('⚠ Không thể parse storage buckets', 'yellow');
  }
}

// Kiểm tra firestore
logSection('7. KIỂM TRA FIRESTORE');

log('Firestore database được quản lý qua Firebase Console', 'cyan');
log('URL: https://console.firebase.google.com/project/tdcstudent-31d45/firestore', 'cyan');

// Summary
logSection('TỔNG KẾT');

log('\n✓ Kết nối Firebase thành công!', 'green');
log('\nCác bước tiếp theo:', 'yellow');
log('1. Kiểm tra cấu hình: node scripts/verify-production-config.js', 'cyan');
log('2. Build apps: pnpm build', 'cyan');
log('3. Deploy: node scripts/auto-deploy-all.js', 'cyan');

console.log('\n' + '='.repeat(60) + '\n');
