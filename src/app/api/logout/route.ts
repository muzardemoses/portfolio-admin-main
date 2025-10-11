import { NextRequest } from "next/server";
import { removeAuthCookies } from "next-firebase-auth-edge/next/cookies";


export async function POST(request: NextRequest) {
  return removeAuthCookies(request.headers, {
    cookieName: "__session",
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    },
  });
}
