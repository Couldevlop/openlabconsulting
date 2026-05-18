import type { NextConfig } from 'next';

/**
 * Headers de sécurité (HSTS, CSP, COOP, CORP, X-Frame-Options, etc.)
 * sont gérés par `middleware.ts` — voir CLAUDE.md §10.3.
 * Cela permet d'ajouter en P10 un nonce CSP dynamique sans toucher
 * à cette config.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
