import type { CollectionConfig } from 'payload';

/**
 * Media — bibliothèque centralisée d'assets uploadés via Payload.
 *
 * Stockage : MinIO self-hosted (S3-compatible) — voir CLAUDE.md §9.3.
 * À brancher via @payloadcms/storage-s3 adapter en P6 final, une
 * fois le bucket MinIO instancié sur le cluster K3s.
 *
 * Pour l'instant, configuration locale par défaut (file system).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: (): boolean => true,
  },
  upload: {
    // OWASP A03/XSS stocké : on N'autorise PAS `image/*` (qui couvre
    // `image/svg+xml` — un SVG peut embarquer du <script> exécuté si le
    // fichier est ouvert en navigation directe depuis notre domaine). Liste
    // blanche explicite de formats raster sûrs + documents.
    mimeTypes: [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/avif',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'application/zip',
    ],
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 180, position: 'centre' },
      { name: 'card', width: 768, height: 432, position: 'centre' },
      { name: 'cover', width: 1600, height: 900, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Texte alternatif obligatoire pour l’accessibilité (WCAG 2.2). Saisi par l’éditeur ou suggéré par Claude au moment de l’upload (P7).',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Légende optionnelle affichée sous l’image en édito.',
      },
    },
  ],
};
