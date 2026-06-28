import type { GlobalConfig } from 'payload';
import { accessEditorPlus } from '../lib/auth/roles';

/**
 * Global AnnouncementBanner — bandeau d'annonce « flash info » en haut du
 * site (toutes pages). Pilotable depuis l'admin : activer/désactiver,
 * éditer le message et le lien, sans déploiement. Si le global est vide
 * (DB down / non seedé), on retombe sur `ANNOUNCEMENT_BANNER_FALLBACK`
 * (enabled=false par défaut → rien ne s'affiche).
 *
 * OWASP A01 : read public (marketing), update réservé aux rôles éditoriaux.
 * A03 : le lien est assaini côté rendu (interne `/...` ou http(s) uniquement).
 */
export const AnnouncementBanner: GlobalConfig = {
  slug: 'announcement-banner',
  label: 'Bandeau d’annonce (flash info)',
  admin: {
    description:
      'Bandeau en haut du site. Cochez « Activer » pour l’afficher ; éditez le message et le lien. Idéal pour un flash info (ex. lancement OpenCacao).',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessEditorPlus,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Afficher le bandeau sur tout le site.',
      },
    },
    {
      name: 'message',
      type: 'text',
      maxLength: 200,
      admin: {
        description:
          'Texte du bandeau : court et percutant (capter en 5 secondes).',
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      maxLength: 40,
      admin: { description: 'Libellé du lien (ex. « Découvrir »).' },
    },
    {
      name: 'linkHref',
      type: 'text',
      maxLength: 300,
      admin: {
        description:
          'Cible du lien : chemin interne (ex. /insights/...) ou URL https. Laisser vide pour un bandeau sans lien.',
      },
    },
  ],
};
