import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    // Fix TypeScript errors instead of ignoring them
    // ignoreBuildErrors: true,
  },
  reactStrictMode: true,  // Keep strict mode enabled to catch performance issues
};

export default nextConfig;
