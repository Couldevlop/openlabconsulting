import { describe, it, expect } from 'vitest';
import {
  CATEGORY_LABELS,
  FALLBACK_ARTICLES,
  formatArticleDate,
} from '@/lib/articles';
import { getArticleBySlug, getPublishedArticles } from '@/lib/articles-server';

describe('lib/articles — FALLBACK_ARTICLES', () => {
  it('expose 3 articles fondateurs', () => {
    expect(FALLBACK_ARTICLES).toHaveLength(3);
  });

  it('chaque article a une catégorie valide et un slug unique', () => {
    const slugs = new Set<string>();
    for (const a of FALLBACK_ARTICLES) {
      expect(a.category in CATEGORY_LABELS).toBe(true);
      expect(a.categoryLabel).toBe(CATEGORY_LABELS[a.category]);
      expect(slugs.has(a.slug)).toBe(false);
      slugs.add(a.slug);
    }
  });

  it('chaque article a une isoDate parsable', () => {
    for (const a of FALLBACK_ARTICLES) {
      expect(Number.isNaN(new Date(a.isoDate).getTime())).toBe(false);
    }
  });
});

describe('lib/articles — CATEGORY_LABELS', () => {
  it('expose les 7 catégories alignées sur la collection Payload', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(7);
    expect(CATEGORY_LABELS).toEqual(
      expect.objectContaining({
        souverainete: 'Souveraineté',
        'conformite-rh': 'Conformité RH',
        cybersecurite: 'Cybersécurité',
        'data-gouvernance': 'Data & gouvernance',
        'agents-ia': 'Agents & IA',
        mlops: 'MLOps',
        'etude-de-cas': 'Étude de cas',
      }),
    );
  });
});

describe('lib/articles — formatArticleDate', () => {
  it('formate une ISO en « Mois YYYY » FR', () => {
    expect(formatArticleDate('2026-05-01')).toBe('Mai 2026');
    expect(formatArticleDate('2026-12-31')).toBe('Décembre 2026');
  });

  it('renvoie l’input tel quel si non parsable', () => {
    expect(formatArticleDate('pas-une-date')).toBe('pas-une-date');
  });
});

describe('lib/articles-server — fallback paths', () => {
  it('getPublishedArticles retombe sur le fallback quand Payload est indisponible', async () => {
    const articles = await getPublishedArticles(3);
    expect(articles).toEqual(FALLBACK_ARTICLES.slice(0, 3));
  });

  it('getPublishedArticles respecte le paramètre limit', async () => {
    const articles = await getPublishedArticles(2);
    expect(articles).toHaveLength(2);
  });

  it('getArticleBySlug retrouve un article du fallback', async () => {
    const a = await getArticleBySlug('migration-ia-souveraine-k3s-hetzner');
    expect(a).not.toBeNull();
    expect(a?.title).toContain('IA souveraine');
  });

  it('getArticleBySlug retourne null pour un slug inconnu', async () => {
    const a = await getArticleBySlug('article-qui-nexiste-pas');
    expect(a).toBeNull();
  });
});
