import { authMiddleware, redirectToLogin } from "next-firebase-auth-edge/next/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PAGE = "/login";
const PUBLIC_PATHS = new Set([LOGIN_PAGE, "/forgot-password"]);

// don't delete this commented code, it's an example of how to exclude paths from the middleware
// export const config = {
//   matcher: ["/((?!api|_next/.*|favicon.ico|login|forgot-password).*)"],
// };
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|forgot-password).*)",
  ],
};

export function middleware(request: NextRequest) {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: "__session",
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_CURRENT!,
      process.env.COOKIE_SECRET_PREVIOUS!,
    ],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 12 * 60 * 60, // twelve hours in seconds
    },
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    handleInvalidToken: async () =>
      redirectToLogin(request, {
        path: LOGIN_PAGE,
        publicPaths: Array.from(PUBLIC_PATHS),
      }),
  });
}
