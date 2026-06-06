import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LaboratoirePublicationsPage from '@/app/(site)/laboratoire/publications/page';
import { PUBLICATIONS } from '@/lib/data/laboratoire';

describe('Page /laboratoire/publications', () => {
  it('rend un h1 mentionnant « publions »', async () => {
    render(await LaboratoirePublicationsPage());
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/publions/i);
  });

  it('liste toutes les publications du dataset', async () => {
    render(await LaboratoirePublicationsPage());
    for (const pub of PUBLICATIONS) {
      expect(screen.getByText(pub.title)).toBeInTheDocument();
    }
  });

  it('expose un lien retour vers /laboratoire', async () => {
    render(await LaboratoirePublicationsPage());
    const backLink = screen.getByRole('link', { name: /Hub Laboratoire/i });
    expect(backLink.getAttribute('href')).toBe('/laboratoire');
  });

  it('marque les liens externes avec target=_blank rel=noopener', async () => {
    render(await LaboratoirePublicationsPage());
    const externalPub = PUBLICATIONS.find((p) => p.href.startsWith('http'));
    if (!externalPub) return;
    const links = screen.getAllByRole('link', { name: /Ouvrir/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]?.getAttribute('target')).toBe('_blank');
    expect(links[0]?.getAttribute('rel')).toContain('noopener');
  });

  it('émet un JSON-LD ItemList des publications', async () => {
    const { container } = render(await LaboratoirePublicationsPage());
    const scripts = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]'),
    );
    expect(scripts.some((s) => s.textContent?.includes('"ItemList"'))).toBe(
      true,
    );
  });
});
