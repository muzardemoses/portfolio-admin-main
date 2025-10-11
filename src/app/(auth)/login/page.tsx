"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { clientAuth } from "@/config/firebaseClient";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

async function postSession(user: User) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to create session");
  }

  return response.json().catch(() => null);
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignInDisabled = useMemo(
    () => isLoading,
    [isLoading]
  );

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const credential = await signInWithPopup(clientAuth, provider);
      const user = credential.user;
      const email = user.email?.toLowerCase();

      if (!email) {
        await signOut(clientAuth);
        setError(
          "This Google account is not authorized. Please sign in with an approved email."
        );
        return;
      }

      await postSession(user);
      router.replace("/");
    } catch (err) {
      console.error("Google sign-in failed", err);
      await signOut(clientAuth);
      const message =
        err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-muted/40 bg-card">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Login to Your Account
          </CardTitle>
          <CardDescription className="text-sm">
            Sign in with an authorized Google account to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Sign-in blocked</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="button"
            onClick={handleSignIn}
            disabled={isSignInDisabled}
            variant="secondary"
            className="w-full bg-muted text-foreground hover:bg-muted/80"
          >
            <span className="mr-2 inline-flex items-center justify-center">
              {isSignInDisabled ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 533.5 544.3"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285f4"
                    d="M533.5 278.4c0-18.6-1.5-37.1-4.7-55.3H272.1v104.8h146.9c-6.3 33.8-25 62.7-53.4 81.9v68.1h86.1c50.4-46.5 81.8-115 81.8-199.5z"
                  />
                  <path
                    fill="#34a853"
                    d="M272.1 544.3c72.5 0 133.5-23.9 178-65.4l-86.1-68.1c-23.9 16.1-54.5 25.7-91.9 25.7-70.6 0-130.5-47.3-152-110.7H31.7v69.2c44.5 88.3 135.1 149.3 240.4 149.3z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M120.1 325.8c-10.9-32.4-10.9-67.4 0-99.8V156.8H31.7c-45.8 90.9-45.8 199 0 289.9l88.4-69.1z"
                  />
                  <path
                    fill="#ea4335"
                    d="M272.1 107.7c38.5-.6 75.4 14.1 103.6 40.8l77.4-77.4C410.2 24.7 349.2-.2 272.1 0 166.8 0 76.2 61 31.7 149.3l88.4 69.2c21.3-63.4 81.2-110.8 152-110.8z"
                  />
                </svg>
              )}
            </span>
            {isLoading
              ? "Signing in..."
              : "Sign in with Google"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Access is restricted to approved accounts only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
