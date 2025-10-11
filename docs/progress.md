# Progress Log

## 2025-10-08

- Moved Firebase project keys into `.env` and updated the Firebase client/server helpers under `src/config/` to read from environment variables.
- Enabled CSS side-effect imports in TypeScript via `allowArbitraryExtensions`.
- Brought `next-firebase-auth-edge` online: hardened `src/middleware.ts`, added cookie signature secrets, and fixed server utilities (`getServerUser`, `firebaseAdmin`).
- Delivered a secure Google sign-in flow with `/api/login`, user provisioning in Firestore, and a Shadcn-styled login page now using `signInWithPopup`.
- Rewrote the README to document setup, environment variables, authentication flow, and deployment tips.

## 2025-10-11

- Switched the login allow-list to Firestore (`config/administration.emails`) so both client and server share the same approved accounts.
- Added `/api/logout` and wired the sidebar `NavUser` dropdown to confirm before clearing cookies and signing out.
- Threaded the authenticated user through `getServerUser` → dashboard layout → `AppSidebar` so the actual admin’s profile appears in the UI.
- Refreshed the README to cover the config-based allow-list, user display, and logout flow, then logged progress in this file.

## Notes

- Keep the Firestore admin email list in sync with team membership; changes propagate automatically to login and API validation.
- Rotate `COOKIE_SECRET_CURRENT` and `COOKIE_SECRET_PREVIOUS` periodically to maintain session security.
