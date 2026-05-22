import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/sections/AuditIaCtaServer', async () => {
  const { AuditIaCta } = await import('@/components/sections/AuditIaCta');
  return { AuditIaCtaServer: () => <AuditIaCta /> };
});

import InsightArticlePage from '@/app/(site)/insights/[slug]/page';

describe('Page /insights/[slug]', () => {
  it('rend l’article fallback « migration-ia-souveraine-k3s-hetzner »', async () => {
    const params = Promise.resolve({
      slug: 'migration-ia-souveraine-k3s-hetzner',
    });
    render(await InsightArticlePage({ params }));
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/IA souveraine/i);
  });

  it('expose un lien retour vers /insights', async () => {
    const params = Promise.resolve({
      slug: 'migration-ia-souveraine-k3s-hetzner',
    });
    render(await InsightArticlePage({ params }));
    const back = screen.getByRole('link', { name: /Tous les insights/i });
    expect(back.getAttribute('href')).toBe('/insights');
  });

  it('expose le fil d’Ariane (breadcrumbs)', async () => {
    const params = Promise.resolve({
      slug: 'migration-ia-souveraine-k3s-hetzner',
    });
    render(await InsightArticlePage({ params }));
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('inclut la section AuditIaCta', async () => {
    const params = Promise.resolve({
      slug: 'migration-ia-souveraine-k3s-hetzner',
    });
    render(await InsightArticlePage({ params }));
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
