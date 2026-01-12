import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateOnlineCount,
  type UserPresence,
  type PresenceRole,
  type PresenceState,
} from '../presence.service';

/**
 * Feature: phase-6-lab-advanced, Property 9: Online count accuracy
 * Validates: Requirements 5.1, 5.4
 *
 * For any set of user presence records, the online count SHALL equal the count
 * of records where state='online', grouped by role.
 */
describe('Property 9: Online count accuracy', () => {
  // Arbitrary for generating valid presence records
  const presenceArb = fc.record({
    state: fc.constantFrom<PresenceState>('online', 'offline'),
    lastSeen: fc.integer({ min: 0 }),
    role: fc.constantFrom<PresenceRole>('admin', 'student'),
  });

  const presenceRecordsArb = fc.dictionary(fc.uuid(), presenceArb);

  it('should count online users correctly by role', () => {
    fc.assert(
      fc.property(presenceRecordsArb, (records) => {
        const result = calculateOnlineCount(records);

        // Manually count expected values
        let expectedAdmin = 0;
        let expectedStudent = 0;

        for (const presence of Object.values(records)) {
          if (presence.state === 'online') {
            if (presence.role === 'admin') {
              expectedAdmin++;
            } else if (presence.role === 'student') {
              expectedStudent++;
            }
          }
        }

        expect(result.admin).toBe(expectedAdmin);
        expect(result.student).toBe(expectedStudent);
      }),
      { numRuns: 100 }
    );
  });

  it('should return zero counts for empty records', () => {
    const result = calculateOnlineCount({});
    expect(result.admin).toBe(0);
    expect(result.student).toBe(0);
  });

  it('should return zero counts when all users are offline', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.uuid(),
          fc.record({
            state: fc.constant<PresenceState>('offline'),
            lastSeen: fc.integer({ min: 0 }),
            role: fc.constantFrom<PresenceRole>('admin', 'student'),
          })
        ),
        (records) => {
          const result = calculateOnlineCount(records);
          expect(result.admin).toBe(0);
          expect(result.student).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should count all users when all are online', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.uuid(),
          fc.record({
            state: fc.constant<PresenceState>('online'),
            lastSeen: fc.integer({ min: 0 }),
            role: fc.constantFrom<PresenceRole>('admin', 'student'),
          })
        ),
        (records) => {
          const result = calculateOnlineCount(records);
          const totalOnline = result.admin + result.student;
          expect(totalOnline).toBe(Object.keys(records).length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only count online admins in admin count', () => {
    fc.assert(
      fc.property(presenceRecordsArb, (records) => {
        const result = calculateOnlineCount(records);

        const onlineAdmins = Object.values(records).filter(
          (p) => p.state === 'online' && p.role === 'admin'
        ).length;

        expect(result.admin).toBe(onlineAdmins);
      }),
      { numRuns: 100 }
    );
  });

  it('should only count online students in student count', () => {
    fc.assert(
      fc.property(presenceRecordsArb, (records) => {
        const result = calculateOnlineCount(records);

        const onlineStudents = Object.values(records).filter(
          (p) => p.state === 'online' && p.role === 'student'
        ).length;

        expect(result.student).toBe(onlineStudents);
      }),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same input produces same output', () => {
    fc.assert(
      fc.property(presenceRecordsArb, (records) => {
        const result1 = calculateOnlineCount(records);
        const result2 = calculateOnlineCount(records);

        expect(result1.admin).toBe(result2.admin);
        expect(result1.student).toBe(result2.student);
      }),
      { numRuns: 100 }
    );
  });

  it('should return non-negative counts', () => {
    fc.assert(
      fc.property(presenceRecordsArb, (records) => {
        const result = calculateOnlineCount(records);

        expect(result.admin).toBeGreaterThanOrEqual(0);
        expect(result.student).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should not exceed total number of records', () => {
    fc.assert(
      fc.property(presenceRecordsArb, (records) => {
        const result = calculateOnlineCount(records);
        const totalRecords = Object.keys(records).length;

        expect(result.admin + result.student).toBeLessThanOrEqual(totalRecords);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle mixed online/offline states correctly', () => {
    // Specific test case with known values
    const records: Record<string, UserPresence> = {
      'user-1': { state: 'online', lastSeen: 1000, role: 'admin' },
      'user-2': { state: 'offline', lastSeen: 2000, role: 'admin' },
      'user-3': { state: 'online', lastSeen: 3000, role: 'student' },
      'user-4': { state: 'online', lastSeen: 4000, role: 'student' },
      'user-5': { state: 'offline', lastSeen: 5000, role: 'student' },
    };

    const result = calculateOnlineCount(records);

    expect(result.admin).toBe(1); // Only user-1 is online admin
    expect(result.student).toBe(2); // user-3 and user-4 are online students
  });

  it('should ignore lastSeen timestamp in counting', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.uuid(),
          fc.record({
            state: fc.constantFrom<PresenceState>('online', 'offline'),
            lastSeen: fc.integer({ min: 0 }),
            role: fc.constantFrom<PresenceRole>('admin', 'student'),
          })
        ),
        (records) => {
          // Create a copy with different timestamps
          const modifiedRecords: Record<string, UserPresence> = {};
          for (const [key, value] of Object.entries(records)) {
            modifiedRecords[key] = { ...value, lastSeen: value.lastSeen + 1000 };
          }

          const result1 = calculateOnlineCount(records);
          const result2 = calculateOnlineCount(modifiedRecords);

          // Counts should be the same regardless of timestamp
          expect(result1.admin).toBe(result2.admin);
          expect(result1.student).toBe(result2.student);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle single user correctly', () => {
    fc.assert(
      fc.property(presenceArb, (presence) => {
        const records = { 'single-user': presence };
        const result = calculateOnlineCount(records);

        if (presence.state === 'online') {
          if (presence.role === 'admin') {
            expect(result.admin).toBe(1);
            expect(result.student).toBe(0);
          } else {
            expect(result.admin).toBe(0);
            expect(result.student).toBe(1);
          }
        } else {
          expect(result.admin).toBe(0);
          expect(result.student).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
