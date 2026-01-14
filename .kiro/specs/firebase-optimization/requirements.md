# Requirements Document - Firebase Optimization

## Introduction

This specification defines the requirements for optimizing Firebase Blaze plan usage in The Design Council LMS. The optimization focuses on reducing Firestore reads, improving query performance, and implementing caching strategies to minimize costs while maintaining or improving user experience.

## Glossary

- **Firestore**: Cloud Firestore database service from Firebase
- **Custom Claims**: JWT token claims set via Firebase Admin SDK
- **TanStack Query**: React data fetching and caching library (formerly React Query)
- **Repository**: Data access layer pattern for Firestore operations
- **Firestore Rules**: Security rules that control access to Firestore data
- **Storage Rules**: Security rules that control access to Firebase Storage
- **Admin User**: User with role "admin" who can manage the system
- **Student User**: User with role "student" who can access learning materials
- **Dashboard Stats**: Aggregated statistics displayed on admin dashboard
- **Notification**: System message sent to users
- **Read Operation**: A single document read from Firestore (billable unit)

## Requirements

### Requirement 1: Firestore Rules Optimization

**User Story:** As a system administrator, I want Firestore security rules to use custom claims instead of Firestore lookups, so that admin queries do not incur extra read costs.

#### Acceptance Criteria

1. WHEN an admin user performs a Firestore query THEN the system SHALL validate admin role using custom claims from the authentication token
2. WHEN the `isAdmin()` function is called in Firestore Rules THEN the system SHALL check `request.auth.token.role` without performing a Firestore read
3. WHEN an admin user performs 100 queries THEN the system SHALL not incur any additional reads for role verification
4. WHEN Firestore Rules are deployed THEN the system SHALL maintain backward compatibility with existing security requirements
5. WHEN a non-admin user attempts admin operations THEN the system SHALL deny access based on custom claims

### Requirement 2: Notification Query Optimization

**User Story:** As a student or admin user, I want the system to load only recent notifications, so that the notification panel loads quickly and efficiently.

#### Acceptance Criteria

1. WHEN a user requests their notifications THEN the system SHALL return a maximum of 50 most recent notifications
2. WHEN a user has more than 50 notifications THEN the system SHALL order by creation date descending and limit results to 50
3. WHEN the notification repository queries Firestore THEN the system SHALL include a `limit(50)` clause in the query
4. WHEN a user views notifications THEN the system SHALL display the most recent 50 notifications without pagination errors
5. WHEN notification count exceeds 50 THEN the system SHALL provide a mechanism to view older notifications if needed

### Requirement 3: Dashboard Statistics Caching

**User Story:** As an admin user, I want dashboard statistics to be cached, so that the dashboard loads quickly without querying Firestore on every page load.

#### Acceptance Criteria

1. WHEN an admin loads the dashboard THEN the system SHALL use cached statistics if available and not stale
2. WHEN dashboard statistics are cached THEN the system SHALL set a stale time of 5 minutes
3. WHEN cached statistics are older than 5 minutes THEN the system SHALL fetch fresh data from Firestore
4. WHEN dashboard statistics are fetched THEN the system SHALL cache the results for 10 minutes in memory
5. WHEN multiple admins load the dashboard within 5 minutes THEN the system SHALL serve cached data without additional Firestore reads

### Requirement 4: Dashboard Stats Aggregation Function

**User Story:** As a system administrator, I want dashboard statistics to be pre-aggregated by a Cloud Function, so that dashboard loads do not require multiple collection queries.

#### Acceptance Criteria

1. WHEN the aggregation function runs THEN the system SHALL calculate total students, active students, students by semester, and course completion rates
2. WHEN the aggregation function completes THEN the system SHALL store aggregated statistics in a dedicated Firestore document
3. WHEN the aggregation function is scheduled THEN the system SHALL run every hour automatically
4. WHEN the dashboard loads THEN the system SHALL read from the pre-aggregated statistics document instead of querying multiple collections
5. WHEN aggregated statistics are unavailable THEN the system SHALL fallback to on-demand calculation

### Requirement 5: Progress Caching Implementation

**User Story:** As a student user, I want my learning progress to be cached, so that progress displays load instantly without recalculating from multiple sources.

#### Acceptance Criteria

1. WHEN a student's progress changes THEN the system SHALL update the cached progress in the student document
2. WHEN a Cloud Function detects progress document changes THEN the system SHALL recalculate and cache overall progress
3. WHEN a student views their progress THEN the system SHALL read from the cached progress field in the student document
4. WHEN cached progress is read THEN the system SHALL not query the progress collection for calculation
5. WHEN progress cache is updated THEN the system SHALL maintain data consistency with source progress records

### Requirement 6: Monitoring and Verification

**User Story:** As a system administrator, I want to monitor optimization effectiveness, so that I can verify cost reduction and performance improvements.

#### Acceptance Criteria

