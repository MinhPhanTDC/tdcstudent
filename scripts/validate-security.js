#!/usr/bin/env node

/**
 * Security Validation Script for Firebase Rules
 * 
 * Validates Firebase Storage and Firestore rules for security issues:
 * - Unauthenticated write detection in storage.rules
 * - Overly permissive read rules in firestore.rules
 * - TODO/TEMPORARY comment detection
 * 
 * Usage:
 *   node scripts/validate-security.js              # Run all security checks
 *   node scripts/validate-security.js --strict     # Fail on warnings too
 *   node scripts/validate-security.js --quiet      # Minimal output
 *   node scripts/validate-security.js --json       # Output as JSON
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

const fs = require('fs');
const path = require('path');

// Parse CLI arguments
const args = process.argv.slice(2);
const isStrict = args.includes('--strict');
const isQuiet = args.includes('--quiet');
const isJson = args.includes('--json');

/**
 * @typedef {'error' | 'warning'} Severity
 * @typedef {'storage' | 'firestore' | 'config'} Category
 * 
 * @typedef {Object} SecurityIssue
 * @property {Severity} severity
 * @property {Category} category
 * @property {string} file
 * @property {number} [line]
 * @property {string} message
 * @property {string} recommendation
 */

/**
 * @typedef {Object} SecurityValidationResult
 * @property {boolean} passed
 * @property {SecurityIssue[]} issues
 * @property {{ errors: number, warnings: number }} summary
 */

// File paths
const STORAGE_RULES_PATH = path.join(process.cwd(), 'firebase', 'storage.rules');
const FIRESTORE_RULES_PATH = path.join(process.cwd(), 'firebase', 'firestore.rules');

function log(message) {
  if (!isQuiet && !isJson) console.log(message);
}

/**
 * Read file content safely
 * @param {string} filePath 
 * @returns {string | null}
 */
function readFileContent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Check for unauthenticated write rules in storage.rules
 * @param {string} content 
 * @param {string} filePath 
 * @returns {SecurityIssue[]}
 */
function checkUnauthenticatedWrites(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Pattern to detect write rules
  const writeRulePattern = /allow\s+write\s*:/i;
  // Pattern to detect authentication check
  const authCheckPattern = /isAuthenticated\(\)|request\.auth\s*!=\s*null|isAdmin\(\)/i;
  
  let matchPath = '';
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Track match blocks
    if (line.includes('match ')) {
      const matchMatch = line.match(/match\s+([^\s{]+)/);
      if (matchMatch) {
        matchPath = matchMatch[1];
      }
    }
    
    // Track braces for block scope
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
    
    if (braceCount === 0) {
      matchPath = '';
    }
    
    // Check for write rules
    if (writeRulePattern.test(line)) {
      // Get the full rule (may span multiple lines)
      let fullRule = line;
      let j = i;
      while (!fullRule.includes(';') && j < lines.length - 1) {
        j++;
        fullRule += ' ' + lines[j].trim();
      }
      
      // Check if the rule requires authentication
      if (!authCheckPattern.test(fullRule)) {
        // Check if it's a deny rule (allow write: if false)
        if (!/if\s+false/i.test(fullRule)) {
          issues.push({
            severity: 'error',
            category: 'storage',
            file: filePath,
            line: lineNumber,
            message: `Unauthenticated write rule detected${matchPath ? ` in path "${matchPath}"` : ''}`,
            recommendation: 'Add isAuthenticated() check to write rules: allow write: if isAuthenticated() && ...',
          });
        }
      }
    }
  }
  
  return issues;
}

/**
 * Check for overly permissive read rules in firestore.rules
 * @param {string} content 
 * @param {string} filePath 
 * @returns {SecurityIssue[]}
 */
function checkOverlyPermissiveReads(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Pattern to detect read rules that allow all
  const readAllPattern = /allow\s+read\s*:\s*if\s+true\s*;/i;
  
  let matchPath = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Track match blocks
    if (line.includes('match ')) {
      const matchMatch = line.match(/match\s+([^\s{]+)/);
      if (matchMatch) {
        matchPath = matchMatch[1];
      }
    }
    
    // Check for overly permissive read rules
    if (readAllPattern.test(line)) {
      // Skip known public collections (settings with specific IDs)
      const isKnownPublic = matchPath.includes('/settings/') && 
        lines.slice(Math.max(0, i - 5), i + 1).some(l => l.includes("settingId == 'handbook'"));
      
      if (!isKnownPublic) {
        issues.push({
          severity: 'warning',
          category: 'firestore',
          file: filePath,
          line: lineNumber,
          message: `Overly permissive read rule detected${matchPath ? ` in path "${matchPath}"` : ''}`,
          recommendation: 'Consider adding authentication check: allow read: if isAuthenticated()',
        });
      }
    }
  }
  
  return issues;
}

/**
 * Check for TODO/TEMPORARY comments in rules files
 * @param {string} content 
 * @param {string} filePath 
 * @returns {SecurityIssue[]}
 */
