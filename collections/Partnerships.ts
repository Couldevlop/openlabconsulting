import type { CollectionConfig } from 'payload';
import { accessEditorChiefPlus } from '../lib/auth/roles';

/**
 * Partnerships — partenariats du Laboratoire (/laboratoire/partenariats) :
 * universitaires, publics, privés, ONG.
 *
 * Source éditable depuis l'admin ; vide = fallback codé `PARTENARIATS`
 * (lib/data/laboratoire.ts) via `lib/laboratoire-server.ts`. Lecture
 * publique, écriture EDITOR_CHIEF+ (RBAC §11.3).
 */
export const Partnerships: CollectionConfig = {
  slug: 'partnerships',
  labels: { singular: 'Partenariat', plural: 'Partenariats' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'order'],
    listSearchableFields: ['title', 'pitch'],
    description:
      'Partenariats du laboratoire (/laboratoire/partenariats). Vide = fallback codé.',
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
      admin: { description: 'Identifiant (kebab-case).' },
    },
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'universitaire',
      options: [
        { label: 'Universitaire', value: 'universitaire' },
        { label: 'Public', value: 'public' },
        { label: 'Privé', value: 'prive' },
        { label: 'ONG', value: 'ong' },
      ],
    },
    { name: 'pitch', type: 'textarea', required: true, maxLength: 400 },
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
