import type { CollectionConfig } from 'payload';
import { ICON_KEYS } from '../lib/icon-map';

/**
 * Sectors — les 5 secteurs cibles OpenLab (CLAUDE.md §5).
 *
 * Source de vérité éditable depuis l'admin Payload, consommée par :
 *   - `app/(site)/secteurs/page.tsx` (hub)
 *   - `app/(site)/secteurs/[slug]/page.tsx` (pages détaillées)
 *
 * Quand la collection est vide en base, les pages retombent sur les 5
 * secteurs hard-codés — cf. `lib/sectors-server.ts` (helpers
 * `getPublishedSectors` / `getSectorBySlug`) et `FALLBACK_SECTORS`.
 *
 * Les slugs sont alignés sur ceux du formulaire AuditIaCta afin qu'une
 * sélection de secteur depuis l'audit puisse rediriger sur la bonne page.
 *
 * Icônes : une icône Lucide est un composant React, donc non sérialisable.
 * On stocke une clé string (`iconKey`) résolue au rendu via
 * `lib/icon-map.ts` (`DynamicIcon`). Le select ci-dessous est borné aux
 * clés du registre (`ICON_KEYS`).
 *
 * Publication : versioning natif Payload (`versions.drafts`) via `_status`
 * — pas de champ `status` custom (qui collisionnerait avec l'enum
 * `_status` des drafts). Aligné sur Products / Expertises.
 *
 * Sécurité :
 *   - OWASP A01 : lecture publique des seuls secteurs publiés
 *     (`_status === 'published'`), appliquée par la base via `access.read`,
 *     y compris sur l'API REST/GraphQL auto-exposée par Payload.
 */
const SECTOR_SLUG_OPTIONS = [
  { label: 'Secteur public', value: 'secteur-public' },
  { label: 'Banque & assurance', value: 'banque-assurance' },
  { label: 'Agro-industrie', value: 'agro-industrie' },
  { label: 'Santé', value: 'sante' },
  { label: 'Télécoms & énergie', value: 'telecoms-energie' },
];

const ICON_OPTIONS = ICON_KEYS.map((key) => ({ label: key, value: key }));

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: { singular: 'Secteur', plural: 'Secteurs' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', '_status', 'order'],
    listSearchableFields: ['name', 'tagline', 'intro'],
    description:
      'Les 5 secteurs cibles OpenLab (§5). Trie par `order` ascendant. Vide = fallback hard-codé.',
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
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: 'published' } };
    },
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: SECTOR_SLUG_OPTIONS,
      admin: {
        description:
          'Identifiant du secteur. Pilote l’URL /secteurs/<slug> et la redirection depuis l’audit IA.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description: 'Nom court — cards + h1. Ex : « Banque & assurance ».',
      },
    },
    {
      name: 'iconKey',
      type: 'select',
      required: true,
      options: ICON_OPTIONS,
      admin: {
        description:
          'Icône Lucide du secteur (clé du registre `lib/icon-map.ts`). Résolue au rendu via DynamicIcon.',
      },
    },
    {
      name: 'tagline',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: {
        description:
          'Tagline §18 (italique Fraunces sur la page détail). Phrases courtes, antithèse.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      maxLength: 600,
      admin: {
        description: 'Hero pitch page détail — 2 à 3 phrases.',
      },
    },
    {
      name: 'enjeux',
      type: 'array',
      minRows: 4,
      maxRows: 6,
      required: true,
      labels: { singular: 'Enjeu', plural: 'Enjeux' },
      admin: {
        description: '4 à 6 enjeux concrets du secteur.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: { description: 'Un enjeu concret du secteur.' },
        },
      ],
    },
    {
      name: 'regulation',
      type: 'array',
      minRows: 3,
      maxRows: 5,
      required: true,
      labels: {
        singular: 'Texte réglementaire',
        plural: 'Cadre réglementaire',
      },
      admin: {
        description:
          'Cadre réglementaire / normatif applicable au secteur (3 à 5 entrées).',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: { description: 'Un texte réglementaire / normatif.' },
        },
      ],
    },
    {
      name: 'produitsLies',
      type: 'array',
      minRows: 0,
      maxRows: 5,
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
          admin: { description: 'Slug du produit. Ex : « fraud-shield ».' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: {
            description: 'Titre affiché. Ex : « OpenLab Fraud Shield ».',
          },
        },
      ],
    },
    {
      name: 'expertisesLies',
      type: 'array',
      minRows: 0,
      maxRows: 4,
      labels: { singular: 'Expertise liée', plural: 'Expertises liées' },
      admin: {
        description:
          'Expertises OpenLab pertinentes (cross-link /expertises/<slug>).',
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          maxLength: 60,
          admin: {
            description: 'Slug de l’expertise. Ex : « data-gouvernance ».',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: {
            description: 'Titre affiché. Ex : « Data & gouvernance ».',
          },
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
        description: 'Date à laquelle le secteur a été rendu public.',
      },
    },
  ],
  timestamps: true,
};
