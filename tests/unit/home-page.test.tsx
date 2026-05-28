import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// CasesCarouselServer est un async Server Component qui interroge Payload.
// Pour le test unitaire de HomePage, on le remplace par un mock sync qui
// délègue au client CasesCarousel (qui utilise déjà FALLBACK_CASE_STUDIES
// par défaut). Le binding réel Payload est couvert par case-studies.test.ts.
vi.mock('@/components/sections/CasesCarouselServer', async () => {
  const { CasesCarousel } = await import('@/components/sections/CasesCarousel');
  return { CasesCarouselServer: () => <CasesCarousel /> };
});

// SolutionsServer : même pattern, on délègue au composant sync `Solutions`
// qui utilise FALLBACK_PRODUCTS par défaut. Le binding réel Payload est
// couvert par products-server-*.test.ts.
vi.mock('@/components/sections/SolutionsServer', async () => {
  const { Solutions } = await import('@/components/sections/Solutions');
  return { SolutionsServer: () => <Solutions /> };
});

// InsightsServer : même pattern qu'au-dessus, on délègue au composant
// sync `Insights` qui utilise FALLBACK_ARTICLES par défaut.
vi.mock('@/components/sections/InsightsServer', async () => {
  const { Insights } = await import('@/components/sections/Insights');
  return { InsightsServer: () => <Insights /> };
});

// AuditIaCtaServer : même pattern (async server component → mock sync).
vi.mock('@/components/sections/AuditIaCtaServer', async () => {
  const { AuditIaCta } = await import('@/components/sections/AuditIaCta');
  return { AuditIaCtaServer: () => <AuditIaCta /> };
});

import HomePage from '@/app/(site)/page';

describe('HomePage (P2 — homepage §6)', () => {
  it('rend le Hero comme première section', async () => {
    render(await HomePage());
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('rend Reassurance juste après le Hero', async () => {
    render(await HomePage());
    expect(screen.getByTestId('reassurance')).toBeInTheDocument();
  });

  it('rend Expertises après Reassurance', async () => {
    render(await HomePage());
    expect(screen.getByTestId('expertises')).toBeInTheDocument();
  });

  it('rend Laboratoire après Expertises', async () => {
    render(await HomePage());
    expect(screen.getByTestId('laboratoire')).toBeInTheDocument();
  });

  it('rend CasesCarousel après Laboratoire', async () => {
    render(await HomePage());
    expect(screen.getByTestId('cases-carousel')).toBeInTheDocument();
  });

  it('rend Solutions après CasesCarousel', async () => {
    render(await HomePage());
    expect(screen.getByTestId('solutions')).toBeInTheDocument();
  });

  it('rend Manifesto après Solutions', async () => {
    render(await HomePage());
    expect(screen.getByTestId('manifesto')).toBeInTheDocument();
  });

  it('rend Livre après Manifesto', async () => {
    render(await HomePage());
    expect(screen.getByTestId('livre')).toBeInTheDocument();
  });

  it('rend Insights après Livre', async () => {
    render(await HomePage());
    expect(screen.getByTestId('insights')).toBeInTheDocument();
  });

  it('rend AuditIaCta après Insights (dernière section homepage)', async () => {
    render(await HomePage());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });

  it('respecte l’ordre complet des 10 sections de la homepage §6', async () => {
    render(await HomePage());
    const sections = [
      screen.getByTestId('hero'),
      screen.getByTestId('reassurance'),
      screen.getByTestId('expertises'),
      screen.getByTestId('laboratoire'),
      screen.getByTestId('cases-carousel'),
      screen.getByTestId('solutions'),
      screen.getByTestId('manifesto'),
      screen.getByTestId('livre'),
      screen.getByTestId('insights'),
      screen.getByTestId('audit-ia-cta'),
    ];
    for (let i = 0; i < sections.length - 1; i++) {
      expect(
        sections[i]!.compareDocumentPosition(sections[i + 1]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('expose un seul h1 (le titre du Hero)', async () => {
    render(await HomePage());
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toMatch(/L’IA, au service/);
  });

  it('le main porte l’ancre #main pour le skip-link', async () => {
    render(await HomePage());
    expect(screen.getByRole('main').id).toBe('main');
  });
});
