import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SolutionDetailPage, {
  generateStaticParams,
} from '@/app/solutions/[slug]/page';
import { PRODUCTS } from '@/lib/data/products';

describe('Page /solutions/[slug] (détail)', () => {
  it('generateStaticParams retourne les 7 slugs', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(7);
    const slugs = params.map((p) => p.slug);
    for (const p of PRODUCTS) {
      expect(slugs).toContain(p.slug);
    }
  });

  it.each(PRODUCTS.map((p) => p.slug))(
    'rend la page détail pour "%s"',
    async (slug) => {
      const element = await SolutionDetailPage({
        params: Promise.resolve({ slug }),
      });
      render(element);

      const product = PRODUCTS.find((p) => p.slug === slug)!;
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent).toBe(product.name);

      // Lien retour
      expect(
        screen.getByRole('link', { name: /Tous les produits/i }),
      ).toHaveAttribute('href', '/solutions');

      // Features : toutes affichées
      for (const f of product.features) {
        expect(screen.getByText(f.title)).toBeInTheDocument();
      }

      // Stack : lignes affichées
      for (const s of product.stack) {
        expect(screen.getByText(s)).toBeInTheDocument();
      }

      // Expertises liées : cross-link /expertises/<slug>
      for (const e of product.expertisesLies) {
        const link = screen.getByRole('link', {
          name: new RegExp(e.title, 'i'),
        });
        expect(link.getAttribute('href')).toBe(`/expertises/${e.slug}`);
      }

      // AuditIaCta en bas
      expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
    },
  );

  it('SYGESCOM affiche le bandeau preuves (-12 % pertes, ROI)', async () => {
    const element = await SolutionDetailPage({
      params: Promise.resolve({ slug: 'sygescom' }),
    });
    render(element);
    const proofs = screen.getByTestId('solution-proofs');
    expect(proofs).toBeInTheDocument();
    expect(proofs.textContent).toMatch(/−12 %/);
    expect(proofs.textContent).toMatch(/< 3 mois/);
  });

  it('NexusRH n’affiche PAS de bandeau preuves (pas de proofs sourcés)', async () => {
    const element = await SolutionDetailPage({
      params: Promise.resolve({ slug: 'nexusrh' }),
    });
    render(element);
    expect(screen.queryByTestId('solution-proofs')).toBeNull();
  });
});
