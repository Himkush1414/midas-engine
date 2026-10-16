import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The shared engine ships TypeScript source.
  transpilePackages: ['@mindtier/core'],
  poweredByHeader: false,
  // The runtime OG image route reads its font from disk.
  outputFileTracingIncludes: {
    '/duel/[id]/opengraph-image': ['./src/assets/**'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
