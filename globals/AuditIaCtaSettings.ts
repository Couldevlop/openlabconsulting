import type { GlobalConfig } from 'payload';

/**
 * Global AuditIaCtaSettings — bandeau « Audit IA gratuit » (CLAUDE.md §6.10).
 *
 * Lead magnet final présent en pied de plusieurs pages (homepage, solutions,
 * insights, etc.). Doit pouvoir être ajusté sans déploiement.
 *
 * RBAC : édition SUPER_ADMIN / ADMIN / EDITOR_CHIEF / EDITOR.
 */
export const AuditIaCtaSettings: GlobalConfig = {
  slug: 'audit-ia-cta-settings',
  label: 'Audit IA — Bandeau lead magnet',
  admin: {
    description:
      'CTA « Audit IA gratuit » récurrent dans le site (CLAUDE.md §6.10).',
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
    { name: 'eyebrow', type: 'text', maxLength: 60 },
    {
      name: 'headlineLead',
      type: 'text',
      maxLength: 160,
      admin: {
        description:
          'Partie ivoire du H2 (avant l’accent orange). Ex. « Trente minutes pour savoir si l’IA ».',
      },
    },
    {
      name: 'headlineHighlight',
      type: 'text',
      maxLength: 160,
      admin: {
        description: 'Partie orange du H2. Ex. « vous fera gagner du temps ».',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 400,
    },
    {
      type: 'group',
      name: 'cta',
      label: 'CTA primaire',
      fields: [
        { name: 'label', type: 'text', maxLength: 60 },
        { name: 'href', type: 'text', maxLength: 200 },
      ],
    },
    {
      name: 'reassuranceBullets',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Bullet', plural: 'Bullets' },
      admin: {
        description: 'Mini-rassurances sous le CTA (ex. « 100% gratuit »).',
      },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 80 }],
    },
    {
      type: 'group',
      name: 'whitepaperCard',
      label: 'Carte livre blanc (colonne secondaire)',
      admin: {
        description:
          'Carte « Livre blanc » à droite du bandeau audit. CTA téléchargement.',
      },
      fields: [
        {
          name: 'badge',
          type: 'text',
          maxLength: 40,
          admin: { description: 'Ex. « Livre blanc · 2026 ».' },
        },
        { name: 'title', type: 'text', maxLength: 100 },
        {
          name: 'subtitle',
          type: 'text',
          maxLength: 140,
          admin: { description: 'Phrase italique sous le titre.' },
        },
        { name: 'description', type: 'textarea', maxLength: 400 },
        {
          name: 'ctaLabel',
          type: 'text',
          maxLength: 60,
        },
        {
          name: 'ctaHref',
          type: 'text',
          maxLength: 200,
          admin: { description: 'Lien vers le PDF / page livre blanc.' },
        },
        {
          name: 'footnote',
          type: 'text',
          maxLength: 120,
          admin: {
            description:
              'Note de pied (ex. « Accès gratuit · PDF · ~25 pages »).',
          },
        },
      ],
    },
  ],
};
