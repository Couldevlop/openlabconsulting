import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Security headers — voir CLAUDE.md §10.3.
 * CSP avec nonce dynamique sera ajoutée en P10 via middleware.ts ;
 * ici on pose déjà les headers stables qui ne dépendent pas d'un nonce.
 */
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    if (!isProd) return [];
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
