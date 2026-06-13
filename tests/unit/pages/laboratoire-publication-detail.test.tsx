import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// AuditIaCtaServer (async) → mock par le composant sync.
vi.mock('@/components/sections/AuditIaCtaServer', async () => {
  const { AuditIaCta } = await import('@/components/sections/AuditIaCta');
  return { AuditIaCtaServer: () => <AuditIaCta /> };
});

import PublicationDetailPage, {
  generateStaticParams,
} from '@/app/(site)/laboratoire/publications/[slug]/page';
import { PUBLICATIONS } from '@/lib/data/laboratoire';

const SLUGGED = PUBLICATIONS.filter((p) => p.slug);

describe('Page /laboratoire/publications/[slug]', () => {
  it('generateStaticParams ne retourne que les publications avec slug', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(SLUGGED.length);
    for (const p of SLUGGED) {
      expect(params.map((x) => x.slug)).toContain(p.slug);
    }
  });

  it('rend le titre, le résumé et un fil d’Ariane', async () => {
    const slug = SLUGGED[0]!.slug!;
    render(await PublicationDetailPage({ params: Promise.resolve({ slug }) }));
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(SLUGGED[0]!.title);
    expect(
      screen.getByRole('link', { name: /Toutes les publications/i }),
    ).toHaveAttribute('href', '/laboratoire/publications');
  });

  it('émet un JSON-LD pour la publication', async () => {
    const slug = SLUGGED[0]!.slug!;
    const { container } = render(
      await PublicationDetailPage({ params: Promise.resolve({ slug }) }),
    );
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const text = Array.from(scripts)
      .map((s) => s.textContent ?? '')
      .join('');
    expect(text).toContain(SLUGGED[0]!.title);
    expect(text).toContain('"BreadcrumbList"');
  });
});
