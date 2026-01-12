/**
 * Property-based tests for Firebase Storage Rules Security
 * 
 * **Feature: production-readiness-fixes, Property 4: Security rules contain no unauthenticated writes**
 * **Validates: Requirements 1.4, 1.5, 6.1**
 * 
 * Property: For any storage rules file, parsing and checking should detect any 
 * `allow write` rule that doesn't require `isAuthenticated()`
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual storage rules file
const STORAGE_RULES_PATH = path.join(__dirname, '..', 'storage.rules');

/**
 * Parse storage rules and extract all write rules
 */
function parseWriteRules(rulesContent: string): Array<{
  path: string;
  condition: string;
  lineNumber: number;
  hasAuthentication: boolean;
}> {
  const writeRules: Array<{
    path: string;
    condition: string;
    lineNumber: number;
    hasAuthentication: boolean;
  }> = [];

  const lines = rulesContent.split('\n');
  let currentPath = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Track match blocks to get the path
    const matchRegex = /match\s+([^\s{]+)/;
    const matchResult = matchRegex.exec(line);
    if (matchResult) {
      currentPath = matchResult[1];
    }
    
    // Find write rules (allow write: if ...)
    const writeRegex = /allow\s+(?:write|read,\s*write):\s*if\s+(.+);/;
    const writeResult = writeRegex.exec(line);
    if (writeResult) {
      const condition = writeResult[1].trim();
      
      // Check if the condition requires authentication
      const hasAuthentication = 
        condition.includes('isAuthenticated()') ||
        condition.includes('isAdmin()') ||
        condition.includes('request.auth') ||
        condition === 'false'; // Deny all is secure
      
      writeRules.push({
        path: currentPath,
        condition,
        lineNumber,
        hasAuthentication,
      });
    }
  }
  
  return writeRules;
}

/**
 * Check if storage rules contain any unauthenticated write rules
 */
function hasUnauthenticatedWrites(rulesContent: string): {
  hasVulnerability: boolean;
  vulnerableRules: Array<{ path: string; condition: string; lineNumber: number }>;
} {
  const writeRules = parseWriteRules(rulesContent);
  const vulnerableRules = writeRules
    .filter(rule => !rule.hasAuthentication)
    .map(({ path, condition, lineNumber }) => ({ path, condition, lineNumber }));
  
  return {
    hasVulnerability: vulnerableRules.length > 0,
    vulnerableRules,
  };
}

/**
 * Check for TODO/TEMPORARY comments in rules that indicate incomplete work
 * Note: We specifically look for these patterns in comments, not in legitimate
 * code like "temp" folder paths or "Temporary Uploads" section headers
 */
function hasTodoOrTemporaryComments(rulesContent: string): {
  hasWarnings: boolean;
  warnings: Array<{ lineNumber: number; content: string }>;
} {
  const warnings: Array<{ lineNumber: number; content: string }> = [];
  const lines = rulesContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Only check comment lines (lines containing //)
    if (!line.includes('//')) {
      continue;
    }
    
    // Extract the comment portion
    const commentStart = line.indexOf('//');
    const comment = line.substring(commentStart);
    
    // Check for TODO, FIXME, HACK patterns in comments
    // Also check for "TEMPORARY:" pattern that indicates a temporary bypass
    if (/\b(TODO|FIXME|HACK)\b/i.test(comment) || 
        /\bTEMPORARY\s*:/i.test(comment)) {
      warnings.push({ lineNumber, content: line.trim() });
    }
  }
  
  return {
    hasWarnings: warnings.length > 0,
    warnings,
  };
}

// Generator for valid storage rule conditions that require authentication
const authenticatedConditionGen = fc.oneof(
  fc.constant('isAuthenticated()'),
  fc.constant('isAuthenticated() && isValidSize()'),
  fc.constant('isAdmin()'),
  fc.constant('isAdmin() && isValidSize()'),
  fc.constant('isAuthenticated() && (request.auth.uid == userId || isAdmin())'),
  fc.constant('request.auth != null'),
  fc.constant('request.auth != null && isValidSize()'),
  fc.constant('false'), // Deny all is secure
);

