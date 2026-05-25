import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InsightsHubPage from '@/app/(site)/insights/page';

describe('Page /insights (hub)', () => {
  it('rend un h1 mentionnant « terrain africain »', async () => {
    render(await InsightsHubPage());
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/terrain africain/i);
  });

  it('affiche au moins une carte d’article (fallback)', async () => {
    render(await InsightsHubPage());
    const articles = document.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('expose les liens vers les articles (au moins un)', async () => {
    render(await InsightsHubPage());
    const links = document.querySelectorAll('a[href^="/insights/"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('inclut la section AuditIaCta', async () => {
    render(await InsightsHubPage());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });

  it('émet un JSON-LD Blog', async () => {
    const { container } = render(await InsightsHubPage());
    const ld = container.querySelector('script[type="application/ld+json"]');
    expect(ld?.textContent).toContain('"Blog"');
  });
});
