import type { CollectionConfig } from 'payload';
import {
  accessReadPublishedOrAuth,
  accessEditorChiefPlus,
} from '../lib/auth/roles';

/**
 * CaseStudies — Cas clients du carrousel homepage §6.5.
 *
 * Cible : 4 à 8 cas en rotation. Chaque entrée pilote un slide du
 * composant `CasesCarousel`. L'image (mockup réel ou capture produit)
 * est uploadée via l'admin Payload puis stockée sur MinIO.
 *
 * Quand la collection est vide en base, le carrousel retombe sur ses
 * 4 slides hard-codés (NexusRH, SYGESCOM, AgroSense, FraudShield) —
 * cf. `lib/case-studies.ts` helper `getPublishedCaseStudies()`.
 *
 * Publication : pilotée par le versioning natif Payload (`versions.drafts`)
 * via le champ `_status` — pas de champ `status` custom (qui doublonnerait
 * l'état des drafts ; aligné sur la collection Articles).
 *
 * Sécurité :
 *   - Lecture publique des seuls cas publiés (`_status === 'published'`),
 *     appliquée par la base via `access.read` ci-dessous — y compris sur
 *     l'API REST/GraphQL auto-exposée par Payload.
 */
export const CaseStudies: CollectionConfig = {
  slug: 'caseStudies',
  labels: { singular: 'Cas client', plural: 'Cas clients' },
  admin: {
    useAsTitle: 'headline',
    defaultColumns: [
      'headline',
      'client',
      'sector',
      'productSlug',
      '_status',
      'order',
    ],
    listSearchableFields: ['headline', 'client', 'sector'],
    description:
      'Cas clients affichés dans le carrousel de la homepage (§6.5). 4 à 8 cas en rotation. Trie par `order` ascendant.',
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    // OWASP A01 (Broken Access Control) : un visiteur non authentifié ne
    // peut lire QUE les versions publiées, y compris via l'API REST/GraphQL
    // de Payload. On retourne une contrainte `Where` sur le statut natif des
    // drafts (`_status`), appliquée par la base — pas seulement par les server
    // components (`getPublishedCaseStudies` / `getCaseStudyForProduct`). Un
    // utilisateur authentifié (admin/éditeur) voit tout. Aligné sur Articles.
    read: accessReadPublishedOrAuth,
    create: accessEditorChiefPlus,
    update: accessEditorChiefPlus,
    delete: accessEditorChiefPlus,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: {
        description:
          'Titre du slide. Court, punché. Ex : « Pertes carburant divisées par 8. »',
      },
    },
    {
      name: 'punchline',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        description:
          'Phrase signature en italique orange sous le titre. Ex : « Vos volumes. Sous contrôle. »',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      maxLength: 480,
      admin: {
        description:
          '2 à 3 phrases descriptives du déploiement (technologie + résultat concret).',
      },
    },
    {
      name: 'sector',
      type: 'text',
      required: true,
      maxLength: 60,
      admin: {
        description:
          'Secteur affiché en badge. Ex : « Distribution hydrocarbures ».',
      },
    },
    {
      name: 'client',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description:
          'Nom (ou désignation anonymisée) du client. Ex : « Réseau de stations CI ».',
      },
    },
    {
      name: 'productSlug',
      type: 'select',
      required: true,
      options: [
        { label: 'NexusRH CI', value: 'nexusrh' },
        { label: 'NexusERP', value: 'nexuserp' },
        { label: 'SYGESCOM', value: 'sygescom' },
        { label: 'AgroSense CI', value: 'agrosense' },
        { label: 'QualitOS', value: 'qualitos' },
        { label: 'Fraud Shield', value: 'fraud-shield' },
        { label: 'Smart City', value: 'smart-city' },
        { label: 'SentinelBTP', value: 'sentinelbtp' },
      ],
      admin: {
        description:
          'Produit OpenLab associé. Le carrousel lie le slide à /solutions/<slug>.',
      },
    },
    {
      name: 'results',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      required: true,
      labels: { singular: 'Résultat', plural: 'Résultats' },
      admin: {
        description:
          'Exactement 3 résultats chiffrés affichés sous le slide. Aucun chiffre rond non sourcé (CLAUDE.md §4.10).',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 16,
          admin: {
            description:
              'Valeur affichée (orange). Ex : « −12 % », « < 3 mois », « 24/7 ».',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 60,
          admin: {
            description: 'Libellé court. Ex : « pertes carburant 3 mois ».',
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          'Capture produit / dashboard / mockup. Si absent, le slide retombe sur le mockup SVG par défaut associé au produit.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: {
        description:
          'Ordre d’affichage croissant (ex. 10, 20, 30, 40). Petit = en premier.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Date à laquelle le cas a été rendu public.',
      },
    },
  ],
  timestamps: true,
};
