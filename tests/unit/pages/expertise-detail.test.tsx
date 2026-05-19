import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExpertiseDetailPage, {
  generateStaticParams,
} from '@/app/expertises/[slug]/page';
import { EXPERTISES } from '@/lib/data/expertises';

describe('Page /expertises/[slug] (détail)', () => {
  it('generateStaticParams retourne les 4 slugs', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(4);
    const slugs = params.map((p) => p.slug);
    expect(slugs.sort()).toEqual(
      [
        'agents-automatisation',
        'conseil-strategie',
        'cybersecurite-ia',
        'data-gouvernance',
      ].sort(),
    );
  });

  it.each(EXPERTISES.map((e) => e.slug))(
    'rend la page détail pour "%s"',
    async (slug) => {
      const element = await ExpertiseDetailPage({
        params: Promise.resolve({ slug }),
      });
      render(element);

      const expertise = EXPERTISES.find((e) => e.slug === slug)!;
      // H1 = titre de l'expertise
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent).toBe(expertise.title);

      // Lien retour
      expect(
        screen.getByRole('link', { name: /Toutes les expertises/i }),
      ).toHaveAttribute('href', '/expertises');

      // Section compétences : toutes affichées
      for (const c of expertise.competences) {
        expect(screen.getByText(c)).toBeInTheDocument();
      }

      // 3 étapes d'approche
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('03')).toBeInTheDocument();

      // Produits liés : chacun avec lien /solutions/<slug>
      for (const p of expertise.produitsLies) {
        const link = screen.getByRole('link', {
          name: new RegExp(p.name, 'i'),
        });
        expect(link.getAttribute('href')).toBe(`/solutions/${p.slug}`);
      }

      // Cross-sell : les 3 autres expertises listées
      const crossLinks = screen
        .getAllByRole('link')
        .filter(
          (l) =>
            l.getAttribute('href')?.startsWith('/expertises/') &&
            l.getAttribute('href') !== `/expertises/${slug}`,
        );
      // 3 autres expertises (le lien retour pointe sur /expertises, exclu via le filter)
      const otherSlugs = new Set(crossLinks.map((l) => l.getAttribute('href')));
      expect(otherSlugs.size).toBeGreaterThanOrEqual(3);

      // AuditIaCta présent en bas
      expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
    },
  );
});
