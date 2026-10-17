import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The shared engine ships TypeScript source.
  transpilePackages: ['@mindtier/core'],
  poweredByHeader: false,
  // The runtime OG image route reads its font from disk.
  outputFileTracingIncludes: {
    '/duel/[id]/opengraph-image': ['./src/assets/**'],
  },
  // The web Daily Challenge (scripts/build-play.mjs) is a single-page app in public/play:
  // files are served as-is, and every other /play path falls back to its index.html.
  async rewrites() {
    return [
      { source: '/play', destination: '/play/index.html' },
      { source: '/play/:path*', destination: '/play/index.html' },
    ];
  },
  async headers() {
    return [
      {
        source: '/play/_expo/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
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
