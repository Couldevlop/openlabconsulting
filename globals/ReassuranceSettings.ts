import type { GlobalConfig } from 'payload';

/**
 * Global ReassuranceSettings — bandeau clients/partenaires de la
 * homepage (CLAUDE.md §6.2, « Ils nous accompagnent depuis le terrain »).
 *
 * Rend le bandeau pilotable depuis l'admin : l'éditeur ajoute/retire des
 * partenaires (nom + logo uploadé dans Media) sans toucher au code. Si le
 * global est vide, le composant retombe sur les logos par défaut
 * (`REASSURANCE_FALLBACK`), assurant la résilience (DB down / non seedé).
 *
 * OWASP A01 : read public (bandeau marketing), update réservé aux rôles
 * éditoriaux (deny by default pour les autres).
 */
export const ReassuranceSettings: GlobalConfig = {
  slug: 'reassurance-settings',
  label: 'Réassurance — Homepage',
  admin: {
    description:
      'Bandeau « Ils nous accompagnent depuis le terrain » (CLAUDE.md §6.2). Logos clients/partenaires.',
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
      maxLength: 80,
      admin: {
        description:
          'Libellé d’introduction au-dessus des logos (ex. « Ils nous accompagnent depuis le terrain »).',
      },
    },
    {
      name: 'partners',
      type: 'array',
      labels: { singular: 'Partenaire', plural: 'Partenaires' },
      admin: {
        description:
          'Logos affichés en marquee. Laisser vide pour retomber sur les logos par défaut.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 80,
          admin: {
            description: 'Nom de la marque — sert de texte alternatif (a11y).',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description:
              'Logo officiel (PNG/SVG transparent recommandé, hauteur ≈ 40 px).',
          },
        },
      ],
    },
  ],
};
