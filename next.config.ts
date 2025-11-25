import { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@chakra-ui/react",
      "react-icons/lu",
      "react-icons/ri",
      "react-icons/fi",
      "framer-motion"
    ],
    // Speed up webpack compilation
    webpackBuildWorker: true,
  },
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  outputFileTracingRoot: path.join(__dirname),
  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Improve dev server performance
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize webpack
  webpack: (config, { dev, isServer }) => {
    // Fix for 'self is not defined' error in server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }

    if (dev && !isServer) {
      // Speed up dev builds
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }

    return config;
  },
  // Reduce unnecessary page data
  pageExtensions: ['tsx', 'ts'],
};

export default nextConfig;
