import type { CollectionConfig } from 'payload';
import { ICON_KEYS } from '../lib/icon-map';
import { PRODUCT_SLUG_PATTERN } from '../lib/data/products';
import {
  accessReadPublishedOrAuth,
  accessEditorChiefPlus,
} from '../lib/auth/roles';

/**
 * Products — les 8 logiciels propriétaires OpenLab (CLAUDE.md §1.3, §7).
 *
 * Source de vérité éditable depuis l'admin Payload, consommée par :
 *   - `components/sections/Solutions.tsx` (showcase homepage §6.6)
 *   - `app/(site)/solutions/page.tsx` (hub)
 *   - `app/(site)/solutions/[slug]/page.tsx` (pages détaillées §7.1)
 *
 * Quand la collection est vide en base, les pages retombent sur les 8
 * produits hard-codés — cf. `lib/products-server.ts` (helpers
 * `getPublishedProducts` / `getProductBySlug`) et `FALLBACK_PRODUCTS`.
 *
 * Icônes : une icône Lucide est un composant React, donc non sérialisable.
 * On stocke une clé string (`iconKey`) résolue au rendu via
 * `lib/icon-map.ts` (`DynamicIcon`). Le select ci-dessous est borné aux
 * clés du registre (`ICON_KEYS`).
 *
 * Publication : versioning natif Payload (`versions.drafts`) via `_status`
 * — pas de champ `status` custom de publication (le champ `status` ici
 * décrit la maturité produit : production / pilote / MVP / dev).
 *
 * Sécurité :
 *   - OWASP A01 : lecture publique des seuls produits publiés
 *     (`_status === 'published'`), appliquée par la base via `access.read`,
 *     y compris sur l'API REST/GraphQL auto-exposée par Payload. Aligné
 *     sur Articles et CaseStudies.
 */
