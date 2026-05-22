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
  serverExternalPackages: ['payload', '@payloadcms/db-postgres', 'sharp'],

  // Packages Payload qui importent du CSS (`./bundled.css`) : forcer
  // Next à les passer dans son pipeline webpack (loaders CSS inclus)
  // au lieu du loader Node natif (qui refuse les `.css`). Sans ça,
  // l'admin Payload throw `ERR_UNKNOWN_FILE_EXTENSION` au chargement.
  // NB : un package ne peut PAS être à la fois dans serverExternalPackages
  // et transpilePackages. C'est pourquoi richtext-lexical et ui sont
  // ici, pas dans serverExternalPackages au-dessus.
  transpilePackages: [
    '@payloadcms/richtext-lexical',
    '@payloadcms/ui',
    '@payloadcms/next',
    '@payloadcms/translations',
  ],
};

export default withPayload(nextConfig);
