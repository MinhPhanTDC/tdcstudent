#!/usr/bin/env node

/**
 * Script test Firebase default URLs (*.web.app)
 * Sử dụng khi custom domains chưa verify
 */

const https = require('https');

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

function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          bodyLength: data.length,
          hasHtml: data.includes('<!DOCTYPE html>') || data.includes('<html'),
          hasTitle: data.match(/<title>(.*?)<\/title>/),
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

async function main() {
  logSection('KIỂM TRA FIREBASE DEFAULT URLs');

  log('\nThông tin:', 'yellow');
  log('- Firebase tự động tạo URLs dạng *.web.app và *.firebaseapp.com', 'cyan');
  log('- Các URLs này luôn hoạt động ngay sau khi deploy', 'cyan');
  log('- Sử dụng để test khi custom domains chưa verify', 'cyan');

  const urls = [
    {
      name: 'Auth App',
      url: 'https://tdc-auth.web.app',
      firebaseappUrl: 'https://tdc-auth.firebaseapp.com',
    },
    {
      name: 'Admin App',
      url: 'https://tdc-admin-2854e.web.app',
      firebaseappUrl: 'https://tdc-admin-2854e.firebaseapp.com',
    },
    {
      name: 'Student App',
      url: 'https://tdc-student.web.app',
      firebaseappUrl: 'https://tdc-student.firebaseapp.com',
    },
  ];

  let allPassed = true;

  for (const { name, url, firebaseappUrl } of urls) {
    log(`\n${'─'.repeat(60)}`, 'cyan');
    log(`Testing ${name}`, 'cyan');
    log(`${'─'.repeat(60)}`, 'cyan');

    // Test .web.app URL
    log(`\n1. Testing ${url}...`, 'yellow');
    const result1 = await testUrl(url);

    if (!result1.success) {
      log(`✗ FAILED: ${result1.error}`, 'red');
      allPassed = false;
    } else {
      const statusOk = result1.status === 200;
      log(`${statusOk ? '✓' : '✗'} Status: ${result1.status}`, statusOk ? 'green' : 'red');
      log(`${result1.hasHtml ? '✓' : '✗'} HTML content`, result1.hasHtml ? 'green' : 'red');
      
      if (result1.hasTitle) {
        log(`✓ Title: ${result1.hasTitle[1]}`, 'green');
      }
      
      log(`  Body length: ${result1.bodyLength} bytes`, 'cyan');

      if (!statusOk || !result1.hasHtml) {
        allPassed = false;
      }
    }

    // Test .firebaseapp.com URL
    log(`\n2. Testing ${firebaseappUrl}...`, 'yellow');
    const result2 = await testUrl(firebaseappUrl);

    if (!result2.success) {
      log(`✗ FAILED: ${result2.error}`, 'red');
      allPassed = false;
    } else {
      const statusOk = result2.status === 200 || result2.status === 301;
      log(`${statusOk ? '✓' : '✗'} Status: ${result2.status}`, statusOk ? 'green' : 'red');
      
      if (result2.status === 301) {
        log('  (Redirects to .web.app - this is normal)', 'yellow');
      }

      if (!statusOk) {
        allPassed = false;
      }
    }
  }

  // Summary
  logSection('TỔNG KẾT');

  if (allPassed) {
    log('\n✓ Tất cả Firebase URLs đều hoạt động!', 'green');
    log('\nBạn có thể sử dụng các URLs này để test:', 'cyan');
    urls.forEach(({ name, url }) => {
      log(`  ${name}: ${url}`, 'yellow');
    });
  } else {
    log('\n✗ Một số URLs có vấn đề', 'red');
    log('\nCác bước khắc phục:', 'yellow');
    log('1. Kiểm tra đã deploy chưa:', 'cyan');
    log('   firebase deploy --only hosting --project tdcstudent-31d45', 'yellow');
    log('2. Kiểm tra build output tồn tại:', 'cyan');
    log('   ls -la apps/auth/out/', 'yellow');
    log('   ls -la apps/admin/out/', 'yellow');
    log('   ls -la apps/student/out/', 'yellow');
    log('3. Rebuild và redeploy:', 'cyan');
    log('   pnpm build', 'yellow');
    log('   node scripts/auto-deploy-all.js', 'yellow');
  }

  logSection('CUSTOM DOMAINS');

  log('\nKhi custom domains đã verify, chúng sẽ trỏ đến:', 'yellow');
  log('  login.thedesigncouncil.vn → tdc-auth.web.app', 'cyan');
  log('  admin.thedesigncouncil.vn → tdc-admin-2854e.web.app', 'cyan');
  log('  portfolio.thedesigncouncil.vn → tdc-student.web.app', 'cyan');

  log('\nĐể verify custom domains:', 'yellow');
  log('1. Vào Firebase Console > Hosting', 'cyan');
  log('2. Click "Add custom domain"', 'cyan');
  log('3. Follow hướng dẫn thêm DNS records', 'cyan');
  log('4. Chờ verify (có thể mất 24-48h)', 'cyan');

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