1. WHEN optimizations are deployed THEN the system SHALL provide metrics for Firestore read operations before and after
2. WHEN monitoring is enabled THEN the system SHALL track daily read counts by operation type
3. WHEN cost analysis is performed THEN the system SHALL show percentage reduction in Firestore reads
4. WHEN performance is measured THEN the system SHALL show response time improvements for optimized queries
5. WHEN issues are detected THEN the system SHALL log errors and provide rollback capability

### Requirement 7: Backward Compatibility

**User Story:** As a developer, I want optimizations to maintain backward compatibility, so that existing functionality continues to work without breaking changes.

#### Acceptance Criteria

1. WHEN Firestore Rules are updated THEN the system SHALL maintain all existing security constraints
2. WHEN custom claims are not yet set THEN the system SHALL fallback to Firestore lookup for role verification
3. WHEN notification limits are applied THEN the system SHALL not break existing notification display logic
4. WHEN caching is implemented THEN the system SHALL not serve stale data beyond acceptable thresholds
5. WHEN optimizations are deployed THEN the system SHALL pass all existing integration tests

### Requirement 8: Testing and Validation

**User Story:** As a quality assurance engineer, I want comprehensive tests for optimizations, so that I can verify correctness and performance improvements.

#### Acceptance Criteria

1. WHEN Firestore Rules are tested THEN the system SHALL verify admin access works with custom claims
2. WHEN notification queries are tested THEN the system SHALL verify exactly 50 notifications are returned when more exist
3. WHEN dashboard caching is tested THEN the system SHALL verify cache hit rates and stale time behavior
4. WHEN aggregation functions are tested THEN the system SHALL verify calculated statistics match expected values
5. WHEN progress caching is tested THEN the system SHALL verify cached values match source data

## Common Correctness Properties

### Property 1: Custom Claims Consistency
*For any* admin user with custom claims set, querying Firestore should validate role without additional reads, and access should be granted if and only if `request.auth.token.role == 'admin'`

### Property 2: Notification Limit Invariant
*For any* user with N notifications where N > 50, the notification query should return exactly 50 notifications ordered by creation date descending

### Property 3: Cache Staleness Boundary
*For any* cached dashboard statistics, if the cache age is less than 5 minutes, the system should serve cached data; if cache age is 5 minutes or more, the system should fetch fresh data

### Property 4: Aggregation Accuracy
*For any* aggregated statistic, the value should equal the result of querying the source collections directly (within eventual consistency bounds)

### Property 5: Progress Cache Consistency
*For any* student, the cached progress value should equal the calculated progress from the progress collection (within the last update cycle)

### Property 6: Read Reduction Guarantee
*For any* optimized query pattern, the number of Firestore reads should be less than or equal to the pre-optimization baseline

### Property 7: Fallback Correctness
*For any* optimization with fallback, if the optimized path fails, the fallback path should produce the same result as the original implementation

## Non-Functional Requirements

### Performance
- Dashboard load time should be < 1 second with cached data
- Notification queries should complete in < 500ms
- Aggregation function should complete in < 30 seconds

### Cost
- Firestore reads should reduce by at least 30%
- Monthly Firebase cost should reduce by at least $1.00
- Optimization implementation should not increase Cloud Functions cost beyond savings

### Reliability
- Cache hit rate should be > 80% for dashboard queries
- Aggregation function should have > 99% success rate
- Fallback mechanisms should activate within 1 second of primary path failure

### Maintainability
- Code changes should follow existing repository patterns
- Configuration should be externalized where appropriate
- Documentation should be updated for all optimizations

## Out of Scope

- Real-time data synchronization (onSnapshot listeners)
- Client-side IndexedDB persistence (future enhancement)
- Firestore bundle generation (future enhancement)
- Query result pagination for notifications (future enhancement)
- Custom metrics dashboard (future enhancement)

## Dependencies

- Firebase Blaze plan (active)
- Cloud Functions deployed and operational
- Custom claims already set for admin users
- TanStack Query configured in applications
- Existing repository pattern in place

## Assumptions

- Admin users have custom claims set via Cloud Functions
- User traffic patterns remain consistent with current estimates
- Firebase pricing remains stable
- Firestore eventual consistency is acceptable for cached data
- 5-minute cache staleness is acceptable for dashboard statistics

## Risks

1. **Cache Invalidation**: Stale data may be served if cache invalidation logic is incorrect
   - Mitigation: Conservative stale time settings, manual refresh capability

2. **Aggregation Lag**: Pre-aggregated stats may be up to 1 hour old
   - Mitigation: Hourly updates, fallback to real-time calculation if needed

3. **Custom Claims Not Set**: Users without custom claims may experience degraded performance
   - Mitigation: Fallback to Firestore lookup, monitoring for users without claims

4. **Increased Complexity**: Additional caching logic increases code complexity
   - Mitigation: Comprehensive testing, clear documentation, code reviews

## Success Metrics

- Firestore reads reduced by 30% or more
- Dashboard load time < 1 second (from ~2 seconds)
- Monthly cost reduced by $1.00-$1.20
- No increase in error rates
- No degradation in user experience
- All existing tests pass
- New optimization tests pass

---

**Document Version:** 1.0
**Created:** 2026-01-13
**Status:** Draft - Ready for Review