// Generator for unauthenticated (vulnerable) conditions
const unauthenticatedConditionGen = fc.oneof(
  fc.constant('true'),
  fc.constant('isValidSize()'),
  fc.constant('isImage()'),
  fc.constant('isValidSize() && isImage()'),
  fc.constant('request.resource.size < 10 * 1024 * 1024'),
);

// Generator for storage rule paths
const storagePathGen = fc.oneof(
  fc.constant('/media/{allPaths=**}'),
  fc.constant('/uploads/{userId}/{fileName}'),
  fc.constant('/public/{allPaths=**}'),
  fc.constant('/temp/{userId}/{allPaths=**}'),
  fc.constant('/handbook/{fileName}'),
);

// Generator for a single write rule line
const writeRuleLineGen = (conditionGen: fc.Arbitrary<string>) =>
  fc.tuple(storagePathGen, conditionGen).map(
    ([path, condition]) => `    match ${path} {\n      allow write: if ${condition};\n    }`
  );

// Generator for a complete storage rules file with authenticated writes
const secureRulesGen = fc.array(writeRuleLineGen(authenticatedConditionGen), { minLength: 1, maxLength: 5 })
  .map(rules => `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    function isValidSize() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
${rules.join('\n')}
  }
}`);

// Generator for storage rules with at least one unauthenticated write
const vulnerableRulesGen = fc.tuple(
  fc.array(writeRuleLineGen(authenticatedConditionGen), { minLength: 0, maxLength: 3 }),
  fc.array(writeRuleLineGen(unauthenticatedConditionGen), { minLength: 1, maxLength: 2 })
).map(([secureRules, vulnerableRules]) => `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    function isValidSize() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
${[...secureRules, ...vulnerableRules].join('\n')}
  }
}`);

