import type { NextConfig } from "next";

// Check if we are in development mode
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            // Added ${isDev ? "'unsafe-eval'" : ""} to the script-src directive
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self' https://api.cloudinary.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;