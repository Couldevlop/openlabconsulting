import type { ProductSlug } from './products';

/**
 * Maillage interne curé produit ↔ article (SEO §12.5 : 3-5 liens internes
 * par page, clusters thématiques). Source statique, **client-safe** (aucun
 * import runtime Payload) : sert de référentiel de relations éditoriales.
 *
 * Choix assumé : relation curée plutôt qu'un champ `relationship` Payload,
 * pour éviter une migration DB tant que la chaîne de migrations reste
 * écrite à la main. À promouvoir vers un champ `Articles.relatedProduct`
 * éditable en admin dans un lot ultérieur (migration additive requise).
 *
 * Clé = slug produit ; valeur = slugs d'articles publiés, par priorité.
 * Les slugs d'articles correspondent aux seeds (`scripts/seed-article-*`)
 * et au fallback (`lib/articles.ts`).
 */
export const PRODUCT_ARTICLE_LINKS: Readonly<
  Partial<Record<ProductSlug, readonly string[]>>
> = {
  sentinelbtp: ['sentinelbtp-ia-securite-batiments-cote-divoire'],
  agrosense: ['eudr-cacao-tracabilite-zero-deforestation-cote-divoire'],
  nexuserp: ['erp-syscohada-pme-uemoa-exigences'],
  nexusrh: ['cnps-its-fdfp-conformite-sirh-ivoirien'],
  'fraud-shield': ['fraude-documentaire-ia-banques-assurances'],
} as const;

/** Slugs d'articles liés à un produit (ordre = priorité). [] si aucun. */
export function articleSlugsForProduct(productSlug: string): readonly string[] {
  return PRODUCT_ARTICLE_LINKS[productSlug as ProductSlug] ?? [];
}

/**
 * Produit lié à un article (relation inverse), ou `null`. Premier produit
 * dont la liste contient ce slug d'article — un article ne pointe que vers
 * un produit principal dans ce maillage.
 */
export function productSlugForArticle(articleSlug: string): ProductSlug | null {
  for (const [productSlug, articleSlugs] of Object.entries(
    PRODUCT_ARTICLE_LINKS,
  )) {
    if (articleSlugs?.includes(articleSlug)) {
      return productSlug as ProductSlug;
    }
  }
  return null;
}
