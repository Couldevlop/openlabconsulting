import type { GlobalConfig } from 'payload';

/**
 * Global MethodologieSettings — section « Notre méthodologie d'accompagnement
 * IA » (3 axes), affichée sur la homepage ET le hub /expertises.
 *
 * Méthode OpenLab en trois étapes ordonnées (audit → choix data/secteurs →
 * stratégie d'adoption). Éditable sans toucher au code (refonte admin P2 —
 * « 90% paramétrable »).
 *
 * Architecture (miroir de HeroSettings / ManifestoSettings) :
 *   - Singleton (Global Payload), pas une collection
 *   - Accès lecture : public (anon) — contenu marketing affiché côté site
 *   - Accès écriture : SUPER_ADMIN, ADMIN, EDITOR_CHIEF, EDITOR (RBAC §11.3)
 *   - Lu via lib/cms/site-settings-server.ts avec fallback hard-codé
 *     (résilience : DB down → fallback METHODOLOGIE_FALLBACK)
 */
export const MethodologieSettings: GlobalConfig = {
  slug: 'methodologie',
  label: 'Méthodologie',
  admin: {
    description:
      'Section « Notre méthodologie d’accompagnement IA » (3 axes), visible sur la homepage et le hub Expertises. Sans valeurs ici, le site retombe sur les textes par défaut codés.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: ({ req }): boolean => {
      const role = req.user?.role;
      return (
        role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        role === 'EDITOR_CHIEF' ||
        role === 'EDITOR'
      );
    },
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'Mention courte au-dessus du H2 (ex. « Notre méthode »).',
      },
    },
    {
      name: 'titleLead',
      type: 'text',
      maxLength: 120,
      admin: {
        description:
          'Partie ivoire du H2 (avant le segment orange). Ex. « L’IA ne s’installe pas. ».',
      },
    },
    {
      name: 'titleHighlight',
      type: 'text',
      maxLength: 120,
      admin: {
        description: 'Partie orange du H2, accent. Ex. « Elle s’adopte. ».',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 600,
      admin: {
        description: 'Paragraphe d’introduction sous le H2.',
      },
    },
    {
      name: 'axes',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      labels: { singular: 'Axe', plural: 'Axes' },
      admin: {
        description:
          'Trois étapes ordonnées de la méthode (audit → données → adoption).',
      },
      fields: [
        {
          name: 'index',
          type: 'text',
          required: true,
          maxLength: 4,
          admin: { description: 'Numéro d’étape (ex. « 01 »).' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: { description: 'Titre de l’axe.' },
        },
        {
          name: 'punchline',
          type: 'text',
          required: true,
          maxLength: 140,
          admin: { description: 'Punchline en italique (ton §18).' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          maxLength: 400,
          admin: { description: 'Corps explicatif de l’axe.' },
        },
      ],
    },
    {
      type: 'group',
      name: 'cta',
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
  ],
};
