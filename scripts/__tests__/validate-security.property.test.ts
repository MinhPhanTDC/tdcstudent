/**
 * Property-based tests for security validation
 * 
 * Tests the validate-security.js script functions for detecting
 * security issues in Firebase rules files.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Type definition for security issues
interface SecurityIssue {
  severity: 'error' | 'warning';
  category: 'storage' | 'firestore' | 'config';
  file: string;
  line?: number;
  message: string;
  recommendation: string;
}

// Import the functions to test
const {
  checkUnauthenticatedWrites,
  checkTodoTemporaryComments,
} = require('../validate-security.js') as {
  checkUnauthenticatedWrites: (content: string, filePath: string) => SecurityIssue[];
  checkTodoTemporaryComments: (content: string, filePath: string) => SecurityIssue[];
};

// Generators for rule content
const pathSegmentGen = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z0-9_]+$/.test(s));

/**
 * **Feature: production-readiness-fixes, Property 4: Security rules contain no unauthenticated writes**
 * **Validates: Requirements 6.1**
 * 
 * For any storage rules file, parsing and checking should detect any `allow write` rule
 * that doesn't require `isAuthenticated()`
 */
describe('Property 4: Security rules contain no unauthenticated writes', () => {
  
  // Generator for authenticated write rules (should pass)
  const authenticatedWriteRuleGen = fc.tuple(
    pathSegmentGen,
    fc.constantFrom(
      'isAuthenticated()',
      'isAuthenticated() && isValidSize()',
      'isAdmin()',
      'isAdmin() && isValidSize()',
      'request.auth != null',
      'request.auth != null && isValidSize()'
    )
  ).map(([path, condition]) => 
    `match /${path}/{allPaths=**} {\n  allow write: if ${condition};\n}`
  );

  // Generator for unauthenticated write rules (should fail)
  const unauthenticatedWriteRuleGen = fc.tuple(
    pathSegmentGen,
    fc.constantFrom(
      'true',
      'isValidSize()',
      'request.resource.size < 10000',
      'isImage()'
    )
  ).map(([path, condition]) => 
    `match /${path}/{allPaths=**} {\n  allow write: if ${condition};\n}`
  );

  // Generator for deny rules (should pass - they're safe)
  const denyWriteRuleGen = pathSegmentGen.map(path => 
    `match /${path}/{allPaths=**} {\n  allow write: if false;\n}`
  );

  it('should detect unauthenticated write rules', () => {
    fc.assert(
      fc.property(
        unauthenticatedWriteRuleGen,
        (ruleContent) => {
          const fullContent = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    ${ruleContent}\n  }\n}`;
          const issues = checkUnauthenticatedWrites(fullContent, 'test/storage.rules');
          
          // Property: Unauthenticated write rules should be detected
          expect(issues.length).toBeGreaterThan(0);
          expect(issues[0].severity).toBe('error');
          expect(issues[0].message).toContain('Unauthenticated write rule');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not flag authenticated write rules', () => {
    fc.assert(
      fc.property(
        authenticatedWriteRuleGen,
        (ruleContent) => {
          const fullContent = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    ${ruleContent}\n  }\n}`;
          const issues = checkUnauthenticatedWrites(fullContent, 'test/storage.rules');
          
          // Property: Authenticated write rules should not be flagged
          expect(issues.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not flag deny write rules', () => {
    fc.assert(
      fc.property(
        denyWriteRuleGen,
        (ruleContent) => {
          const fullContent = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    ${ruleContent}\n  }\n}`;
          const issues = checkUnauthenticatedWrites(fullContent, 'test/storage.rules');
          
          // Property: Deny rules (allow write: if false) should not be flagged
          expect(issues.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect multiple unauthenticated write rules', () => {
    fc.assert(
      fc.property(
        fc.array(unauthenticatedWriteRuleGen, { minLength: 2, maxLength: 5 }),
        (rules) => {
          const uniqueRules = [...new Set(rules)];
          const fullContent = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    ${uniqueRules.join('\n    ')}\n  }\n}`;
          const issues = checkUnauthenticatedWrites(fullContent, 'test/storage.rules');
          
          // Property: Should detect all unauthenticated write rules
          expect(issues.length).toBe(uniqueRules.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include line number in detected issues', () => {
    fc.assert(
      fc.property(
        unauthenticatedWriteRuleGen,
        (ruleContent) => {
          const fullContent = `rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    ${ruleContent}\n  }\n}`;
          const issues = checkUnauthenticatedWrites(fullContent, 'test/storage.rules');
          
          // Property: Each issue should have a line number
          issues.forEach(issue => {
            expect(issue.line).toBeDefined();
            expect(typeof issue.line).toBe('number');
            expect(issue.line).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: production-readiness-fixes, Property 5: TODO/TEMPORARY detection in rules**
 * **Validates: Requirements 6.5**
 * 
 * For any rules file containing TODO or TEMPORARY comments, the security validator
 * should flag them as warnings or errors
 */
describe('Property 5: TODO/TEMPORARY detection in rules', () => {
  
  // Generator for TODO comments (should be flagged as warnings)
  const todoCommentGen = fc.tuple(
    fc.constantFrom('TODO', 'FIXME', 'HACK', 'XXX'),
    fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s))
  ).map(([marker, message]) => `// ${marker}: ${message}`);

  // Generator for TEMPORARY comments (should be flagged as errors)
  const temporaryCommentGen = fc.tuple(
    fc.constantFrom('TEMPORARY', 'TEMP'),
    fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s))
  ).map(([marker, message]) => `// ${marker}: ${message}`);

  // Generator for normal comments (should not be flagged)
  const normalCommentGen = fc.string({ minLength: 5, maxLength: 50 })
    .filter(s => /^[a-zA-Z0-9\s]+$/.test(s))
    .filter(s => !/(TODO|FIXME|HACK|XXX|TEMPORARY|TEMP)/i.test(s))
    .map(s => `// ${s}`);

  it('should detect TODO comments as warnings', () => {
    fc.assert(
      fc.property(
        todoCommentGen,
        (comment) => {
          const content = `rules_version = '2';\n${comment}\nservice firebase.storage {}`;
          const issues = checkTodoTemporaryComments(content, 'test/storage.rules');
          
          // Property: TODO comments should be detected as warnings
          expect(issues.length).toBe(1);
          expect(issues[0].severity).toBe('warning');
          expect(issues[0].message).toContain('TODO comment found');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect TEMPORARY comments as errors', () => {
    fc.assert(
      fc.property(
        temporaryCommentGen,
        (comment) => {
          const content = `rules_version = '2';\n${comment}\nservice firebase.storage {}`;
          const issues = checkTodoTemporaryComments(content, 'test/storage.rules');
          
          // Property: TEMPORARY comments should be detected as errors
          expect(issues.length).toBe(1);
          expect(issues[0].severity).toBe('error');
          expect(issues[0].message).toContain('TEMPORARY code marker found');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not flag normal comments', () => {
    fc.assert(
      fc.property(
        normalCommentGen,
        (comment) => {
          const content = `rules_version = '2';\n${comment}\nservice firebase.storage {}`;
          const issues = checkTodoTemporaryComments(content, 'test/storage.rules');
          
          // Property: Normal comments should not be flagged
          expect(issues.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect multiple TODO/TEMPORARY comments', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(todoCommentGen, temporaryCommentGen), { minLength: 2, maxLength: 5 }),
        (comments) => {
          const content = `rules_version = '2';\n${comments.join('\n')}\nservice firebase.storage {}`;
          const issues = checkTodoTemporaryComments(content, 'test/storage.rules');
          
          // Property: Should detect all TODO/TEMPORARY comments
          expect(issues.length).toBe(comments.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include line number for each detected comment', () => {
    fc.assert(
      fc.property(
        fc.oneof(todoCommentGen, temporaryCommentGen),
        (comment) => {
          const content = `rules_version = '2';\n${comment}\nservice firebase.storage {}`;
          const issues = checkTodoTemporaryComments(content, 'test/storage.rules');
          
          // Property: Each issue should have a valid line number
          issues.forEach(issue => {
            expect(issue.line).toBeDefined();
            expect(typeof issue.line).toBe('number');
            expect(issue.line).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include recommendation for each detected comment', () => {
    fc.assert(
      fc.property(
        fc.oneof(todoCommentGen, temporaryCommentGen),
        (comment) => {
          const content = `rules_version = '2';\n${comment}\nservice firebase.storage {}`;
          const issues = checkTodoTemporaryComments(content, 'test/storage.rules');
          
          // Property: Each issue should have a recommendation
          issues.forEach(issue => {
            expect(issue.recommendation).toBeDefined();
            expect(issue.recommendation.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: production-readiness-fixes, Property 6: Security issue reporting completeness**
 * **Validates: Requirements 6.3**
 * 
 * For any detected security issue, the report should include file path, line number
 * (if applicable), and recommendation
 */
describe('Property 6: Security issue reporting completeness', () => {
  
  // Generator for various security issues
  const securityIssueContentGen = fc.oneof(
    // Unauthenticated write rule
    fc.constant(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /test/{allPaths=**} {
      allow write: if true;
    }
  }
}`),
    // TODO comment
    fc.constant(`rules_version = '2';
// TODO: Fix this security issue
service firebase.storage {}`),
    // TEMPORARY comment
    fc.constant(`rules_version = '2';
// TEMPORARY: Remove before production
service firebase.storage {}`)
  );

  // Generator for file paths
  const filePathGen = fc.tuple(
    fc.constantFrom('firebase', 'rules', 'config'),
    fc.constantFrom('storage.rules', 'firestore.rules', 'security.rules')
  ).map(([dir, file]) => `${dir}/${file}`);

  it('should include file path in all detected issues', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have a file path
          issues.forEach(issue => {
            expect(issue.file).toBeDefined();
            expect(typeof issue.file).toBe('string');
            expect(issue.file).toBe(filePath);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include line number in all detected issues', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have a line number
          issues.forEach(issue => {
            expect(issue.line).toBeDefined();
            expect(typeof issue.line).toBe('number');
            expect(issue.line).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include recommendation in all detected issues', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have a recommendation
          issues.forEach(issue => {
            expect(issue.recommendation).toBeDefined();
            expect(typeof issue.recommendation).toBe('string');
            expect(issue.recommendation.length).toBeGreaterThan(10);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include severity in all detected issues', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have a valid severity
          issues.forEach(issue => {
            expect(issue.severity).toBeDefined();
            expect(['error', 'warning']).toContain(issue.severity);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include message in all detected issues', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have a descriptive message
          issues.forEach(issue => {
            expect(issue.message).toBeDefined();
            expect(typeof issue.message).toBe('string');
            expect(issue.message.length).toBeGreaterThan(5);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include category in all detected issues', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have a valid category
          issues.forEach(issue => {
            expect(issue.category).toBeDefined();
            expect(['storage', 'firestore', 'config']).toContain(issue.category);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have all required fields for complete reporting', () => {
    fc.assert(
      fc.property(
        securityIssueContentGen,
        filePathGen,
        (content, filePath) => {
          // Run all checks
          const issues = [
            ...checkUnauthenticatedWrites(content, filePath),
            ...checkTodoTemporaryComments(content, filePath),
          ];
          
          // Property: All issues should have all required fields for complete reporting
          const requiredFields: (keyof SecurityIssue)[] = ['severity', 'category', 'file', 'line', 'message', 'recommendation'];
          
          issues.forEach(issue => {
            requiredFields.forEach(field => {
              expect(issue).toHaveProperty(field);
              expect(issue[field]).toBeDefined();
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
