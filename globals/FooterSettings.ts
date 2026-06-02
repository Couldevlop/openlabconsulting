import type { GlobalConfig } from 'payload';
import { accessEditorChiefPlus } from '../lib/auth/roles';

/**
 * Global FooterSettings — pied de page premium (CLAUDE.md §6.11).
 *
 * Tagline, colonnes de liens, mentions sociales, copyright. RBAC :
 * édition SUPER_ADMIN / ADMIN / EDITOR_CHIEF.
 */
export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  label: 'Footer — Pied de page',
  admin: {
    description:
      'Pied de page : tagline, colonnes, social, mentions légales (CLAUDE.md §6.11).',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorChiefPlus,
  },
  fields: [
    {
      name: 'tagline',
      type: 'textarea',
      maxLength: 280,
      admin: { description: 'Phrase de marque sous le logo en footer.' },
    },
    {
      name: 'columns',
      type: 'array',
      maxRows: 5,
      labels: { singular: 'Colonne', plural: 'Colonnes' },
      admin: {
        description: 'Colonnes de liens. Chaque colonne a un titre et N liens.',
      },
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 60 },
        {
          name: 'links',
          type: 'array',
          minRows: 1,
          maxRows: 12,
          fields: [
            { name: 'label', type: 'text', required: true, maxLength: 60 },
            {
              name: 'href',
              type: 'text',
              required: true,
              maxLength: 200,
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      maxRows: 6,
      labels: { singular: 'Réseau social', plural: 'Réseaux sociaux' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'X (Twitter)', value: 'x' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'GitHub', value: 'github' },
            { label: 'Hugging Face', value: 'huggingface' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'url', type: 'text', required: true, maxLength: 200 },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Texte copyright affiché en bas (sans année — auto).',
      },
    },
  ],
};
