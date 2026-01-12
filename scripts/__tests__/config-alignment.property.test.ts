/**
 * Property-based tests for Firebase and Next.js configuration alignment
 * 
 * **Feature: production-readiness-fixes, Property 7: Firebase config and Next.js config alignment**
 * **Validates: Requirements 3.5**
 * 
 * Property: For any app where firebase.json references `out` directory,
 * the corresponding next.config.js must have `output: 'export'` configuration
 * 
 * Note: Apps with dynamic routes (admin, student) use server-side rendering
 * and output to .next directory instead of out directory.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// App names that should be configured
const APP_NAMES = ['auth', 'admin', 'student'] as const;
type AppName = typeof APP_NAMES[number];

// Apps that use static export (no dynamic routes)
const STATIC_EXPORT_APPS: AppName[] = ['auth'];

// Apps that use server-side rendering (have dynamic routes)
const SSR_APPS: AppName[] = ['admin', 'student'];

interface FirebaseHostingConfig {
  target: string;
  public: string;
  ignore: string[];
  rewrites: Array<{ source: string; destination: string }>;
}

interface FirebaseConfig {
  firestore?: {
    rules: string;
    indexes: string;
  };
  storage?: {
    rules: string;
  };
  hosting: FirebaseHostingConfig[];
}

interface NextConfigAnalysis {
  hasOutputExport: boolean;
  hasTrailingSlash: boolean;
  hasUnoptimizedImages: boolean;
}

/**
 * Parse firebase.json to extract hosting configuration
 */
function parseFirebaseConfig(): FirebaseConfig {
  const firebaseJsonPath = path.join(process.cwd(), 'firebase', 'firebase.json');
  const content = fs.readFileSync(firebaseJsonPath, 'utf-8');
  return JSON.parse(content) as FirebaseConfig;
}

/**
 * Analyze next.config.js for an app
 */
function analyzeNextConfig(appName: AppName): NextConfigAnalysis {
  const configPath = path.join(process.cwd(), 'apps', appName, 'next.config.js');
  const content = fs.readFileSync(configPath, 'utf-8');
  
  return {
    hasOutputExport: content.includes("output: 'export'") || content.includes('output: "export"'),
    hasTrailingSlash: content.includes('trailingSlash: true'),
    hasUnoptimizedImages: content.includes('unoptimized: true'),
  };
}

/**
 * Check if firebase.json references 'out' directory for an app
 */
function firebaseReferencesOutDir(firebaseConfig: FirebaseConfig, appName: AppName): boolean {
  const hostingConfig = firebaseConfig.hosting.find(h => h.target === appName);
  if (!hostingConfig) return false;
  
  // Check if public path contains 'out'
  return hostingConfig.public.includes('/out') || hostingConfig.public.endsWith('/out');
}

/**
 * Check if an app is configured for static export
 */
function isStaticExportApp(appName: AppName): boolean {
  return STATIC_EXPORT_APPS.includes(appName);
}

describe('Configuration Alignment Property Tests', () => {
  /**
   * **Feature: production-readiness-fixes, Property 7: Firebase config and Next.js config alignment**
   * **Validates: Requirements 3.5**
   */
  describe('Property 7: Firebase config and Next.js config alignment', () => {
    let firebaseConfig: FirebaseConfig;

    beforeAll(() => {
      firebaseConfig = parseFirebaseConfig();
    });

    it('should have output: export in next.config.js for static export apps', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...STATIC_EXPORT_APPS),
          (appName) => {
            const nextConfig = analyzeNextConfig(appName);

            // Property: Static export apps must have output: 'export'
            expect(nextConfig.hasOutputExport).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have trailingSlash: true for Firebase Hosting compatibility', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...APP_NAMES),
          (appName) => {
            const nextConfig = analyzeNextConfig(appName);

            // Property: All apps should have trailingSlash: true for Firebase Hosting
            expect(nextConfig.hasTrailingSlash).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have unoptimized images for static export', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...APP_NAMES),
          (appName) => {
            const nextConfig = analyzeNextConfig(appName);

            // Property: All apps should have unoptimized images (required for Firebase Hosting)
            expect(nextConfig.hasUnoptimizedImages).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have static export apps configured consistently', () => {
      // Property: All static export apps should have consistent configuration
      const configs = STATIC_EXPORT_APPS.map(appName => ({
        appName,
        ...analyzeNextConfig(appName),
        referencesOut: firebaseReferencesOutDir(firebaseConfig, appName),
      }));

      if (configs.length > 0) {
        // All should have output: export
        expect(configs.every(c => c.hasOutputExport)).toBe(true);
        
        // All should have trailingSlash: true
        expect(configs.every(c => c.hasTrailingSlash)).toBe(true);
        
        // All should have unoptimized images
        expect(configs.every(c => c.hasUnoptimizedImages)).toBe(true);
        
        // All should reference out directory in firebase.json
        expect(configs.every(c => c.referencesOut)).toBe(true);
      }
    });

    it('should have firebase.json hosting targets matching app directories', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...APP_NAMES),
          (appName) => {
            const hostingConfig = firebaseConfig.hosting.find(h => h.target === appName);
            
            // Property: Each app should have a corresponding hosting target in firebase.json
            expect(hostingConfig).toBeDefined();
            
            // Property: The public path should reference the correct app
            if (hostingConfig) {
              expect(hostingConfig.public).toContain(`apps/${appName}`);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have SPA rewrites configured for client-side routing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...APP_NAMES),
          (appName) => {
            const hostingConfig = firebaseConfig.hosting.find(h => h.target === appName);
            
            if (hostingConfig) {
              // Property: Each hosting config should have SPA rewrite for client-side routing
              const hasSpaRewrite = hostingConfig.rewrites.some(
                r => r.source === '**' && r.destination === '/index.html'
              );
              expect(hasSpaRewrite).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Configuration consistency checks', () => {
    it('should verify all three apps exist in firebase.json hosting', () => {
      const firebaseConfig = parseFirebaseConfig();
      const targets = firebaseConfig.hosting.map(h => h.target);
      
      // Property: All expected apps should be configured
      APP_NAMES.forEach(appName => {
        expect(targets).toContain(appName);
      });
    });

    it('should verify next.config.js exists for all apps', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...APP_NAMES),
          (appName) => {
            const configPath = path.join(process.cwd(), 'apps', appName, 'next.config.js');
            
            // Property: Each app should have a next.config.js file
            expect(fs.existsSync(configPath)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
