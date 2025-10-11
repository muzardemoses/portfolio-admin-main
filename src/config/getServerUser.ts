import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { adminAuth } from "./firebaseAdmin";

interface DecodedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export async function getServerUser(): Promise<DecodedUser | null> {
  const cookieStore = cookies();
  const tokens = await getTokens(await cookieStore, {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: "__session",
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_CURRENT!,
      process.env.COOKIE_SECRET_PREVIOUS!,
    ],
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
  });

  if (!tokens) {
    return null;
  }

  const decoded = await adminAuth.verifyIdToken(tokens.token);
  
  return {
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    ...decoded,
  };
}
