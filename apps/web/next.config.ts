import type { NextConfig } from "next";

// API URL for rewrites (server-side only, not exposed to browser)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/v1/* requests to the backend
        source: '/api/v1/:path*',
        destination: `${API_BASE_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
