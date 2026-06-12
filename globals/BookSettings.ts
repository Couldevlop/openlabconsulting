import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * Global BookSettings — métadonnées éditables du livre (/livre landing).
 *
 * Couvre le cœur marketing (titre, sous-titre, édition, ISBN, pages, pitch,
 * audiences). La couverture (image) et les chapitres restent codés pour
 * l'instant. Vide = fallback `BOOK` (lib/data/book.ts) via lib/cms/book-server.
 *
 * Lecture publique ; écriture EDITOR+ (RBAC §11.3).
 */
export const BookSettings: GlobalConfig = {
  slug: 'book-settings',
  label: 'Livre IA',
  admin: {
    description:
      'Métadonnées du livre (/livre). Laissez vide pour les valeurs par défaut. Couverture et chapitres non concernés ici.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorPlus,
  },
  fields: [
    { name: 'title', type: 'text', maxLength: 200 },
    { name: 'subtitle', type: 'text', maxLength: 200 },
    {
      name: 'edition',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Ex. « Édition OpenLab Consulting · Abidjan ».' },
    },
    {
      name: 'isbn',
      type: 'text',
      maxLength: 30,
      admin: { description: 'ISBN définitif (remplace le placeholder).' },
    },
    {
      name: 'pageCount',
      type: 'number',
      admin: { description: 'Nombre de pages estimé/définitif.' },
    },
    {
      name: 'publicationYear',
      type: 'number',
      admin: { description: 'Année de publication.' },
    },
    {
      name: 'longPitch',
      type: 'array',
      labels: { singular: 'Paragraphe', plural: 'Pitch (paragraphes)' },
      admin: { description: 'Pitch en 2 à 4 paragraphes.' },
      fields: [
        { name: 'value', type: 'textarea', required: true, maxLength: 600 },
      ],
    },
    {
      name: 'audiences',
      type: 'array',
      labels: { singular: 'Public', plural: 'Publics visés' },
      admin: { description: 'Personae lecteurs (label + description).' },
      fields: [
        { name: 'label', type: 'text', required: true, maxLength: 80 },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          maxLength: 300,
        },
      ],
    },
  ],
};
