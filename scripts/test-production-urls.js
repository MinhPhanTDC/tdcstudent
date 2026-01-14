#!/usr/bin/env node

/**
 * Script test tất cả production URLs
 * Kiểm tra HTTP status và basic functionality
 */

const https = require('https');
const http = require('http');

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

// Test một URL
function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 10000,
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          hasHtml: data.includes('<!DOCTYPE html>') || data.includes('<html'),
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

// Main test
async function main() {
  logSection('KIỂM TRA PRODUCTION URLs');

  const urls = [
    {
      name: 'Auth App',
      url: 'https://login.thedesigncouncil.vn',
      expectedStatus: [200, 301, 302],
    },
    {
      name: 'Admin App',
      url: 'https://admin.thedesigncouncil.vn',
      expectedStatus: [200, 301, 302],
    },
    {
      name: 'Student App',
      url: 'https://portfolio.thedesigncouncil.vn',
      expectedStatus: [200, 301, 302],
    },
  ];

  let allPassed = true;

  for (const { name, url, expectedStatus } of urls) {
    log(`\nTesting ${name}...`, 'cyan');
    log(`URL: ${url}`, 'yellow');

    const result = await testUrl(url);

    if (!result.success) {
      log(`✗ FAILED: ${result.error}`, 'red');
      allPassed = false;
      continue;
    }

    const statusOk = expectedStatus.includes(result.status);
    const statusColor = statusOk ? 'green' : 'red';
    const statusMark = statusOk ? '✓' : '✗';

    log(`${statusMark} Status: ${result.status}`, statusColor);

    if (result.hasHtml) {
      log('✓ HTML content detected', 'green');
    } else {
      log('✗ No HTML content', 'red');
      allPassed = false;
    }

    log(`  Body length: ${result.bodyLength} bytes`, 'yellow');

    if (result.headers['content-type']) {
      log(`  Content-Type: ${result.headers['content-type']}`, 'yellow');
    }

    if (!statusOk) {
      allPassed = false;
    }
  }

  // Summary
  logSection('TỔNG KẾT');

  if (allPassed) {
    log('\n✓ Tất cả URLs đều hoạt động!', 'green');
  } else {
    log('\n✗ Một số URLs có vấn đề', 'red');
    log('\nCác bước khắc phục:', 'yellow');
    log('1. Kiểm tra domains đã được verify chưa', 'cyan');
    log('2. Kiểm tra Firebase Hosting đã deploy chưa', 'cyan');
    log('3. Kiểm tra DNS settings', 'cyan');
    log('4. Chờ DNS propagation (có thể mất 24-48h)', 'cyan');
  }

  logSection('LƯU Ý');
  
  log('\nNếu domains đang chờ verify:', 'yellow');
  log('- Domains sẽ không hoạt động cho đến khi verify xong', 'cyan');
  log('- Có thể test bằng Firebase default URLs:', 'cyan');
  log('  • https://tdc-auth.web.app', 'yellow');
  log('  • https://tdc-admin-2854e.web.app', 'yellow');
  log('  • https://tdc-student.web.app', 'yellow');

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
