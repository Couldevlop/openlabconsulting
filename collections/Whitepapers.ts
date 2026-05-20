import type { CollectionConfig } from 'payload';

/**
 * Whitepapers — Livres blancs téléchargeables sous gating email.
 *
 * Premier livre blanc : "L'IA souveraine en Côte d'Ivoire — Feuille
 * de route pratique pour les dirigeants en 2026" (mémoire
 * project_openlabconsulting_white_paper_souveraine).
 *
 * Distinct du livre principal (collection `books`, single doc).
 *
 * Sécurité P10 :
 *   - Téléchargement nécessite un email valide soumis (table Leads)
 *   - Rate-limit 3 téléchargements / IP / jour
 *   - Le PDF est stocké dans MinIO, URL signée à expiration
 */
export const Whitepapers: CollectionConfig = {
  slug: 'whitepapers',
  labels: { singular: 'Livre blanc', plural: 'Livres blancs' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subtitle', 'status', 'downloads', 'publishedAt'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 5,
  },
  access: {
    read: (): boolean => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'subtitle',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Sous-titre Fraunces italic affiché sous le titre.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Slug URL — ex : ia-souveraine-ci-2026. Sert dans /livres-blancs/<slug>.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 320,
    },
    {
      name: 'targetAudience',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description:
          'Public cible. Ex : Dirigeants CI · 2026, DSI banques UEMOA',
      },
    },
    {
      name: 'pageCount',
      type: 'number',
      admin: {
        description: 'Nombre de pages estimé du PDF.',
      },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          'PDF téléchargeable. URL signée générée à la volée à la demande.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'En rédaction', value: 'draft' },
        { label: 'En revue', value: 'review' },
        { label: 'Publié', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'downloads',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Compteur de téléchargements (incrémenté côté serveur).',
      },
    },
    {
      name: 'gatingRequired',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Si actif, l’email pro est obligatoire pour télécharger. Sinon, accès direct.',
      },
    },
  ],
  timestamps: true,
};
