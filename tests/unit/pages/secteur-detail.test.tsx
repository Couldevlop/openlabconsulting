import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/sections/AuditIaCtaServer', async () => {
  const { AuditIaCta } = await import('@/components/sections/AuditIaCta');
  return { AuditIaCtaServer: () => <AuditIaCta /> };
});

import SecteurDetailPage, {
  generateStaticParams,
} from '@/app/(site)/secteurs/[slug]/page';
import { SECTORS } from '@/lib/data/sectors';

describe('Page /secteurs/[slug] (détail)', () => {
  it('generateStaticParams retourne les 5 slugs', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(5);
    const slugs = params.map((p) => p.slug);
    for (const s of SECTORS) {
      expect(slugs).toContain(s.slug);
    }
  });

  it.each(SECTORS.map((s) => s.slug))(
    'rend la page détail pour "%s"',
    async (slug) => {
      const element = await SecteurDetailPage({
        params: Promise.resolve({ slug }),
      });
      render(element);

      const sector = SECTORS.find((s) => s.slug === slug)!;
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent).toBe(sector.name);

      expect(
        screen.getByRole('link', { name: /Tous les secteurs/i }),
      ).toHaveAttribute('href', '/secteurs');

      // Enjeux : tous affichés
      for (const e of sector.enjeux) {
        expect(screen.getByText(e)).toBeInTheDocument();
      }

      // Cadre réglementaire : toutes les entrées
      for (const r of sector.regulation) {
        expect(screen.getByText(r)).toBeInTheDocument();
      }

      // Produits liés : cross-link /solutions/<slug>
      for (const p of sector.produitsLies) {
        const link = screen.getByRole('link', {
          name: new RegExp(p.title, 'i'),
        });
        expect(link.getAttribute('href')).toBe(`/solutions/${p.slug}`);
      }

      // Expertises liées : cross-link /expertises/<slug>
      for (const e of sector.expertisesLies) {
        const link = screen.getByRole('link', {
          name: new RegExp(e.title, 'i'),
        });
        expect(link.getAttribute('href')).toBe(`/expertises/${e.slug}`);
      }

      expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
    },
  );
});
