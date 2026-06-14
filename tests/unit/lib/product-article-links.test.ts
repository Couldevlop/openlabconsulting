import { describe, it, expect } from 'vitest';
import {
  PRODUCT_ARTICLE_LINKS,
  articleSlugsForProduct,
  productSlugForArticle,
} from '@/lib/data/product-article-links';
import { PRODUCTS } from '@/lib/data/products';
import { FALLBACK_ARTICLES } from '@/lib/articles';
import { getArticlesForProduct } from '@/lib/articles-server';

describe('lib/data/product-article-links — référentiel curé', () => {
  it('ne référence que des slugs produits valides', () => {
    const valid = new Set(PRODUCTS.map((p) => p.slug));
    for (const slug of Object.keys(PRODUCT_ARTICLE_LINKS)) {
      expect(valid.has(slug)).toBe(true);
    }
  });

  it('articleSlugsForProduct renvoie les articles liés, [] si aucun', () => {
    expect(articleSlugsForProduct('sentinelbtp')).toContain(
      'sentinelbtp-ia-securite-batiments-cote-divoire',
    );
    expect(articleSlugsForProduct('smart-city')).toEqual([]);
    expect(articleSlugsForProduct('inconnu')).toEqual([]);
  });

  it('productSlugForArticle fait la relation inverse', () => {
    expect(
      productSlugForArticle(
        'eudr-cacao-tracabilite-zero-deforestation-cote-divoire',
      ),
    ).toBe('agrosense');
    expect(productSlugForArticle('erp-syscohada-pme-uemoa-exigences')).toBe(
      'nexuserp',
    );
    expect(productSlugForArticle('article-orphelin')).toBeNull();
  });

  it('les deux directions sont cohérentes (aller-retour)', () => {
    for (const [productSlug, articleSlugs] of Object.entries(
      PRODUCT_ARTICLE_LINKS,
    )) {
      for (const articleSlug of articleSlugs ?? []) {
        expect(productSlugForArticle(articleSlug)).toBe(productSlug);
      }
    }
  });
});

describe('getArticlesForProduct — fallback (Payload indisponible)', () => {
  it('filtre les FALLBACK_ARTICLES par les slugs liés', async () => {
    // nexusrh → article CNPS présent dans le fallback codé.
    const r = await getArticlesForProduct('nexusrh', 3);
    expect(r.map((a) => a.slug)).toEqual([
      'cnps-its-fdfp-conformite-sirh-ivoirien',
    ]);
    expect(FALLBACK_ARTICLES.some((a) => a.slug === r[0]?.slug)).toBe(true);
  });

  it('renvoie [] pour un produit sans article lié', async () => {
    expect(await getArticlesForProduct('qualitos', 3)).toEqual([]);
  });
});
