import type { ProductSlug } from './products';

/**
 * Sites officiels des produits qui ont leur propre vitrine (sous-domaine
 * dédié). Source statique, **client-safe**, sur le modèle de
 * `product-article-links.ts` : pas de champ Payload, donc pas de migration.
 *
 * SEO : la page `/solutions/<slug>` renvoie vers le site produit avec des
 * ancres descriptives (une par page d'atterrissage indexable du site
 * produit, cf. son robots.txt), et le schema `SoftwareApplication` déclare
 * le site produit en `sameAs`. Liens suivis (pas de `nofollow`) : c'est
 * le même éditeur, l'autorité du domaine principal doit irriguer le
 * sous-domaine.
 *
 * Ne lister que des URL vérifiées en ligne (200) : un lien mort ici
 * coûte plus qu'il ne rapporte.
 */
export interface ProductSiteLink {
  /** Ancre descriptive (mot-clé visé par la page cible). */
  label: string;
  href: string;
}

export interface ProductSite {
  /** URL racine du site officiel. */
  url: string;
  /** Libellé court du domaine, affiché à côté du lien principal. */
  domain: string;
  /** Pages d'atterrissage thématiques du site produit. */
  pages: readonly ProductSiteLink[];
}

const NEXUSRH_URL = 'https://nexusrh.openlabconsulting.com';

export const PRODUCT_SITES: Readonly<
  Partial<Record<ProductSlug, ProductSite>>
> = {
  nexusrh: {
    url: `${NEXUSRH_URL}/`,
    domain: 'nexusrh.openlabconsulting.com',
    pages: [
      {
        label: 'Logiciel de paie Côte d’Ivoire (CNPS, ITS, DISA)',
        href: `${NEXUSRH_URL}/logiciel-paie-cote-divoire`,
      },
      {
        label: 'Gestion des congés en Côte d’Ivoire',
        href: `${NEXUSRH_URL}/gestion-conges-cote-divoire`,
      },
      {
        label: 'Paiement des salaires par Mobile Money',
        href: `${NEXUSRH_URL}/paiement-salaires-mobile-money`,
      },
      {
        label: 'SIRH et paie multi-pays en Afrique de l’Ouest',
        href: `${NEXUSRH_URL}/sirh-afrique-ouest`,
      },
      {
        label: 'Logiciel de paie au Sénégal (IPRES, CSS)',
        href: `${NEXUSRH_URL}/logiciel-paie-senegal`,
      },
    ],
  },
};

/** Site officiel d'un produit, ou `null` s'il n'en a pas. */
export function productSiteFor(productSlug: string): ProductSite | null {
  return PRODUCT_SITES[productSlug as ProductSlug] ?? null;
}
