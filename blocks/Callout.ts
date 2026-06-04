import type { Block } from 'payload';

/**
 * Bloc « Encadré » (callout) pour le corps des articles Insights.
 *
 * Quatre variantes éditoriales (information, astuce, avertissement,
 * danger) à la manière des meilleures plateformes de documentation
 * (Stripe, Vercel, Linear). Stocké inline dans le JSON Lexical du champ
 * richText — aucune table SQL dédiée, donc aucune migration.
 *
 * Le rendu public est assuré par `components/insights/ArticleBody.tsx`
 * (converter `blocks.callout`). Le `content` est du texte simple échappé
 * par React au rendu (OWASP A03) — pas de HTML utilisateur interprété.
 */
export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Encadré', plural: 'Encadrés' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Information', value: 'info' },
        { label: 'Astuce', value: 'tip' },
        { label: 'Avertissement', value: 'warning' },
        { label: 'Danger', value: 'danger' },
      ],
      admin: {
        description: 'Tonalité de l’encadré (couleur + icône au rendu).',
      },
    },
    {
      name: 'title',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Titre optionnel de l’encadré.' },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 600,
      admin: { description: 'Texte de l’encadré (2 à 4 phrases).' },
    },
  ],
};
