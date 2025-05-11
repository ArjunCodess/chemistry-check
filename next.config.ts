import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
    responseLimit: '15mb',
  },
}

export default nextConfig;