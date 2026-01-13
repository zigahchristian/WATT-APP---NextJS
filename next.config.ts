/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
    ],
  },
  // ... other config
};

module.exports = nextConfig;
