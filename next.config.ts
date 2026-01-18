import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Docker (standalone output)
  output: "standalone",
  
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Configuration expérimentale
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Configuration Webpack pour Socket.io (fallback pour Turbopack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Configuration Turbopack (Next.js 16)
  turbopack: {},
};

export default nextConfig;
