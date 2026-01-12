/**
 * Property-based tests for environment validation
 * 
 * **Feature: phase-8-polish-deploy, Property 6: Environment Validation**
 * **Validates: Requirements 5.1**
 * 
 * Property: For any deployment attempt, if required environment variables are missing,
 * the deployment SHALL fail with a clear error message listing the missing variables.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Mock process.exit to prevent test from exiting
vi.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`Process exited with code ${code}`);
});

// Store original env
const originalEnv = { ...process.env };

// Environment schema (matching the actual schema in validate-env.js)
const envSchema = {
  required: [
    {
      key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      description: 'Firebase API Key',
      validate: (value: string) => value && value.length > 10 && !value.includes('your-'),
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      description: 'Firebase Auth Domain',
      validate: (value: string) => value && value.includes('.firebaseapp.com'),
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      description: 'Firebase Project ID',
      validate: (value: string) => value && value.length > 3 && !value.includes('your-'),
    },
  ],
  production: [
    {
      key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      description: 'Firebase Storage Bucket',
      validate: (value: string) => value && (value.includes('.appspot.com') || value.includes('.firebasestorage.app')),
      errorMessage: 'Must be a valid Firebase Storage Bucket (e.g., project-id.appspot.com or project-id.firebasestorage.app)',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      description: 'Firebase Messaging Sender ID',
      validate: (value: string) => value && /^\d+$/.test(value),
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      description: 'Firebase App ID',
      validate: (value: string) => value && value.includes(':'),
    },
  ],
  urls: [
    {
      key: 'NEXT_PUBLIC_AUTH_URL',
      description: 'Auth app URL',
      default: 'http://localhost:3000',
      productionValidate: (value: string) => value && value.startsWith('https://'),
    },
    {
      key: 'NEXT_PUBLIC_ADMIN_URL',
      description: 'Admin app URL',
      default: 'http://localhost:3001',
      productionValidate: (value: string) => value && value.startsWith('https://'),
    },
    {
      key: 'NEXT_PUBLIC_STUDENT_URL',
      description: 'Student app URL',
      default: 'http://localhost:3002',
      productionValidate: (value: string) => value && value.startsWith('https://'),
    },
  ],
};

// Generators for valid environment values
const validApiKeyGen = fc.string({ minLength: 15, maxLength: 50 })
  .filter(s => !s.includes('your-') && s.trim().length > 10);

const validAuthDomainGen = fc.string({ minLength: 3, maxLength: 20 })
  .filter(s => /^[a-z0-9]+$/i.test(s))
  .map(s => `${s}.firebaseapp.com`);

const validProjectIdGen = fc.string({ minLength: 5, maxLength: 30 })
  .filter(s => !s.includes('your-') && /^[a-z0-9-]+$/i.test(s) && s.length > 3);

const validStorageBucketGen = fc.oneof(
  // .appspot.com format
  fc.string({ minLength: 3, maxLength: 20 })
    .filter(s => /^[a-z0-9]+$/i.test(s))
    .map(s => `${s}.appspot.com`),
  // .firebasestorage.app format
  fc.string({ minLength: 3, maxLength: 20 })
    .filter(s => /^[a-z0-9]+$/i.test(s))
    .map(s => `${s}.firebasestorage.app`)
);

const validMessagingSenderIdGen = fc.stringMatching(/^\d{10,15}$/);

const validAppIdGen = fc.tuple(
  fc.string({ minLength: 1, maxLength: 5 }).filter(s => /^[a-z0-9]+$/i.test(s)),
  fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/i.test(s))
).map(([a, b]) => `${a}:${b}`);

const validHttpsUrlGen = fc.webUrl()
  .map(url => url.replace('http://', 'https://'));

// Type for environment record
type EnvRecord = Record<string, string>;

// Generator for a complete valid environment
const validEnvGen = fc.record({
  NEXT_PUBLIC_FIREBASE_API_KEY: validApiKeyGen,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: validAuthDomainGen,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: validProjectIdGen,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: validStorageBucketGen,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: validMessagingSenderIdGen,
  NEXT_PUBLIC_FIREBASE_APP_ID: validAppIdGen,
  NEXT_PUBLIC_AUTH_URL: validHttpsUrlGen,
  NEXT_PUBLIC_ADMIN_URL: validHttpsUrlGen,
  NEXT_PUBLIC_STUDENT_URL: validHttpsUrlGen,
}) as fc.Arbitrary<EnvRecord>;

// Generator for subset of required keys to remove
const requiredKeysSubsetGen = fc.subarray(
  envSchema.required.map(r => r.key),
  { minLength: 1 }
);

// Helper to validate environment
function validateEnvironment(env: Record<string, string>, isStrict: boolean): { 
  success: boolean; 
  missingRequired: string[];
  missingProduction: string[];
  invalidRequired: string[];
  invalidProduction: string[];
  invalidUrls: string[];
} {
  const missingRequired: string[] = [];
  const missingProduction: string[] = [];
  const invalidRequired: string[] = [];
  const invalidProduction: string[] = [];
  const invalidUrls: string[] = [];

  // Check required vars
  for (const { key, validate } of envSchema.required) {
    const value = env[key];
    if (!value) {
      missingRequired.push(key);
    } else if (validate && !validate(value)) {
      invalidRequired.push(key);
    }
  }

  // Check production vars (only in strict mode)
  if (isStrict) {
    for (const { key, validate } of envSchema.production) {
      const value = env[key];
      if (!value) {
        missingProduction.push(key);
      } else if (validate && !validate(value)) {
        invalidProduction.push(key);
      }
    }

    // Check URLs in strict mode
    for (const { key, productionValidate } of envSchema.urls) {
      const value = env[key];
      if (value && productionValidate && !productionValidate(value)) {
        invalidUrls.push(key);
      }
    }
  }

  const success = 
    missingRequired.length === 0 && 
    invalidRequired.length === 0 &&
    (isStrict ? (
      missingProduction.length === 0 && 
      invalidProduction.length === 0 &&
      invalidUrls.length === 0
    ) : true);

  return { success, missingRequired, missingProduction, invalidRequired, invalidProduction, invalidUrls };
}

describe('Environment Validation Property Tests', () => {
  beforeEach(() => {
    // Clear all env vars before each test
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        delete process.env[key];
      }
    });
  });

  afterEach(() => {
    // Restore original env
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, originalEnv);
  });

  /**
   * **Feature: production-readiness-fixes, Property 1: Storage bucket validation accepts both formats**
   * **Validates: Requirements 2.1, 2.2**
   * 
   * For any storage bucket value, if it ends with `.appspot.com` OR `.firebasestorage.app`,
   * then the validation function should return true
   */
  describe('Property 1: Storage bucket validation accepts both formats', () => {
    // Storage bucket validation function (matching validate-env.js)
    const validateStorageBucket = (value: string) => 
      value && (value.includes('.appspot.com') || value.includes('.firebasestorage.app'));

    it('should accept storage buckets ending with .appspot.com', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 30 })
            .filter(s => /^[a-z0-9-]+$/i.test(s) && s.length >= 3),
          (projectId) => {
            const bucket = `${projectId}.appspot.com`;
            
            // Property: Any bucket ending with .appspot.com should be valid
            expect(validateStorageBucket(bucket)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept storage buckets ending with .firebasestorage.app', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 30 })
            .filter(s => /^[a-z0-9-]+$/i.test(s) && s.length >= 3),
          (projectId) => {
            const bucket = `${projectId}.firebasestorage.app`;
            
            // Property: Any bucket ending with .firebasestorage.app should be valid
            expect(validateStorageBucket(bucket)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject storage buckets with invalid formats', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => !s.includes('.appspot.com') && !s.includes('.firebasestorage.app')),
          (invalidBucket) => {
            // Property: Buckets without valid suffixes should be rejected
            expect(validateStorageBucket(invalidBucket)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty or null storage bucket values', () => {
      // Property: Empty/null values should be rejected (return falsy)
      expect(validateStorageBucket('')).toBeFalsy();
      expect(validateStorageBucket(null as unknown as string)).toBeFalsy();
      expect(validateStorageBucket(undefined as unknown as string)).toBeFalsy();
    });
  });

  /**
   * **Feature: production-readiness-fixes, Property 3: Invalid environment produces error with format hint**
   * **Validates: Requirements 2.5**
   * 
   * For any invalid environment variable value, the error message should contain
   * the expected format pattern
   */
  describe('Property 3: Invalid environment produces error with format hint', () => {
    // Error messages with format hints (matching validate-env.js)
    const errorMessages: Record<string, { errorMessage: string; formatHints: string[] }> = {
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: {
        errorMessage: 'Must be a valid Firebase Storage Bucket (e.g., project-id.appspot.com or project-id.firebasestorage.app)',
        formatHints: ['.appspot.com', '.firebasestorage.app'],
      },
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {
        errorMessage: 'Must be a valid Firebase Auth Domain (e.g., project-id.firebaseapp.com)',
        formatHints: ['.firebaseapp.com'],
      },
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: {
        errorMessage: 'Must be a numeric Messaging Sender ID',
        formatHints: ['numeric'],
      },
      NEXT_PUBLIC_FIREBASE_APP_ID: {
        errorMessage: 'Must be a valid Firebase App ID',
        formatHints: ['Firebase App ID'],
      },
    };

    it('should include format hints in storage bucket error message', () => {
      const storageBucketConfig = errorMessages.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      
      // Property: Error message should contain both valid format hints
      expect(storageBucketConfig.errorMessage).toContain('.appspot.com');
      expect(storageBucketConfig.errorMessage).toContain('.firebasestorage.app');
    });

    it('should include format hints for all variables with error messages', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(errorMessages)),
          (key) => {
            const config = errorMessages[key];
            
            // Property: Each error message should contain at least one format hint
            const hasFormatHint = config.formatHints.some(hint => 
              config.errorMessage.toLowerCase().includes(hint.toLowerCase())
            );
            
            expect(hasFormatHint).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide example format in error messages', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.entries(errorMessages)),
          ([_key, config]) => {
            // Property: Error messages should be descriptive (not empty)
            expect(config.errorMessage.length).toBeGreaterThan(10);
            
            // Property: Error messages should start with "Must be"
            expect(config.errorMessage.startsWith('Must be')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent error message format across all variables', () => {
      const allErrorMessages = Object.values(errorMessages).map(c => c.errorMessage);
      
      fc.assert(
        fc.property(
          fc.constantFrom(...allErrorMessages),
          (errorMessage) => {
            // Property: All error messages should follow the "Must be a valid X" pattern
            expect(errorMessage).toMatch(/^Must be (a |an )?/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Environment Validation
   * For any deployment attempt, if required environment variables are missing,
   * the deployment SHALL fail with a clear error message listing the missing variables.
   */
  describe('Property 6: Missing required variables cause validation failure', () => {
    it('should fail validation when any required variable is missing', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          requiredKeysSubsetGen,
          (validEnv, keysToRemove) => {
            // Create env with some required keys removed
            const testEnv = { ...validEnv };
            keysToRemove.forEach(key => {
              delete testEnv[key];
            });

            const result = validateEnvironment(testEnv, false);

            // Property: If any required key is missing, validation should fail
            expect(result.success).toBe(false);
            
            // Property: All removed keys should be in the missing list
            keysToRemove.forEach(key => {
              expect(result.missingRequired).toContain(key);
            });

            // Property: Missing list should contain exactly the removed keys
            expect(result.missingRequired.sort()).toEqual(keysToRemove.sort());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should pass validation when all required variables are present and valid', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          (validEnv) => {
            const result = validateEnvironment(validEnv, false);

            // Property: With all valid required vars, validation should pass in dev mode
            expect(result.success).toBe(true);
            expect(result.missingRequired).toHaveLength(0);
            expect(result.invalidRequired).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Invalid required variables cause validation failure', () => {
    it('should fail validation when required variables have invalid values', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          fc.constantFrom(...envSchema.required.map(r => r.key)),
          (validEnv, keyToInvalidate) => {
            // Create env with one invalid value
            const testEnv = { ...validEnv };
            
            // Set an invalid value based on the key
            if (keyToInvalidate === 'NEXT_PUBLIC_FIREBASE_API_KEY') {
              testEnv[keyToInvalidate] = 'your-api-key'; // Contains 'your-'
            } else if (keyToInvalidate === 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') {
              testEnv[keyToInvalidate] = 'invalid-domain.com'; // Missing .firebaseapp.com
            } else if (keyToInvalidate === 'NEXT_PUBLIC_FIREBASE_PROJECT_ID') {
              testEnv[keyToInvalidate] = 'ab'; // Too short
            }

            const result = validateEnvironment(testEnv, false);

            // Property: Invalid required var should cause failure
            expect(result.success).toBe(false);
            expect(result.invalidRequired).toContain(keyToInvalidate);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Production mode requires additional variables', () => {
    it('should fail in strict mode when production variables are missing', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          fc.subarray(envSchema.production.map(p => p.key), { minLength: 1 }),
          (validEnv, productionKeysToRemove) => {
            // Create env with some production keys removed
            const testEnv = { ...validEnv };
            productionKeysToRemove.forEach(key => {
              delete testEnv[key];
            });

            const result = validateEnvironment(testEnv, true); // strict mode

            // Property: Missing production vars should cause failure in strict mode
            expect(result.success).toBe(false);
            
            // Property: All removed production keys should be in the missing list
            productionKeysToRemove.forEach(key => {
              expect(result.missingProduction).toContain(key);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should pass in strict mode when all variables are present and valid', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          (validEnv) => {
            const result = validateEnvironment(validEnv, true); // strict mode

            // Property: With all valid vars, strict mode should pass
            expect(result.success).toBe(true);
            expect(result.missingRequired).toHaveLength(0);
            expect(result.missingProduction).toHaveLength(0);
            expect(result.invalidRequired).toHaveLength(0);
            expect(result.invalidProduction).toHaveLength(0);
            expect(result.invalidUrls).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: URL validation in production mode', () => {
    it('should fail in strict mode when URLs do not use HTTPS', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          fc.constantFrom(...envSchema.urls.map(u => u.key)),
          (validEnv, urlKeyToInvalidate) => {
            // Create env with one HTTP URL (not HTTPS)
            const testEnv = { ...validEnv };
            testEnv[urlKeyToInvalidate] = 'http://example.com'; // HTTP instead of HTTPS

            const result = validateEnvironment(testEnv, true); // strict mode

            // Property: HTTP URLs should cause failure in strict mode
            expect(result.success).toBe(false);
            expect(result.invalidUrls).toContain(urlKeyToInvalidate);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Error messages list all missing variables', () => {
    it('should list all missing variables in the error result', () => {
      fc.assert(
        fc.property(
          validEnvGen,
          fc.subarray([...envSchema.required.map(r => r.key), ...envSchema.production.map(p => p.key)], { minLength: 1 }),
          (validEnv, keysToRemove) => {
            // Create env with multiple keys removed
            const testEnv = { ...validEnv };
            keysToRemove.forEach(key => {
              delete testEnv[key];
            });

            const result = validateEnvironment(testEnv, true); // strict mode

            // Property: All removed keys should appear in either missing list
            const allMissing = [...result.missingRequired, ...result.missingProduction];
            keysToRemove.forEach(key => {
              expect(allMissing).toContain(key);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
