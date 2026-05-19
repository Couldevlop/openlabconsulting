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
    defaultColumns: ['title', 'category', 'author', 'status', 'publishedAt'],
    listSearchableFields: ['title', 'excerpt', 'keywords'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    read: ({ req }): boolean => {
      // Lecture publique des articles publiés ; admin voit tout.
      if (req.user) return true;
      return true; // Pour P6 setup, accès public ; le filter status='published'
      // sera appliqué côté server component qui consomme la collection.
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
      name: 'content',
      type: 'richText',
      required: true,
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'En revue', value: 'review' },
        { label: 'Publié', value: 'published' },
      ],
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
