import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SecteursHubPage from '@/app/(site)/secteurs/page';
import { SECTORS } from '@/lib/data/sectors';

// La page hub est un Server Component async : en test (sans DB) le helper
// `getPublishedSectors` retombe sur le fallback hard-codé (SECTORS).
describe('Page /secteurs (hub)', () => {
  it('rend un h1 unique avec le titre du hub', async () => {
    render(await SecteursHubPage());
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toMatch(/Cinq secteurs/);
  });

  it('liste les 5 secteurs avec lien vers la page détail', async () => {
    render(await SecteursHubPage());
    const sectorLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/secteurs/'));
    expect(sectorLinks).toHaveLength(5);
    const hrefs = sectorLinks.map((l) => l.getAttribute('href'));
    for (const s of SECTORS) {
      expect(hrefs).toContain(`/secteurs/${s.slug}`);
    }
  });

  it('chaque card hub liste 3 enjeux prioritaires', async () => {
    render(await SecteursHubPage());
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(5);
    for (const article of articles) {
      const list = within(article).getByRole('list');
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    }
  });

  it('intègre AuditIaCta en bas', async () => {
    render(await SecteursHubPage());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
