import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

export async function getServerUser() {
    const reqCookies = cookies();
    const tokens = await getTokens(await reqCookies, {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        cookieName: "__session",
        cookieSignatureKeys: [
            process.env.COOKIE_SECRET_CURRENT!,
            process.env.COOKIE_SECRET_PREVIOUS!,
        ],
        serviceAccount: {
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!,
        },
    });

    if (!tokens) {
        return null;
    }

    const decoded = await adminAuth.verifyIdToken(tokens.token);
    return decoded; // includes custom claims like roles
}
