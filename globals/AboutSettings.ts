import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * AboutSettings — contenu éditable de la page /a-propos (hero + trois
 * piliers). Pilotable depuis l'admin Payload (programme « 97 % paramétrable »).
 *
 * Le fetch + fallback vit dans `lib/cms/site-settings-server.ts`
 * (`getAboutContent`). La page reste résiliente si le global est vide (DB
 * down ou non rempli) grâce à `ABOUT_FALLBACK`.
 *
 * Sécurité : lecture publique (champs UI), écriture éditeur+ (OWASP A01).
 */
export const AboutSettings: GlobalConfig = {
  slug: 'about-settings',
  label: 'À propos : page',
  admin: {
    description:
      'Hero et trois piliers de la page /a-propos (CLAUDE.md §1.2). Vide = textes par défaut codés.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorPlus,
  },
  fields: [
    { name: 'eyebrow', type: 'text', maxLength: 60 },
    {
      name: 'headlineLead',
      type: 'text',
      maxLength: 120,
      admin: {
        description: 'Première partie du titre (avant l’accent orange).',
      },
    },
    {
      name: 'headlineHighlight',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Partie mise en avant en orange dans le titre.' },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 600,
      admin: {
        description: 'Paragraphe d’introduction (style éditorial italique).',
      },
    },
    { name: 'pillarsEyebrow', type: 'text', maxLength: 60 },
    { name: 'pillarsHeadline', type: 'text', maxLength: 160 },
    {
      name: 'pillars',
      type: 'array',
      labels: { singular: 'Pilier', plural: 'Piliers' },
      minRows: 1,
      maxRows: 4,
      admin: {
        description:
          'Les piliers de positionnement (conseil, produits, édition…).',
      },
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 80 },
        { name: 'body', type: 'textarea', required: true, maxLength: 400 },
      ],
    },
  ],
};
