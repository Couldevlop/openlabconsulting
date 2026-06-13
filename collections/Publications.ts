import type { CollectionConfig } from 'payload';
import { accessEditorChiefPlus } from '../lib/auth/roles';

/**
 * Publications — productions du Laboratoire (/laboratoire/publications) :
 * livre, livres blancs, articles, conférences.
 *
 * Source éditable depuis l'admin ; vide = fallback codé `PUBLICATIONS`
 * (lib/data/laboratoire.ts) via `lib/laboratoire-server.ts`. Lecture
 * publique, écriture EDITOR_CHIEF+ (RBAC §11.3).
 */
export const Publications: CollectionConfig = {
  slug: 'publications',
  labels: { singular: 'Publication', plural: 'Publications' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'year', 'order'],
    listSearchableFields: ['title', 'summary'],
    description:
      'Publications du laboratoire (/laboratoire/publications). Vide = fallback codé.',
  },
  access: {
    read: (): boolean => true,
    create: accessEditorChiefPlus,
    update: accessEditorChiefPlus,
    delete: accessEditorChiefPlus,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'article-pair',
      options: [
        { label: 'Livre', value: 'livre' },
        { label: 'Livre blanc', value: 'livre-blanc' },
        { label: 'Article (pair)', value: 'article-pair' },
        { label: 'Conférence', value: 'conference' },
      ],
    },
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    {
      name: 'authors',
      type: 'array',
      labels: { singular: 'Auteur', plural: 'Auteurs' },
      fields: [{ name: 'value', type: 'text', required: true, maxLength: 120 }],
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      admin: { description: 'Année de parution.' },
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      maxLength: 300,
      admin: { description: 'Lien (interne /… ou externe https://…).' },
    },
    { name: 'summary', type: 'textarea', required: true, maxLength: 500 },
    {
      name: 'slug',
      type: 'text',
      maxLength: 80,
      index: true,
      admin: {
        description:
          'Optionnel. Si renseigné, crée une page de détail /laboratoire/publications/<slug> (résumé long). Sinon la carte pointe sur le lien.',
      },
    },
    {
      name: 'abstract',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description:
          'Résumé long (page de détail). Honnêteté : vraie publication/analyse, pas d’article académique inventé.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: { description: 'Ordre d’affichage croissant.' },
    },
  ],
  timestamps: true,
};
