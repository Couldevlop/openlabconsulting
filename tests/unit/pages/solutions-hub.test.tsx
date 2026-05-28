import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SolutionsHubPage from '@/app/(site)/solutions/page';
import { PRODUCTS } from '@/lib/data/products';

// La page hub est un Server Component async : en test (sans DB) le helper
// `getPublishedProducts` retombe sur le fallback hard-codé (PRODUCTS).
describe('Page /solutions (hub)', () => {
  it('rend un h1 unique avec le titre du hub', async () => {
    render(await SolutionsHubPage());
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toMatch(/Sept logiciels propriétaires/);
  });

  it('liste les 7 produits avec lien vers la page détail', async () => {
    render(await SolutionsHubPage());
    const productLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/solutions/'));
    expect(productLinks).toHaveLength(7);

    const hrefs = productLinks.map((l) => l.getAttribute('href'));
    for (const p of PRODUCTS) {
      expect(hrefs).toContain(`/solutions/${p.slug}`);
    }
  });

  it('chaque card affiche son badge de statut', async () => {
    render(await SolutionsHubPage());
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(7);
    for (const p of PRODUCTS) {
      const article = articles.find((a) => a.textContent?.includes(p.name));
      expect(article).toBeDefined();
      expect(within(article!).getByText(p.statusLabel)).toBeInTheDocument();
    }
  });

  it('intègre AuditIaCta en bas', async () => {
    render(await SolutionsHubPage());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
