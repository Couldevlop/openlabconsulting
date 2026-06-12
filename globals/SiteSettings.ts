import type { GlobalConfig } from 'payload';
import { accessAdminPlus } from '../lib/auth/roles';

/**
 * Global SiteSettings — réglages transverses du site (CLAUDE.md §9).
 *
 * Aujourd'hui : override du **compteur de produits**. Le nombre de produits
 * propriétaires affiché dans les titres de marque (« Huit logiciels
 * propriétaires… ») est par défaut **dérivé automatiquement** du nombre de
 * produits publiés (collection `products`). Ce global permet à un admin de
 * figer/forcer ce nombre et son écriture en lettres sans toucher au code.
 *
 * Convention de tokens dans les textes éditoriaux (cf. lib/format/product-count.ts) :
 *   `{products}` / `{Products}` → chiffres · `{productsWord}` / `{ProductsWord}` → lettres.
 *
 * Architecture :
 *   - Singleton (Global Payload), pas une collection.
 *   - Lecture publique (le compteur s'affiche sur le site public).
 *   - Écriture : SUPER_ADMIN / ADMIN uniquement (réglage structurant, §11.3).
 *   - Lu via lib/cms/product-count-server.ts avec dérivation automatique en
 *     fallback (DB down / global vide → compte des produits publiés).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Réglages du site',
  admin: {
    description:
      'Réglages transverses. Laissez le compteur vide pour qu’il soit calculé automatiquement à partir des produits publiés.',
    group: 'Contenu site',
  },
  access: {
    read: (): boolean => true,
    update: accessAdminPlus,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Compteur de produits',
      admin: {
        description:
          'Par défaut, le nombre affiché (« Huit logiciels propriétaires… ») est compté automatiquement. Remplissez ces champs uniquement pour forcer une valeur.',
      },
      fields: [
        {
          name: 'productCountOverride',
          type: 'number',
          min: 0,
          max: 99,
          admin: {
            description:
              'Forcer le NOMBRE de produits (chiffres). Vide = calcul automatique depuis les produits publiés.',
          },
        },
        {
          name: 'productCountWordOverride',
          type: 'text',
          maxLength: 20,
          admin: {
            description:
              'Forcer le nombre EN LETTRES (ex. « huit »). Vide = écrit automatiquement depuis le nombre.',
          },
        },
      ],
    },
  ],
};
