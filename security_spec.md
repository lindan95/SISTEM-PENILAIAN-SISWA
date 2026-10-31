# Security Specification

## 1. Data Invariants
1. A user can only read and write their own UserProfile (`/users/{userId}`) where `request.auth.uid == userId`.
2. A user can only read, create, update, and delete their own AppData (`/users/{userId}/appData/{dataId}`) where `request.auth.uid == userId`.
3. Identity Integrity: Document `userId` field must match `request.auth.uid`. An authenticated user cannot impersonate another user ID.
4. Non-authenticated users cannot access any user profile or application data.
5. Path variable `{userId}` must be a valid ID matching `^[a-zA-Z0-9_-]+$` with length <= 128.
6. Default Deny: All unmatched collections and paths deny both read and write operations.
7. Test collection `/test/{testId}` allows read access to verify connection state.

## 2. The "Dirty Dozen" Payloads (Must be rejected)
1. **Unauthenticated Read**: Attempt to read `/users/user-123` without authentication tokens.
2. **Unauthenticated Write**: Attempt to write to `/users/user-123` without logging in.
3. **Cross-User Data Leak**: User A (`auth.uid: user-A`) attempting to read `/users/user-B/appData/current`.
4. **Cross-User Data Overwrite**: User A attempting to write `/users/user-B/appData/current`.
5. **Identity Spoofing**: User A creating a document in their own path `/users/user-A/appData/current` with payload `userId: "user-B"`.
6. **Path Traversal / Toxic ID**: User attempting to read `/users/../../etc/passwd`.
7. **Giant Payload / DOS Attack**: User attempting to write a payload exceeding allowed character limits.
8. **Catch-All Root Collection Bypass**: Attempt to write to `/unregistered_collection/test`.
9. **Ghost / Unknown Fields Attack**: Attempt to inject unexpected administrative role keys (`isAdmin: true`).
10. **Type Confusion Attack**: Attempting to write integer values into `userId` field.
11. **Client Delegation Query Scraping**: Attempting to query `/users` collection without filtering to own UID.
12. **Tampering with Other User's Profile**: User A modifying User B's displayName or email.
