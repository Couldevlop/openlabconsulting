import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * Headers de sécurité (HSTS, CSP, COOP, CORP, X-Frame-Options, etc.)
 * sont gérés par `middleware.ts` — voir CLAUDE.md §10.3.
 *
 * Payload v3 est intégré via `withPayload` :
 *   - L'admin et l'API Payload sont servis depuis le même processus Next.
 *   - Le matching middleware exclut /admin et /api/* (voir middleware.ts).
 *   - Le secret Payload + DATABASE_URL doivent être renseignés au runtime
 *     pour que l'admin fonctionne.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Payload pousse des deps lourdes côté server-only ; on les externalise
  // pour ne pas les ramener dans le bundle client.
  serverExternalPackages: [
    'payload',
    '@payloadcms/db-postgres',
    '@payloadcms/richtext-lexical',
    'sharp',
  ],
};

export default withPayload(nextConfig);
