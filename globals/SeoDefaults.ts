import type { GlobalConfig } from 'payload';
import { accessAdminPlus } from '../lib/auth/roles';

/**
 * Global SeoDefaults — paramètres SEO globaux par défaut (CLAUDE.md §12).
 *
 * Méta description par défaut, mots-clés, image OG fallback. Override
 * possible par page (chaque route définit son `metadata`).
 *
 * RBAC : édition SUPER_ADMIN / ADMIN.
 */
export const SeoDefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: 'SEO — Défauts globaux',
  admin: {
    description: 'Méta-balises SEO par défaut pour les pages sans override.',
    group: 'SEO & marketing',
  },
  access: {
    read: (): boolean => true,
    update: accessAdminPlus,
  },
  fields: [
    {
      name: 'defaultDescription',
      type: 'textarea',
      maxLength: 280,
    },
    {
      name: 'defaultKeywords',
      type: 'array',
      maxRows: 25,
      labels: { singular: 'Mot-clé', plural: 'Mots-clés' },
      fields: [
        { name: 'keyword', type: 'text', required: true, maxLength: 60 },
      ],
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Image OG fallback (1200×630). Utilisée si une page n’a pas de générateur OG dédié.',
      },
    },
  ],
};
