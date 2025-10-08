# Portfolio Admin Dashboard

An authenticated admin dashboard for managing portfolio content. Built with **Next.js 15**, **React 19**, and Shadcn UI, the project leverages Firebase for both client-side and server-side authentication, while `next-firebase-auth-edge` keeps every dashboard route locked down.

## Tech Stack

- Next.js 15 (App Router)
- React 19 & TypeScript
- Tailwind CSS & Shadcn UI components
- Firebase (Auth, Firestore, Storage)
- Firebase Admin SDK (server actions & middleware)
- next-firebase-auth-edge (cookie-based auth for middleware / API routes)

## Prerequisites

- Node.js 18.18+ (Next.js 15 requirement)
- A Firebase project with:
  - Google Sign-In enabled
  - Firestore and Storage provisioned
  - Service account credentials (JSON)
  - Allowed domain matching your local/dev host (e.g., `localhost`)

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root and populate it with your Firebase credentials. All values are required:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   COOKIE_SECRET_CURRENT=... # 64+ char random string
   COOKIE_SECRET_PREVIOUS=... # rotate as needed
   ```

   > **Private key tip:** Copy the exact multiline value from your service account JSON. If you prefer a single line, escape newlines as `\n` (as shown above).

3. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Authentication Flow

- The `/login` page uses `signInWithPopup` and only allows the approved Google accounts listed in `src/app/(auth)/login/page.tsx`.
- After a successful Google sign-in, a POST request to `/api/login`:
  - Verifies the ID token with Firebase Admin
  - Re-enforces the same email allow-list (see `src/app/api/login/route.ts`)
  - Creates/updates a document in the `users` collection with profile details (`displayName`, `email`, `photoURL`, `provider`, `role`, `createdAt`, `lastLogin`, etc.)
  - Issues secure cookies via `next-firebase-auth-edge`
- `src/middleware.ts` protects every non-public route, redirecting unauthenticated users back to `/login`.

To approve additional admins, update the allow-list in both the login page and API route.

## Project Structure Highlights

- `src/app/(auth)/login` — public auth routes (login layout + page)
- `src/app/(dashboard)` — protected dashboard UI
- `src/app/api/login/route.ts` — server endpoint that exchanges Google ID tokens for signed cookies and persists user profiles
- `src/config/firebaseClient.ts` — client-side Firebase initialization
- `src/config/firebaseAdmin.ts` — admin SDK initialization with Firestore access
- `src/middleware.ts` — auth enforcement with `next-firebase-auth-edge`

## Production Checklist

- Configure the same environment variables on your hosting provider (Vercel, etc.)
- Add your production domain to Firebase Authentication → Settings → Authorized domains
- Rotate `COOKIE_SECRET_CURRENT` regularly; move the previous value to `COOKIE_SECRET_PREVIOUS` for smooth rollovers
- Review Firestore security rules so only privileged contexts can modify critical data

## Useful Scripts

```bash
npm run dev     # Start local development (Turbopack)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Lint the codebase
```

---

Made with ❤ to power the Muzarde portfolio experience.