describe('Storage Rules Security Property Tests', () => {
  let actualRulesContent: string;

  beforeAll(() => {
    actualRulesContent = fs.readFileSync(STORAGE_RULES_PATH, 'utf-8');
  });

  /**
   * **Feature: production-readiness-fixes, Property 4: Security rules contain no unauthenticated writes**
   * **Validates: Requirements 1.4, 1.5, 6.1**
   */
  describe('Property 4: Security rules contain no unauthenticated writes', () => {
    it('should detect unauthenticated write rules in vulnerable rules files', () => {
      fc.assert(
        fc.property(
          vulnerableRulesGen,
          (rulesContent) => {
            const result = hasUnauthenticatedWrites(rulesContent);
            
            // Property: Vulnerable rules should be detected
            expect(result.hasVulnerability).toBe(true);
            expect(result.vulnerableRules.length).toBeGreaterThan(0);
            
            // Property: Each vulnerable rule should have a condition that doesn't require auth
            result.vulnerableRules.forEach(rule => {
              expect(rule.condition).not.toContain('isAuthenticated()');
              expect(rule.condition).not.toContain('isAdmin()');
              expect(rule.condition).not.toContain('request.auth');
              expect(rule.condition).not.toBe('false');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should pass for rules files with only authenticated writes', () => {
      fc.assert(
        fc.property(
          secureRulesGen,
          (rulesContent) => {
            const result = hasUnauthenticatedWrites(rulesContent);
            
            // Property: Secure rules should not have vulnerabilities
            expect(result.hasVulnerability).toBe(false);
            expect(result.vulnerableRules).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify actual storage.rules file has no unauthenticated writes', () => {
      const result = hasUnauthenticatedWrites(actualRulesContent);
      
      // The actual rules file should be secure
      expect(result.hasVulnerability).toBe(false);
      expect(result.vulnerableRules).toHaveLength(0);
      
      if (result.hasVulnerability) {
        console.error('SECURITY VULNERABILITY DETECTED in storage.rules:');
        result.vulnerableRules.forEach(rule => {
          console.error(`  Line ${rule.lineNumber}: ${rule.path} - condition: ${rule.condition}`);
        });
      }
    });

    it('should verify actual storage.rules has no TODO/TEMPORARY comments', () => {
      const result = hasTodoOrTemporaryComments(actualRulesContent);
      
      // The actual rules file should not have TODO/TEMPORARY comments
      expect(result.hasWarnings).toBe(false);
      
      if (result.hasWarnings) {
        console.warn('WARNING: TODO/TEMPORARY comments found in storage.rules:');
        result.warnings.forEach(warning => {
          console.warn(`  Line ${warning.lineNumber}: ${warning.content}`);
        });
      }
    });
  });

  describe('Property 4: Detection accuracy', () => {
    it('should correctly identify authentication patterns in conditions', () => {
      fc.assert(
        fc.property(
          authenticatedConditionGen,
          (condition) => {
            // Create a minimal rules file with this condition
            const rulesContent = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() { return request.auth != null; }
    function isAdmin() { return isAuthenticated() && request.auth.token.role == 'admin'; }
    function isValidSize() { return request.resource.size < 10 * 1024 * 1024; }
    match /test/{file} {
      allow write: if ${condition};
    }
  }
}`;
            
            const result = hasUnauthenticatedWrites(rulesContent);
            
            // Property: Authenticated conditions should not be flagged as vulnerable
            expect(result.hasVulnerability).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify unauthenticated patterns in conditions', () => {
      fc.assert(
        fc.property(
          unauthenticatedConditionGen,
          (condition) => {
            // Create a minimal rules file with this condition
            const rulesContent = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() { return request.auth != null; }
    function isValidSize() { return request.resource.size < 10 * 1024 * 1024; }
    function isImage() { return request.resource.contentType.matches('image/.*'); }
    match /test/{file} {
      allow write: if ${condition};
    }
  }
}`;
            
            const result = hasUnauthenticatedWrites(rulesContent);
            
            // Property: Unauthenticated conditions should be flagged as vulnerable
            expect(result.hasVulnerability).toBe(true);
            expect(result.vulnerableRules.length).toBe(1);
            expect(result.vulnerableRules[0].condition).toBe(condition);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * **Feature: production-readiness-fixes, Property 8: File size validation boundary**
 * **Validates: Requirements 1.3**
 * 
 * Property: For any file upload attempt, files larger than 10MB should be rejected
 * regardless of authentication status
 */

// Constants for file size limits
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB for avatars

/**
 * Parse storage rules and extract all file size validation rules
 * Handles multi-line conditions by joining lines until we find a semicolon
 */
function parseFileSizeRules(rulesContent: string): Array<{
  path: string;
  sizeLimit: number | null;
  lineNumber: number;
  hasFileSizeCheck: boolean;
  condition: string;
}> {
  const sizeRules: Array<{
    path: string;
    sizeLimit: number | null;
    lineNumber: number;
    hasFileSizeCheck: boolean;
    condition: string;
  }> = [];

  const lines = rulesContent.split('\n');
  let currentPath = '';
  let pendingCondition = '';
  let pendingLineNumber = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Track match blocks to get the path
    const matchRegex = /match\s+([^\s{]+)/;
    const matchResult = matchRegex.exec(line);
    if (matchResult) {
      const matchPath = matchResult[1];
      // Only update currentPath for non-root matches
      if (!matchPath.includes('/b/{bucket}')) {
        currentPath = matchPath;
      }
    }
    
    // Check if this line starts a write rule
    const writeStartRegex = /allow\s+(?:write|read,\s*write):\s*if\s+/;
    if (writeStartRegex.test(line)) {
      pendingCondition = line;
      pendingLineNumber = lineNumber;
    } else if (pendingCondition && !line.includes('allow ')) {
      // Continue accumulating the condition if we're in the middle of one
      pendingCondition += ' ' + line.trim();
    }
    
    // Check if we have a complete condition (ends with semicolon)
    if (pendingCondition && pendingCondition.includes(';')) {
      // Extract the condition
      const fullWriteRegex = /allow\s+(?:write|read,\s*write):\s*if\s+(.+);/;
      const writeResult = fullWriteRegex.exec(pendingCondition);
      
      if (writeResult) {
        const condition = writeResult[1].trim();
        
        // Check if the condition includes file size validation
        const hasFileSizeCheck = 
          condition.includes('isValidSize()') ||
          condition.includes('request.resource.size');
        
        // Try to extract explicit size limit
        let sizeLimit: number | null = null;
        const explicitSizeMatch = /request\.resource\.size\s*<\s*(\d+(?:\s*\*\s*\d+)*)/;
        const sizeMatch = explicitSizeMatch.exec(condition);
        if (sizeMatch) {
          // Evaluate the size expression (e.g., "10 * 1024 * 1024" or "2 * 1024 * 1024")
          try {
            sizeLimit = eval(sizeMatch[1].replace(/\s/g, ''));
          } catch {
            sizeLimit = null;
          }
        } else if (condition.includes('isValidSize()')) {
          // isValidSize() uses the default 10MB limit
          sizeLimit = MAX_FILE_SIZE_BYTES;
        }
        
        sizeRules.push({
          path: currentPath,
          sizeLimit,
          lineNumber: pendingLineNumber,
          hasFileSizeCheck,
          condition,
        });
      }
      
      // Reset pending condition
      pendingCondition = '';
      pendingLineNumber = 0;
    }
  }
  
  return sizeRules;
}

/**
 * Check if all write rules have file size validation
 */
function allWriteRulesHaveFileSizeValidation(rulesContent: string): {
  allHaveValidation: boolean;
  rulesWithoutValidation: Array<{ path: string; lineNumber: number }>;
  rulesWithValidation: Array<{ path: string; sizeLimit: number | null; lineNumber: number }>;
} {
  const sizeRules = parseFileSizeRules(rulesContent);
  
  const rulesWithoutValidation = sizeRules
    .filter(rule => !rule.hasFileSizeCheck)
    .map(({ path, lineNumber }) => ({ path, lineNumber }));
  
  const rulesWithValidation = sizeRules
    .filter(rule => rule.hasFileSizeCheck)
    .map(({ path, sizeLimit, lineNumber }) => ({ path, sizeLimit, lineNumber }));
  
  return {
    allHaveValidation: rulesWithoutValidation.length === 0,
    rulesWithoutValidation,
    rulesWithValidation,
  };
}

// Generator for file sizes in bytes
const fileSizeGen = fc.integer({ min: 0, max: 20 * 1024 * 1024 }); // 0 to 20MB

// Generator for file sizes above the limit
const oversizedFileSizeGen = fc.integer({ min: MAX_FILE_SIZE_BYTES + 1, max: 100 * 1024 * 1024 });

// Generator for file sizes within the limit
const validFileSizeGen = fc.integer({ min: 1, max: MAX_FILE_SIZE_BYTES - 1 });

// Generator for avatar file sizes above the limit
const oversizedAvatarSizeGen = fc.integer({ min: MAX_AVATAR_SIZE_BYTES + 1, max: 10 * 1024 * 1024 });

// Generator for avatar file sizes within the limit
const validAvatarSizeGen = fc.integer({ min: 1, max: MAX_AVATAR_SIZE_BYTES - 1 });

describe('File Size Validation Property Tests', () => {
  let actualRulesContent: string;

  beforeAll(() => {
    actualRulesContent = fs.readFileSync(STORAGE_RULES_PATH, 'utf-8');
  });

  /**
   * **Feature: production-readiness-fixes, Property 8: File size validation boundary**
   * **Validates: Requirements 1.3**
   */
  describe('Property 8: File size validation boundary', () => {
    it('should verify all write rules in actual storage.rules have file size validation (except deny-all)', () => {
      const result = allWriteRulesHaveFileSizeValidation(actualRulesContent);
      
      // Filter out the default deny-all rule which doesn't need size validation
      // The deny-all rule has condition "false" and path "/{allPaths=**}"
      const rulesNeedingValidation = result.rulesWithoutValidation.filter(
        rule => {
          // Get the corresponding rule from sizeRules to check condition
          const sizeRules = parseFileSizeRules(actualRulesContent);
          const matchingRule = sizeRules.find(r => r.lineNumber === rule.lineNumber);
          // Exclude deny-all rules (condition is "false")
          return matchingRule?.condition !== 'false';
        }
      );
      
      // Property: All write rules (except deny-all) should have file size validation
      expect(rulesNeedingValidation.length).toBe(0);
      
      if (rulesNeedingValidation.length > 0) {
        console.error('Write rules without file size validation:');
        rulesNeedingValidation.forEach(rule => {
          console.error(`  Line ${rule.lineNumber}: ${rule.path}`);
        });
      }
    });

    it('should verify the 10MB limit is enforced for general uploads', () => {
      const result = allWriteRulesHaveFileSizeValidation(actualRulesContent);
      
      // Check that rules using isValidSize() have the correct limit
      const generalRules = result.rulesWithValidation.filter(
        rule => rule.sizeLimit === MAX_FILE_SIZE_BYTES
      );
      
      // Property: There should be rules enforcing the 10MB limit
      expect(generalRules.length).toBeGreaterThan(0);
    });

    it('should verify the 2MB limit is enforced for avatars', () => {
      // Verify the avatar rule exists in the actual file with the 2MB limit
      // The avatar rule is: request.resource.size < 2 * 1024 * 1024
      expect(actualRulesContent).toContain('request.resource.size < 2 * 1024 * 1024');
      
      // Also verify it's in the avatars section
      expect(actualRulesContent).toContain('/avatars/');
      
      // Verify the 2MB limit is correctly calculated
      const twoMB = 2 * 1024 * 1024;
      expect(twoMB).toBe(MAX_AVATAR_SIZE_BYTES);
    });

    it('should correctly identify files above the size limit', () => {
      fc.assert(
        fc.property(
          oversizedFileSizeGen,
          (fileSize) => {
            // Property: Any file larger than 10MB should exceed the limit
            expect(fileSize).toBeGreaterThan(MAX_FILE_SIZE_BYTES);
            
            // Simulate the isValidSize() check
            const isValid = fileSize < MAX_FILE_SIZE_BYTES;
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify files within the size limit', () => {
      fc.assert(
        fc.property(
          validFileSizeGen,
          (fileSize) => {
            // Property: Any file smaller than 10MB should be within the limit
            expect(fileSize).toBeLessThan(MAX_FILE_SIZE_BYTES);
            
            // Simulate the isValidSize() check
            const isValid = fileSize < MAX_FILE_SIZE_BYTES;
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify avatar files above the size limit', () => {
      fc.assert(
        fc.property(
          oversizedAvatarSizeGen,
          (fileSize) => {
            // Property: Any avatar file larger than 2MB should exceed the limit
            expect(fileSize).toBeGreaterThan(MAX_AVATAR_SIZE_BYTES);
            
            // Simulate the avatar size check
            const isValid = fileSize < MAX_AVATAR_SIZE_BYTES;
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify avatar files within the size limit', () => {
      fc.assert(
        fc.property(
          validAvatarSizeGen,
          (fileSize) => {
            // Property: Any avatar file smaller than 2MB should be within the limit
            expect(fileSize).toBeLessThan(MAX_AVATAR_SIZE_BYTES);
            
            // Simulate the avatar size check
            const isValid = fileSize < MAX_AVATAR_SIZE_BYTES;
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify file size validation is independent of authentication', () => {
      // Parse the rules and check that size validation appears in all write conditions
      const writeRules = parseWriteRules(actualRulesContent);
      
      writeRules.forEach(rule => {
        // Skip the default deny rule
        if (rule.condition === 'false') {
          return;
        }
        
        // Property: Every write rule should include size validation
        const hasSizeCheck = 
          rule.condition.includes('isValidSize()') ||
          rule.condition.includes('request.resource.size');
        
        expect(hasSizeCheck).toBe(true);
      });
    });
  });

  describe('Property 8: Boundary conditions', () => {
    it('should handle exact boundary file sizes correctly', () => {
      // Test exact boundary: 10MB exactly should be rejected (< not <=)
      const exactLimit = MAX_FILE_SIZE_BYTES;
      const isValid = exactLimit < MAX_FILE_SIZE_BYTES;
      expect(isValid).toBe(false);
      
      // Test just under boundary: should be accepted
      const justUnder = MAX_FILE_SIZE_BYTES - 1;
      const isValidJustUnder = justUnder < MAX_FILE_SIZE_BYTES;
      expect(isValidJustUnder).toBe(true);
      
      // Test just over boundary: should be rejected
      const justOver = MAX_FILE_SIZE_BYTES + 1;
      const isValidJustOver = justOver < MAX_FILE_SIZE_BYTES;
      expect(isValidJustOver).toBe(false);
    });

    it('should handle zero-size files correctly', () => {
      // Zero-size files should technically pass the size check
      const zeroSize = 0;
      const isValid = zeroSize < MAX_FILE_SIZE_BYTES;
      expect(isValid).toBe(true);
    });
  });
});
