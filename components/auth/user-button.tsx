// components/auth/CompactUserMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUser, FaSignOutAlt, FaSpinner, FaCog } from "react-icons/fa";

export default function UserButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
      setIsOpen(false);
    }
  };

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  // Process image URL to use HTTP if HTTPS fails
  const getImageUrl = (url: string) => {
    if (imageError && url.startsWith("https://")) {
      return url.replace("https://", "http://");
    }
    return url;
  };

  if (!session?.user) return null;

  const displayInitials =
    session.user.firstname && session.user.lastname
      ? `${session.user.firstname.charAt(0)}${session.user.lastname.charAt(0)}`
      : session.user.name
      ? session.user.name
          .split(" ")
          .map((n) => n.charAt(0))
          .join("")
      : session.user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      {/* Ultra Compact Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300 shadow-sm"
      >
        {session.user.image && !imageError ? (
          <Image
            src={getImageUrl(session.user.image)}
            alt="User"
            width={32}
            height={32}
            className="rounded-full"
            onError={handleImageError}
            unoptimized={true} // Bypass Next.js image optimization for external URLs
          />
        ) : (
          <span className="text-xs font-medium text-gray-700">
            {displayInitials}
          </span>
        )}
      </button>

      {/* Compact Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info - Minimal */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-900 truncate">
              {session.user.firstname} {session.user.lastname}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {session.user.email}
            </p>
          </div>

          {/* Menu Items - Compact */}
          <div className="py-1">
            <button
              onClick={() => {
                router.push("/profile");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              <FaUser className="w-3 h-3" />
              Profile
            </button>

            <button
              onClick={() => {
                router.push("/settings");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              <FaCog className="w-3 h-3" />
              Settings
            </button>
          </div>

          {/* Sign Out - Compact */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isSigningOut ? (
                <FaSpinner className="w-3 h-3 animate-spin" />
              ) : (
                <FaSignOutAlt className="w-3 h-3" />
              )}
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
