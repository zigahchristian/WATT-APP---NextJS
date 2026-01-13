// components/auth/SignInForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get callback URL or default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  useEffect(() => {
    // If there's an error parameter, show it
    if (errorParam) {
      setError("Authentication failed. Please try again.");
    }
  }, [errorParam]);

  // Redirect if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [router, callbackUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        // Successful login - redirect to callback URL
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");

    try {
      // Social logins will handle redirect automatically via NextAuth callbacks
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error(`Social sign in error (${provider}):`, error);
      setError(`Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {callbackUrl !== "/dashboard" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              You need to sign in to access this page
            </p>
          )}
        </div>

        {/* Social Login Buttons */}
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>

          <button
            onClick={() => handleSocialSignIn("github")}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            <FaGithub className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </button>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type="password"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
            <div className="text-center">
              <Link
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Not having an Account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
