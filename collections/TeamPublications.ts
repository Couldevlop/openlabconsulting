import type { CollectionConfig } from 'payload';
import {
  accessReadPublishedOrAuth,
  accessEditorChiefPlus,
} from '../lib/auth/roles';

/**
 * TeamPublications — publications signature de l'équipe OpenLab
 * (livres, livres blancs, conférences, articles pair-évalués).
 *
 * Source de vérité éditable depuis l'admin Payload, consommée par :
 *   - `app/(site)/a-propos/equipe/page.tsx` (section « Publications »)
 *
 * Quand la collection est vide en base, la page retombe sur les publications
 * hard-codées — cf. `lib/team-server.ts` (`getSignaturePublications`) et
 * `SIGNATURE_PUBLICATIONS` (lib/data/team.ts).
 *
 * Publication : versioning natif Payload (`versions.drafts`) via `_status`
 * — PAS de champ `status` custom (collision enum `_status`). Le type de
 * publication est nommé `pubType` (et NON `type`/`status`). Aligné sur
 * Products / Expertises / Sectors.
 *
 * Sécurité :
 *   - OWASP A01 : lecture publique des seules publications publiées
 *     (`_status === 'published'`), appliquée par la base via `access.read`,
 *     y compris sur l'API REST/GraphQL auto-exposée par Payload.
 */
export const TeamPublications: CollectionConfig = {
  slug: 'teamPublications',
  labels: { singular: 'Publication', plural: 'Publications équipe' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pubType', 'year', '_status', 'order'],
    listSearchableFields: ['title', 'description'],
    description:
      'Publications signature de l’équipe (page /a-propos/equipe). Trie par `order` ascendant. Vide = fallback hard-codé.',
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    // OWASP A01 (Broken Access Control) : un visiteur non authentifié ne
    // peut lire QUE les versions publiées, y compris via l'API REST/GraphQL
    // de Payload. Aligné sur Products / Expertises / Sectors.
    read: accessReadPublishedOrAuth,
    create: accessEditorChiefPlus,
    update: accessEditorChiefPlus,
    delete: accessEditorChiefPlus,
  },
  fields: [
    {
      // Nommé `pubType` (et NON `type` ni `status`) pour éviter toute
      // collision d'enum avec le `_status` natif des drafts Payload.
      name: 'pubType',
      type: 'select',
      required: true,
      defaultValue: 'Livre',
      options: [
        { label: 'Livre', value: 'Livre' },
        { label: 'Livre blanc', value: 'Livre blanc' },
        { label: 'Conférence', value: 'Conférence' },
        { label: 'Article pair-évalué', value: 'Article pair-évalué' },
      ],
      admin: {
        description:
          'Nature de la publication (pilote l’icône affichée et le libellé).',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: { description: 'Titre de la publication.' },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      min: 2000,
      max: 2100,
      admin: { description: 'Année de publication. Ex : 2026.' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 600,
      admin: { description: 'Description courte (2 à 3 phrases).' },
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: {
        description:
          'Lien interne (canonique) vers la publication. Ex : « /livre ». Pas d’URL externe.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: {
        description:
          'Ordre d’affichage croissant (ex. 10, 20, 30). Petit = en premier.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Date à laquelle la publication a été rendue publique.',
      },
    },
  ],
  timestamps: true,
};
