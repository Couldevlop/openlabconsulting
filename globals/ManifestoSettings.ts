import type { GlobalConfig } from 'payload';

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
    update: ({ req }): boolean => {
      const role = req.user?.role;
      return (
        role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        role === 'EDITOR_CHIEF' ||
        role === 'EDITOR'
      );
    },
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
      name: 'stances',
      type: 'array',
      maxRows: 5,
      labels: { singular: 'Stance', plural: 'Stances' },
      admin: {
        description:
          'Trois antithèses courtes signatures : « X. Pourtant Y. ». Une par ligne.',
      },
      fields: [
        { name: 'text', type: 'textarea', required: true, maxLength: 280 },
      ],
    },
    {
      type: 'group',
      name: 'signature',
      fields: [
        { name: 'name', type: 'text', maxLength: 60 },
        { name: 'role', type: 'text', maxLength: 80 },
      ],
    },
  ],
};
