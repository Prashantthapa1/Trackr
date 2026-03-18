/**
 * next.config.ts
 *
 * Configures Next.js with image domains for Vercel Blob storage and Google
 * profile avatars. We also set serverExternalPackages to let Prisma work
 * correctly in serverless functions on Vercel.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
