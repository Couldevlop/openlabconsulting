import type { CollectionConfig } from 'payload';
import { ICON_KEYS } from '../lib/icon-map';
import {
  accessReadPublishedOrAuth,
  accessEditorChiefPlus,
} from '../lib/auth/roles';

/**
 * Expertises — les 4 axes de conseil OpenLab (CLAUDE.md §5, §6.3).
 *
 * Source de vérité éditable depuis l'admin Payload, consommée par :
 *   - `components/sections/Expertises.tsx` (cards homepage §6.3)
 *   - `app/(site)/expertises/page.tsx` (hub)
 *   - `app/(site)/expertises/[slug]/page.tsx` (pages détaillées)
 *
 * Quand la collection est vide en base, les pages retombent sur les 4
 * expertises hard-codées — cf. `lib/expertises-server.ts` (helpers
 * `getPublishedExpertises` / `getExpertiseBySlug`) et `FALLBACK_EXPERTISES`.
 *
 * Icônes : une icône Lucide est un composant React, donc non sérialisable.
 * On stocke une clé string (`iconKey`) résolue au rendu via
 * `lib/icon-map.ts` (`DynamicIcon`). Le select ci-dessous est borné aux
 * clés du registre (`ICON_KEYS`).
 *
 * Publication : versioning natif Payload (`versions.drafts`) via `_status`
 * — pas de champ `status` custom (qui collisionnerait avec l'enum
 * `_status` des drafts). Aligné sur Products / CaseStudies / Articles.
 *
 * Sécurité :
 *   - OWASP A01 : lecture publique des seules expertises publiées
 *     (`_status === 'published'`), appliquée par la base via `access.read`,
 *     y compris sur l'API REST/GraphQL auto-exposée par Payload.
 */
const EXPERTISE_SLUG_OPTIONS = [
  { label: 'Conseil & stratégie IA', value: 'conseil-strategie' },
  { label: 'Agents & automatisation', value: 'agents-automatisation' },
  { label: 'Data & gouvernance', value: 'data-gouvernance' },
  { label: 'Cybersécurité augmentée', value: 'cybersecurite-ia' },
];

const ICON_OPTIONS = ICON_KEYS.map((key) => ({ label: key, value: key }));

export const Expertises: CollectionConfig = {
  slug: 'expertises',
  labels: { singular: 'Expertise', plural: 'Expertises' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'order'],
    listSearchableFields: ['title', 'punchline', 'intro'],
    description:
      'Les 4 axes de conseil OpenLab (§5, §6.3). Trie par `order` ascendant. Vide = fallback hard-codé.',
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    // OWASP A01 (Broken Access Control) : un visiteur non authentifié ne
    // peut lire QUE les versions publiées, y compris via l'API REST/GraphQL
    // de Payload. On retourne une contrainte `Where` sur le statut natif des
    // drafts (`_status`), appliquée par la base. Aligné sur Products.
    read: accessReadPublishedOrAuth,
    create: accessEditorChiefPlus,
    update: accessEditorChiefPlus,
    delete: accessEditorChiefPlus,
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: EXPERTISE_SLUG_OPTIONS,
      admin: {
        description:
          'Identifiant de l’expertise. Pilote l’URL /expertises/<slug>.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description:
          'Titre court — cards homepage + h1 page détail. Ex : « Conseil & stratégie IA ».',
      },
    },
    {
      name: 'iconKey',
      type: 'select',
      required: true,
      options: ICON_OPTIONS,
      admin: {
        description:
          'Icône Lucide de l’expertise (clé du registre `lib/icon-map.ts`). Résolue au rendu via DynamicIcon.',
      },
    },
    {
      name: 'punchline',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: {
        description:
          'Phrase d’accroche §18 (italique Fraunces sur la page détail). Antithèse, deux temps.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      maxLength: 600,
      admin: {
        description: 'Paragraphe d’intro hero page détail — 2 à 3 phrases.',
      },
    },
    {
      name: 'competences',
      type: 'array',
      minRows: 4,
      maxRows: 6,
      required: true,
      labels: { singular: 'Compétence', plural: 'Compétences' },
      admin: {
        description: '4 à 6 sous-domaines concrets couverts par l’expertise.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: { description: 'Un sous-domaine couvert.' },
        },
      ],
    },
    {
      name: 'approche',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      required: true,
      labels: { singular: 'Étape', plural: 'Approche (3 étapes)' },
      admin: {
        description: '3 étapes de notre approche (méthodologie). Exactement 3.',
      },
      fields: [
        {
          name: 'step',
          type: 'text',
          required: true,
          maxLength: 4,
          admin: {
            description: 'Numéro d’étape. Ex : « 01 », « 02 », « 03 ».',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: { description: 'Titre court de l’étape.' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          maxLength: 400,
          admin: { description: 'Description de l’étape en 1 à 2 phrases.' },
        },
      ],
    },
    {
      name: 'produitsLies',
      type: 'array',
      minRows: 0,
      maxRows: 4,
      labels: { singular: 'Produit lié', plural: 'Produits liés' },
      admin: {
        description:
          'Produits OpenLab pertinents (cross-link /solutions/<slug>).',
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          maxLength: 60,
          admin: { description: 'Slug du produit. Ex : « nexusrh ».' },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: { description: 'Nom affiché. Ex : « NexusRH CI ».' },
        },
      ],
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
        description: 'Date à laquelle l’expertise a été rendue publique.',
      },
    },
  ],
  timestamps: true,
};
