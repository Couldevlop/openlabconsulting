import type { CollectionConfig } from 'payload';

/**
 * TeamMembers — l'équipe dirigeante OpenLab (CLAUDE.md §6, page /a-propos/equipe).
 *
 * Source de vérité éditable depuis l'admin Payload, consommée par :
 *   - `app/(site)/a-propos/equipe/page.tsx` (page E-E-A-T premium)
 *   - `lib/seo/schema.ts` (`personSchema` → JSON-LD Person)
 *
 * Quand la collection est vide en base, la page retombe sur les membres
 * hard-codés — cf. `lib/team-server.ts` (helpers `getTeamMembers` /
 * `getTeamMemberById`) et `FALLBACK_TEAM_MEMBERS` (lib/data/team.ts).
 *
 * Portrait : champ `image` (upload relationTo 'media', optionnel). Si absent,
 * le serveur conserve l'`imagePath` du fallback et la page rend un placeholder
 * via `MediaPlaceholder`.
 *
 * Publication : versioning natif Payload (`versions.drafts`) via `_status`
 * — PAS de champ `status` custom (qui collisionnerait avec l'enum `_status`
 * des drafts). Le slug stable est nommé `memberId` (et NON `id`) pour ne pas
 * heurter la clé primaire générée par Payload. Aligné sur Products / Expertises
 * / Sectors / CaseStudies / Articles.
 *
 * Sécurité :
 *   - OWASP A01 : lecture publique des seuls membres publiés
 *     (`_status === 'published'`), appliquée par la base via `access.read`,
 *     y compris sur l'API REST/GraphQL auto-exposée par Payload.
 */
export const TeamMembers: CollectionConfig = {
  slug: 'teamMembers',
  labels: { singular: 'Membre de l’équipe', plural: 'Équipe' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'jobTitle', 'memberId', '_status', 'order'],
    listSearchableFields: ['name', 'jobTitle', 'shortBio'],
    description:
      'Membres de l’équipe dirigeante OpenLab (page /a-propos/equipe). Trie par `order` ascendant. Vide = fallback hard-codé.',
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
      name: 'memberId',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 80,
      admin: {
        description:
          'Slug stable du membre (ancres + @id schema). Ex : « debora-ahouma ». NE PAS confondre avec l’`id` Payload.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description: 'Nom complet public. Ex : « Debora Ahouma ».',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: {
        description: 'Fonction. Ex : « CEO & Fondatrice, OpenLab Consulting ».',
      },
    },
    {
      name: 'shortBio',
      type: 'textarea',
      required: true,
      maxLength: 400,
      admin: {
        description:
          'Bio courte (paragraphe d’intro + description Person schema).',
      },
    },
    {
      name: 'bio',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      required: true,
      labels: { singular: 'Paragraphe', plural: 'Bio (paragraphes)' },
      admin: {
        description: 'Paragraphes détaillés affichés sur la page équipe.',
      },
      fields: [
        {
          name: 'value',
          type: 'textarea',
          required: true,
          maxLength: 800,
          admin: { description: 'Un paragraphe de la bio.' },
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
          'Portrait du membre. Si absent, la page retombe sur l’`imagePath` du fallback (placeholder).',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      maxLength: 400,
      admin: {
        description: 'Citation signature affichée en italique (Fraunces).',
      },
    },
    {
      name: 'focusAreas',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      required: true,
      labels: { singular: 'Domaine', plural: 'Domaines d’expertise' },
      admin: {
        description:
          'Domaines d’expertise (alimente `knowsAbout` dans le Person schema).',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 120,
          admin: { description: 'Un domaine d’expertise.' },
        },
      ],
    },
    {
      name: 'sameAs',
      type: 'array',
      minRows: 0,
      maxRows: 8,
      labels: { singular: 'Profil externe', plural: 'Profils externes' },
      admin: {
        description:
          'URLs de profils externes (alimente `sameAs` dans le Person schema). Ex : LinkedIn, Google Scholar.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 300,
          admin: { description: 'URL d’un profil externe (https).' },
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
        description: 'Date à laquelle le membre a été rendu public.',
      },
    },
  ],
  timestamps: true,
};