const ICON_OPTIONS = ICON_KEYS.map((key) => ({ label: key, value: key }));

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produit', plural: 'Produits' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', '_status', 'order'],
    listSearchableFields: ['name', 'tagline', 'target'],
    description:
      'Les 8 logiciels propriétaires OpenLab (§1.3, §7). Trie par `order` ascendant. Vide = fallback hard-codé.',
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    // OWASP A01 (Broken Access Control) : un visiteur non authentifié ne
    // peut lire QUE les versions publiées, y compris via l'API REST/GraphQL
    // de Payload. On retourne une contrainte `Where` sur le statut natif des
    // drafts (`_status`), appliquée par la base — pas seulement par les
    // server components. Un utilisateur authentifié voit tout. Aligné sur
    // Articles et CaseStudies.
    read: accessReadPublishedOrAuth,
    create: accessEditorChiefPlus,
    update: accessEditorChiefPlus,
    delete: accessEditorChiefPlus,
  },
  fields: [
    {
      // Champ texte libre (et NON un select fermé) : un nouveau produit
      // doit être créable depuis l'admin sans déploiement de code. La démo
      // interactive et le mockup restent optionnels par slug (registres
      // `components/demos/ProductDemo.tsx` / fallback graceful).
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 60,
      validate: (value: unknown): true | string =>
        (typeof value === 'string' && PRODUCT_SLUG_PATTERN.test(value)) ||
        'Slug invalide : minuscules, chiffres et tirets uniquement (ex. « sentinelbtp », « fraud-shield »).',
      admin: {
        description:
          'Identifiant URL du produit (/solutions/<slug>) : minuscules, chiffres, tirets. Ex : « sentinelbtp ».',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description:
          'Nom public. Ex : « NexusRH CI », « OpenLab Fraud Shield ».',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
      maxLength: 160,
      admin: {
        description:
          'Tagline §18 (italique Fraunces sur la page détail). Phrase courte, punchée.',
      },
    },
    {
      name: 'target',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: {
        description:
          'Cible marché concrète (§1.3). Ex : « PME & grandes entreprises · Côte d’Ivoire ».',
      },
    },
    {
      // Nommé `maturity` (et NON `status`) pour éviter la collision d'enum
      // Postgres avec le `_status` natif des drafts Payload (les deux
      // généreraient `enum_products_status`). Mappé au champ domaine
      // `Product.status` dans lib/products-server.ts.
      name: 'maturity',
      type: 'select',
      required: true,
      defaultValue: 'production',
      options: [
        { label: 'En production', value: 'production' },
        { label: 'En pilote', value: 'pilot' },
        { label: 'MVP avancé', value: 'mvp' },
        { label: 'En développement', value: 'dev' },
      ],
      admin: {
        description:
          'Maturité produit (badge de statut). Distinct de l’état de publication (`_status`).',
      },
    },
    {
      name: 'statusLabel',
      type: 'text',
      required: true,
      maxLength: 40,
      admin: {
        description:
          'Libellé affiché dans le badge. Ex : « En production », « MVP avancé ».',
      },
    },
    {
      // Image hero optionnelle pilotée depuis l'admin (médiathèque). Si
      // définie, elle prime sur la capture codée et le mockup SVG dans le
      // hero de /solutions/<slug>. Sinon, cascade inchangée (screenshot →
      // mockup → placeholder). AVIF/WebP générés automatiquement.
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          'Visuel du hero produit (optionnel). Prioritaire sur le mockup. AVIF/WebP générés automatiquement.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description: 'Eyebrow page détail. Ex : « SIRH IA · Côte d’Ivoire ».',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      maxLength: 600,
      admin: {
        description: 'Pitch hero page détail : 2 à 3 phrases.',
      },
    },
    {
      name: 'problem',
      type: 'textarea',
      required: true,
      maxLength: 600,
      admin: {
        description: 'Storytelling « avant » / problème : 2 à 3 phrases.',
      },
    },
    {
      name: 'iconKey',
      type: 'select',
      required: true,
      options: ICON_OPTIONS,
      admin: {
        description:
          'Icône Lucide du produit (clé du registre `lib/icon-map.ts`). Résolue au rendu via DynamicIcon.',
      },
    },
    {
      name: 'features',
      type: 'array',
      minRows: 4,
      maxRows: 6,
      required: true,
      labels: { singular: 'Fonctionnalité', plural: 'Fonctionnalités' },
      admin: {
        description: '4 à 6 fonctionnalités phares (icône + titre + 2 lignes).',
      },
      fields: [
        {
          name: 'iconKey',
          type: 'select',
          required: true,
          options: ICON_OPTIONS,
          admin: {
            description: 'Icône Lucide de la fonctionnalité (clé du registre).',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: { description: 'Titre court de la fonctionnalité.' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          maxLength: 320,
          admin: { description: 'Description en 1 à 2 phrases.' },
        },
      ],
    },
    {
      name: 'stack',
      type: 'array',
      minRows: 3,
      maxRows: 8,
      required: true,
      labels: { singular: 'Ligne de stack', plural: 'Stack technique' },
      admin: {
        description: '3 à 8 lignes décrivant la stack technique du produit.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 120,
          admin: {
            description:
              'Une ligne de stack. Ex : « Spring Boot 3 · Java 21 ».',
          },
        },
      ],
    },
    {
      name: 'proofs',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      required: true,
      labels: { singular: 'Preuve chiffrée', plural: 'Preuves chiffrées' },
      admin: {
        description:
          '2 à 4 stats sourcées. Aucun chiffre rond non sourcé (§4.10), `source` obligatoire.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 16,
          admin: {
            description:
              'Valeur affichée (orange). Ex : « −12 % », « < 3 mois ».',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: { description: 'Libellé court. Ex : « pertes carburant ».' },
        },
        {
          name: 'source',
          type: 'text',
          required: true,
          maxLength: 160,
          admin: {
            description: 'Source de la statistique : OBLIGATOIRE (§4.10).',
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Tarification',
      admin: {
        description: 'Tarification §7.1 : modèle + headline + détails.',
      },
      fields: [
        {
          name: 'model',
          type: 'select',
          required: true,
          defaultValue: 'quote',
          options: [
            { label: 'SaaS · abonnement mensuel', value: 'saas' },
            { label: 'Licence + maintenance', value: 'license' },
            { label: 'Sur devis', value: 'quote' },
          ],
          admin: { description: 'Modèle tarifaire affiché en badge.' },
        },
        {
          name: 'headline',
          type: 'text',
          required: true,
          maxLength: 120,
          admin: {
            description:
              'Affichage prix vedette. Ex : « À partir de 25 000 F CFA / utilisateur / mois ».',
          },
        },
        {
          name: 'details',
          type: 'array',
          minRows: 1,
          maxRows: 8,
          required: true,
          labels: { singular: 'Détail', plural: 'Détails' },
          admin: {
            description:
              'Ce qui est inclus / prérequis / support (3 à 5 bullets).',
          },
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              maxLength: 160,
              admin: { description: 'Un point de détail tarifaire.' },
            },
          ],
        },
        {
          name: 'note',
          type: 'text',
          required: false,
          maxLength: 200,
          admin: {
            description:
              'Note de pied optionnelle : conditions, devises, engagement.',
          },
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      minRows: 0,
      maxRows: 10,
      labels: { singular: 'Question', plural: 'FAQ' },
      admin: {
        description: 'FAQ produit (Schema.org FAQPage en page détail).',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: { description: 'La question.' },
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          maxLength: 800,
          admin: { description: 'La réponse.' },
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
          admin: { description: 'Titre affiché. Ex : « Data & gouvernance ».' },
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
        description: 'Date à laquelle le produit a été rendu public.',
      },
    },
  ],
  timestamps: true,
};
