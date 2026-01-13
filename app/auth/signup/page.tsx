// app/auth/signup/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterSchema } from "@/schemas";
import { useState } from "react";
import type { z } from "zod";
import axios from "axios";
import { signIn } from "next-auth/react";

type RegisterFormData = z.infer<typeof RegisterSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/auth/register", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 201) {
        // Registration successful
        setSuccess("Account created successfully! Redirecting to sign in...");
        reset();

        // Redirect to signin page after 2 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.error || "Registration failed");
        } else if (error.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // For Google sign up, still use callback to dashboard
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Google sign in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            {/* First Name Field */}
            <div>
              <label
                htmlFor="firstname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                id="firstname"
                type="text"
                autoComplete="given-name"
                className={`relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  errors.firstname ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="First Name"
                {...register("firstname")}
              />
              {errors.firstname && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstname.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastname"
                type="text"
                autoComplete="family-name"
                className={`relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  errors.lastname ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Last Name"
                {...register("lastname")}
              />
              {errors.lastname && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastname.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Email address"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={`relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || !!success}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sign up with Google
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