function checkTodoTemporaryComments(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Patterns to detect TODO/TEMPORARY comments
  // Only match when these words appear as markers (typically followed by colon or at start of comment)
  // Excludes section headers like "// ============ Temporary Uploads ============"
  const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX)\s*:/i;
  const temporaryPattern = /\/\/\s*(TEMPORARY|TEMP)\s*:/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    if (todoPattern.test(line)) {
      const match = line.match(/\/\/\s*(.+)/);
      const comment = match ? match[1].trim() : '';
      
      issues.push({
        severity: 'warning',
        category: filePath.includes('storage') ? 'storage' : 'firestore',
        file: filePath,
        line: lineNumber,
        message: `TODO comment found: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        recommendation: 'Review and resolve TODO comments before production deployment',
      });
    }
    
    if (temporaryPattern.test(line)) {
      const match = line.match(/\/\/\s*(.+)/);
      const comment = match ? match[1].trim() : '';
      
      issues.push({
        severity: 'error',
        category: filePath.includes('storage') ? 'storage' : 'firestore',
        file: filePath,
        line: lineNumber,
        message: `TEMPORARY code marker found: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        recommendation: 'Remove temporary code and markers before production deployment',
      });
    }
  }
  
  return issues;
}

/**
 * Run all security checks
 * @returns {SecurityValidationResult}
 */
function validateSecurity() {
  /** @type {SecurityIssue[]} */
  const issues = [];
  
  log('╔════════════════════════════════════════════════════════════╗');
  log('║              Security Rules Validation                     ║');
  log('╚════════════════════════════════════════════════════════════╝');
  log('');
  log(`Mode: ${isStrict ? 'Strict (warnings treated as errors)' : 'Standard'}`);
  log('');
  
  // Check storage rules
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('📋 Checking Firebase Storage Rules:');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const storageContent = readFileContent(STORAGE_RULES_PATH);
  if (storageContent) {
    const storageIssues = [
      ...checkUnauthenticatedWrites(storageContent, STORAGE_RULES_PATH),
      ...checkTodoTemporaryComments(storageContent, STORAGE_RULES_PATH),
    ];
    
    if (storageIssues.length === 0) {
      log('   ✅ No security issues found in storage.rules');
    } else {
      storageIssues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️ ';
        log(`   ${icon} Line ${issue.line}: ${issue.message}`);
      });
    }
    
    issues.push(...storageIssues);
  } else {
    log('   ⚠️  storage.rules file not found');
    issues.push({
      severity: 'warning',
      category: 'storage',
      file: STORAGE_RULES_PATH,
      message: 'Storage rules file not found',
      recommendation: 'Create firebase/storage.rules with proper security rules',
    });
  }
  log('');
  
  // Check firestore rules
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('📋 Checking Firebase Firestore Rules:');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const firestoreContent = readFileContent(FIRESTORE_RULES_PATH);
  if (firestoreContent) {
    const firestoreIssues = [
      ...checkOverlyPermissiveReads(firestoreContent, FIRESTORE_RULES_PATH),
      ...checkTodoTemporaryComments(firestoreContent, FIRESTORE_RULES_PATH),
    ];
    
    if (firestoreIssues.length === 0) {
      log('   ✅ No security issues found in firestore.rules');
    } else {
      firestoreIssues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️ ';
        log(`   ${icon} Line ${issue.line || 'N/A'}: ${issue.message}`);
      });
    }
    
    issues.push(...firestoreIssues);
  } else {
    log('   ⚠️  firestore.rules file not found');
    issues.push({
      severity: 'warning',
      category: 'firestore',
      file: FIRESTORE_RULES_PATH,
      message: 'Firestore rules file not found',
      recommendation: 'Create firebase/firestore.rules with proper security rules',
    });
  }
  log('');
  
  // Calculate summary
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  
  const passed = isStrict 
    ? (errors === 0 && warnings === 0)
    : (errors === 0);
  
  return {
    passed,
    issues,
    summary: { errors, warnings },
  };
}

/**
 * Format and output results
 * @param {SecurityValidationResult} result 
 */
function outputResults(result) {
  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.passed ? 0 : 1);
    return;
  }
  
  // Output detailed issues with recommendations
  if (result.issues.length > 0) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('📋 Security Issues Details:');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    result.issues.forEach((issue, index) => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️ ';
      log(`\n   ${index + 1}. ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
      log(`      File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
      log(`      Recommendation: ${issue.recommendation}`);
    });
    log('');
  }
  
  // Output summary
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('📊 Summary:');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`   Errors:   ${result.summary.errors}`);
  log(`   Warnings: ${result.summary.warnings}`);
  log('');
  
  if (result.passed) {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('✅ Security validation passed!');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Security validation FAILED!');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('\n📝 To fix security issues:');
    console.error('   1. Review each issue above');
    console.error('   2. Apply the recommended fixes');
    console.error('   3. Run validation again: node scripts/validate-security.js');
    console.error('');
  }
  log('');
  
  process.exit(result.passed ? 0 : 1);
}

// Export for testing
module.exports = {
  validateSecurity,
  checkUnauthenticatedWrites,
  checkOverlyPermissiveReads,
  checkTodoTemporaryComments,
  readFileContent,
};

// Run if called directly
if (require.main === module) {
  const result = validateSecurity();
  outputResults(result);
}
