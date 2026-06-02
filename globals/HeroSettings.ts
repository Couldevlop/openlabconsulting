import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * Global HeroSettings — paramétrage du Hero homepage (CLAUDE.md §6.1).
 *
 * Permet à l'admin éditorial de modifier titre, sous-titre et CTA sans
 * toucher au code (refonte admin P2 — « 90% paramétrable »).
 *
 * Architecture :
 *   - Singleton (Global Payload), pas une collection
 *   - Accès lecture : public (anon) — affichage Hero homepage
 *   - Accès écriture : SUPER_ADMIN, ADMIN, EDITOR_CHIEF, EDITOR (RBAC §11.3)
 *   - Lu via lib/cms/site-settings-server.ts avec fallback hard-codé
 *     (résilience : DB down → fallback CLAUDE.md §6.1)
 */
export const HeroSettings: GlobalConfig = {
  slug: 'hero-settings',
  label: 'Hero — Homepage',
  admin: {
    description:
      'Bandeau principal de la homepage (CLAUDE.md §6.1). Sans valeurs ici, le site retombe sur les textes par défaut codés.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorPlus,
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      maxLength: 60,
      admin: {
        description:
          'Mention courte au-dessus du H1 (ex. « L’écosystème OpenLab »).',
      },
    },
    {
      name: 'headlineLead',
      type: 'text',
      maxLength: 120,
      admin: {
        description:
          'Partie ivoire du H1 (avant le segment orange). Ex. « L’IA, au service ».',
      },
    },
    {
      name: 'headlineHighlight',
      type: 'text',
      maxLength: 120,
      admin: {
        description:
          'Partie orange du H1, accent identitaire. Ex. « des réalités africaines. ».',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      maxLength: 400,
      admin: {
        description: 'Paragraphe descriptif sous le H1.',
      },
    },
    {
      type: 'group',
      name: 'primaryCta',
      label: 'CTA primaire (orange)',
      fields: [
        { name: 'label', type: 'text', maxLength: 60 },
        {
          name: 'href',
          type: 'text',
          maxLength: 200,
          admin: { description: 'Chemin interne (commence par /).' },
        },
      ],
    },
    {
      type: 'group',
      name: 'secondaryCta',
      label: 'CTA secondaire (ghost)',
      fields: [
        { name: 'label', type: 'text', maxLength: 60 },
        {
          name: 'href',
          type: 'text',
          maxLength: 200,
          admin: { description: 'Chemin interne (commence par /).' },
        },
      ],
    },
    {
      name: 'scrollCueLabel',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'Texte du « faites défiler » en bas du Hero.',
      },
    },
  ],
};
