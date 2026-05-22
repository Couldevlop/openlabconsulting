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
      name: 'headline',
      type: 'text',
      maxLength: 160,
      admin: {
        description:
          'Phrase d’accroche (ex. « 90 minutes pour cartographier votre IA. »).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 360,
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
  ],
};
