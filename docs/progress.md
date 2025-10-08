# Progress Log

## Recent Updates

- Moved Firebase project keys into `.env` and updated the Firebase client/server helpers under `src/config/` to read from environment variables.
- Enabled CSS side-effect imports in TypeScript via `allowArbitraryExtensions`.
- Brought `next-firebase-auth-edge` online: hardened `src/middleware.ts`, added cookie signature secrets, and fixed server utilities (`getServerUser`, `firebaseAdmin`).
- Delivered a secure Google sign-in flow with `/api/login`, user provisioning in Firestore, and a Shadcn-styled login page now using `signInWithPopup`.
- Rewrote the README to document setup, environment variables, authentication flow, and deployment tips.

## Notes

- Allowed admin emails are currently hardcoded in both the login page and API route—update both spots when adding teammates.
- Remember to rotate `COOKIE_SECRET_CURRENT` and `COOKIE_SECRET_PREVIOUS` periodically.
