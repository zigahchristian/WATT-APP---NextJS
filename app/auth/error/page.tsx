// app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in using your original authentication method.";
      case "CredentialsSignin":
        return "Invalid email or password.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return "Unable to sign in with this provider. Please try again.";
      case "EmailSignin":
        return "Unable to send verification email.";
      case "Callback":
        return "Unable to sign in. Please try again.";
      case "Default":
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage(error)}</p>
        </div>

        <div className="mt-8 space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
