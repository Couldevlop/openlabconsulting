import type { GlobalConfig } from 'payload';

/**
 * Global InsightsHubSettings — hero & textes du hub /insights (CLAUDE.md §5).
 *
 * Rend le hub Insights pilotable depuis l'admin (objectif « 90 % du
 * contenu paramétrable ») : eyebrow, titre (lead + mot surligné),
 * introduction et bloc « état vide » (quand peu d'articles).
 *
 * RBAC : édition SUPER_ADMIN / ADMIN / EDITOR_CHIEF / EDITOR.
 */
export const InsightsHubSettings: GlobalConfig = {
  slug: 'insights-hub-settings',
  label: 'Insights — Hub',
  admin: {
    description:
      'Hero et textes de la page /insights (titre, intro, état vide). Les articles eux-mêmes vivent dans la collection Articles.',
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
      admin: {
        description: 'Sur-titre au-dessus du H1 (ex. « Hub Insights »).',
      },
    },
    {
      name: 'headlineLead',
      type: 'text',
      maxLength: 120,
      admin: {
        description:
          'Début du titre, en couleur neutre (ex. « Notre lecture du »).',
      },
    },
    {
      name: 'headlineHighlight',
      type: 'text',
      maxLength: 120,
      admin: {
        description:
          'Fin du titre, surlignée en orange (ex. « terrain africain »).',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 600,
      admin: {
        description: 'Paragraphe d’introduction sous le titre.',
      },
    },
    {
      type: 'group',
      name: 'emptyState',
      label: 'État vide / encart bas de liste',
      fields: [
        { name: 'heading', type: 'text', maxLength: 120 },
        { name: 'text', type: 'textarea', maxLength: 400 },
        {
          name: 'ctaLabel',
          type: 'text',
          maxLength: 80,
          admin: { description: 'Libellé du lien d’appel à l’action.' },
        },
        {
          name: 'ctaHref',
          type: 'text',
          maxLength: 200,
          admin: { description: 'Cible du lien (ex. « /audit-ia »).' },
        },
      ],
    },
  ],
};
