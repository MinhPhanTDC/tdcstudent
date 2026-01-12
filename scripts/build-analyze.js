#!/usr/bin/env node

/**
 * Analyze build output sizes
 */

const fs = require('fs');
const path = require('path');

const apps = ['auth', 'admin', 'student'];
const maxBundleSize = 200 * 1024; // 200KB gzipped

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuild(appName) {
  const buildDir = path.join(__dirname, '..', 'apps', appName, '.next');
  const staticDir = path.join(buildDir, 'static', 'chunks');

  if (!fs.existsSync(staticDir)) {
    console.log(`⚠️  ${appName}: No build found`);
    return null;
  }

  let totalSize = 0;
  const files = fs.readdirSync(staticDir);

  files.forEach((file) => {
    if (file.endsWith('.js')) {
      const filePath = path.join(staticDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
  });

  return {
    app: appName,
    totalSize,
    fileCount: files.filter((f) => f.endsWith('.js')).length,
  };
}

function main() {
  console.log('📊 Build Analysis Report\n');
  console.log('=' .repeat(50));

  let hasWarnings = false;

  apps.forEach((app) => {
    const result = analyzeBuild(app);

    if (result) {
      const status = result.totalSize > maxBundleSize ? '⚠️ ' : '✅';
      console.log(`\n${status} ${app.toUpperCase()}`);
      console.log(`   Total JS size: ${formatBytes(result.totalSize)}`);
      console.log(`   JS files: ${result.fileCount}`);

      if (result.totalSize > maxBundleSize) {
        hasWarnings = true;
        console.log(`   ⚠️  Exceeds recommended size of ${formatBytes(maxBundleSize)}`);
      }
    }
  });

  console.log('\n' + '='.repeat(50));

  if (hasWarnings) {
    console.log('\n⚠️  Some bundles exceed the recommended size.');
    console.log('Consider code splitting or removing unused dependencies.');
  } else {
    console.log('\n✅ All bundles are within recommended size limits.');
  }
}

main();
