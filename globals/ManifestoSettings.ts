import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * Global ManifestoSettings — section Manifeste homepage (CLAUDE.md §6.7).
 *
 * 3 stances éditoriales (antithèses, ton signature OpenLab) + signature.
 * « Cette fois, l'Afrique n'a plus d'excuse. » — Debora Ahouma.
 *
 * RBAC : édition SUPER_ADMIN / ADMIN / EDITOR_CHIEF / EDITOR.
 */
export const ManifestoSettings: GlobalConfig = {
  slug: 'manifesto-settings',
  label: 'Manifeste — Homepage',
  admin: {
    description:
      'Manifeste OpenLab (CLAUDE.md §6.7). Trois stances en antithèse + signature.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorPlus,
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      maxLength: 60,
    },
    {
      name: 'headline',
      type: 'text',
      maxLength: 200,
      admin: {
        description:
          'Phrase manifeste centrale (ex. « Cette fois, l’Afrique n’a plus d’excuse. »).',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 600,
      admin: {
        description: 'Paragraphe d’introduction sous le H2 (ton éditorial).',
      },
    },
    {
      name: 'stances',
      type: 'array',
      minRows: 3,
      maxRows: 5,
      labels: { singular: 'Stance', plural: 'Stances' },
      admin: {
        description:
          'Antithèses : excuse historique récusée, puis fait concret opposé.',
      },
      fields: [
        {
          name: 'excuse',
          type: 'text',
          required: true,
          maxLength: 140,
          admin: {
            description:
              'Excuse historique en italique (ex. « On n’a pas les outils. »).',
          },
        },
        {
          name: 'fact',
          type: 'textarea',
          required: true,
          maxLength: 280,
          admin: { description: 'Fait concret OpenLab opposé.' },
        },
      ],
    },
    {
      name: 'conclusion',
      type: 'textarea',
      maxLength: 400,
      admin: {
        description:
          'Phrase de conclusion sous les stances (ex. « Ce n’est pas un manifeste pour 2035. »).',
      },
    },
    {
      type: 'group',
      name: 'signature',
      fields: [
        { name: 'name', type: 'text', maxLength: 60 },
        { name: 'role', type: 'text', maxLength: 80 },
        {
          name: 'locationDate',
          type: 'text',
          maxLength: 80,
          admin: {
            description: 'Ex. « Abidjan · Mai 2026 ».',
          },
        },
      ],
    },
  ],
};
