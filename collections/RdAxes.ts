import type { CollectionConfig } from 'payload';
import { accessEditorChiefPlus } from '../lib/auth/roles';

/**
 * RdAxes — axes de recherche appliquée du Laboratoire (/laboratoire/axes).
 *
 * Source éditable depuis l'admin ; quand la collection est vide, les pages
 * retombent sur le fallback codé `RD_AXES` (lib/data/laboratoire.ts) via
 * `lib/laboratoire-server.ts`. Pas de workflow draft (contenu de référence) :
 * lecture publique, écriture EDITOR_CHIEF+ (RBAC §11.3).
 */
export const RdAxes: CollectionConfig = {
  slug: 'rd-axes',
  labels: { singular: 'Axe R&D', plural: 'Axes R&D' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
    listSearchableFields: ['title', 'pitch'],
    description:
      'Axes de recherche appliquée (/laboratoire/axes). Trié par `order`. Vide = fallback codé.',
  },
  access: {
    read: (): boolean => true,
    create: accessEditorChiefPlus,
    update: accessEditorChiefPlus,
    delete: accessEditorChiefPlus,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 80,
      admin: {
        description: 'Identifiant (kebab-case). Ex : « qms-multi-norme-iso ».',
      },
    },
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    {
      name: 'pitch',
      type: 'textarea',
      required: true,
      maxLength: 400,
      admin: { description: 'Pitch en 1 à 2 phrases.' },
    },
    {
      name: 'produitsLies',
      type: 'array',
      labels: { singular: 'Produit lié', plural: 'Produits liés' },
      admin: { description: 'Produits OpenLab issus de cet axe.' },
      fields: [{ name: 'value', type: 'text', required: true, maxLength: 80 }],
    },
    {
      name: 'exemples',
      type: 'array',
      labels: { singular: 'Exemple', plural: 'Exemples' },
      admin: { description: 'Réalisations concrètes (2 à 4).' },
      fields: [{ name: 'value', type: 'text', required: true, maxLength: 200 }],
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
