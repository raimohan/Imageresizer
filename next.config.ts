// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'iili.io', // ✅ For your logo hosted at https://iili.io/FM85HeS.png
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
