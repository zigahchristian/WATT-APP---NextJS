// next.config.ts
import type { NextConfig } from "next";

// Type for security headers
type SecurityHeader = {
  key: string;
  value: string;
};

// Type for image remote patterns
type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
  search?: string;
};

const securityHeaders: SecurityHeader[] = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Enable HSTS in production only
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const remotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "res.cloudinary.com",
    // You can be more specific with pathname if needed
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.cloudinary.com", // Wildcard subdomain
  },
  // Add other domains as needed
  // Example for additional domains:
  // {
  //   protocol: 'https',
  //   hostname: 'example.com',
  //   pathname: '/uploads/**',
  // },
];

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization configuration
  images: {
    remotePatterns,
    // Optional: Add device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Optional: Add image formats
    formats: ["image/webp"],
    // Optional: Disable image optimization in development for faster builds
    ...(process.env.NODE_ENV === "development" && {
      unoptimized: true,
    }),
  },

  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      removeConsole: {
        exclude: ["error"],
      },
    },
  }),

  // Disable dangerous features
  experimental: {
    // Add experimental features only if needed
    // optimizeCss: true, // Only enable if using
    // typedRoutes: true, // Type-safe routing (Next.js 13.4.8+)
  },

  // Additional security configs
  poweredByHeader: false,
  compress: true,

  // TypeScript config
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optional: Enable React strict mode for better security
  reactStrictMode: true,

  // Optional: Configure CORS for API routes
  async rewrites() {
    return [
      // Add rewrites if needed
    ];
  },
};

export default nextConfig;
