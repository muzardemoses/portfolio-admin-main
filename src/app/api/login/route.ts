import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "next-firebase-auth-edge/next/cookies";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/config/firebaseAdmin";

const ALLOWED_EMAILS = new Set([
  "muzardemoses@gmail.com",
  "mosesadebayoofficial@gmail.com",
]);

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Missing token" },
      { status: 400 }
    );
  }

  let decodedToken: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Failed to verify ID token", error);
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }

  const email = decodedToken.email?.toLowerCase();
  if (!email || !ALLOWED_EMAILS.has(email)) {
    return NextResponse.json(
      { success: false, message: "Email not authorized" },
      { status: 403 }
    );
  }

  const userRef = adminDb.collection("users").doc(decodedToken.uid);
  const snapshot = await userRef.get();
  const now = FieldValue.serverTimestamp();
  const provider = decodedToken.firebase?.sign_in_provider ?? "google";

  const profile = {
    displayName: decodedToken.name ?? "",
    email,
    photoURL: decodedToken.picture ?? "",
    provider,
    lastLogin: now,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (snapshot.exists) {
    await userRef.set(profile, { merge: true });
  } else {
    await userRef.set({
      uid: decodedToken.uid,
      ...profile,
      createdAt: FieldValue.serverTimestamp(),
      role: "admin",
    });
  }

  return setAuthCookies(request.headers, {
    apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    cookieName: "__session",
    cookieSignatureKeys: [
      getEnv("COOKIE_SECRET_CURRENT"),
      getEnv("COOKIE_SECRET_PREVIOUS"),
    ],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    },
    serviceAccount: {
      projectId: getEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
  });
}
