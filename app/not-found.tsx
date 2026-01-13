// app/not-found.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/students");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-8 max-w-md">
        {/* Error Code */}
        <div className="relative">
          <div className="text-[180px] font-black text-gray-200 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-800">Lost in Space</h1>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-xl text-gray-600">
            The page you&apos;re looking for isn&apos;t here.
          </p>
          <p className="text-gray-500">
            Redirecting to homepage in{" "}
            <span className="font-bold text-primary animate-pulse">
              {countdown}
            </span>{" "}
            seconds...
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => router.push("/students")}
            className="gap-2"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Go Home Now
          </Button>

          <Button
            onClick={() => router.push("/students")}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-400 pt-8 border-t">
          If this error persists, please contact support.
        </p>
      </div>
    </div>
  );
}
