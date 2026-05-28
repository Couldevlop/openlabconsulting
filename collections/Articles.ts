import type { CollectionConfig } from 'payload';

/**
 * Articles — Insights publiés sur /insights et carte homepage §6.9.
 *
 * Cible :
 *   - 2 articles long-format / semaine (CLAUDE.md §12.5)
 *   - Auteur, catégorie, mots-clés, cover MinIO, contenu Lexical
 *
 * Sécurité (P10) :
 *   - Lecture publique uniquement si status === 'published'
 *   - Édition réservée AUTHOR (sur ses propres articles), EDITOR+
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'excerpt', 'keywords'],
    // Bouton « Aperçu » dans l'admin : prévisualise le brouillon courant
    // sur le front via le draft mode Next (route /api/preview, gardée par
    // authentification — cf. app/api/preview/route.ts).
    preview: (doc) =>
      doc?.slug && typeof doc.slug === 'string'
        ? `/api/preview?slug=${encodeURIComponent(doc.slug)}&collection=articles`
        : null,
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    // OWASP A01 (Broken Access Control) : un visiteur non authentifié ne
    // peut lire QUE les versions publiées, y compris via l'API REST/GraphQL
    // de Payload. On retourne une contrainte `Where` sur le statut natif des
    // drafts (`_status`), appliquée par la base — pas seulement par le server
    // component. Un utilisateur authentifié (admin/éditeur) voit tout.
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: 'published' } };
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Slug URL — minuscules, tirets, sans accents. Ex : migration-ia-souveraine-k3s-hetzner',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 280,
      admin: {
        description:
          'Phrase d’accroche utilisée en card homepage et meta description SEO.',
      },
    },
    {
      name: 'summary',
      type: 'array',
      labels: { singular: 'Point clé', plural: 'Points clés' },
      maxRows: 4,
      fields: [{ name: 'point', type: 'text', required: true, maxLength: 200 }],
      admin: {
        description:
          'Résumé en 2 à 4 points clés, affiché en tête d’article et exposé aux crawlers LLM (GEO — CLAUDE.md §12.4). Une phrase actionnable par point.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description:
          'Corps de l’article. Titres H2/H3 toutes les 300-400 mots, images depuis la médiathèque, citations en exergue. Chaque chiffre cité doit avoir une source ci-dessous.',
      },
    },
    {
      name: 'sources',
      type: 'array',
      labels: { singular: 'Source', plural: 'Sources' },
      maxRows: 15,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'Ex : Banque mondiale — Rapport 2024' },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (value: unknown): true | string =>
            typeof value === 'string' && /^https?:\/\//.test(value)
              ? true
              : 'URL invalide (doit commencer par http:// ou https://).',
        },
      ],
      admin: {
        description:
          'Références sourçant les chiffres et indicateurs de l’article (CLAUDE.md §17.9 — tous chiffres sourcés). Affichées en bas d’article.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Souveraineté', value: 'souverainete' },
        { label: 'Conformité RH', value: 'conformite-rh' },
        { label: 'Cybersécurité', value: 'cybersecurite' },
        { label: 'Data & gouvernance', value: 'data-gouvernance' },
        { label: 'Agents & IA', value: 'agents-ia' },
        { label: 'MLOps', value: 'mlops' },
        { label: 'Étude de cas', value: 'etude-de-cas' },
      ],
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [{ name: 'keyword', type: 'text', required: true }],
      maxRows: 8,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      defaultValue: 'OpenLab Consulting',
      admin: {
        description:
          'Nom de l’auteur affiché. Sera remplacé par une relation vers Users en P7 (auth).',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Image de couverture. AVIF/WebP générés automatiquement.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Date de publication. Sert pour le tri et le SEO.',
      },
    },
  ],
  timestamps: true,
};
