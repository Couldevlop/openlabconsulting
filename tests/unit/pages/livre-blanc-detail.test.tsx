import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WhitepaperPage from '@/app/(site)/livres-blancs/[slug]/page';

describe('Page /livres-blancs/[slug]', () => {
  it('rend la fiche pour le slug connu « ia-souveraine-ci-2026 »', async () => {
    const params = Promise.resolve({ slug: 'ia-souveraine-ci-2026' });
    render(await WhitepaperPage({ params }));
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/IA souveraine/i);
  });

  it('expose un lien retour vers /audit-ia', async () => {
    const params = Promise.resolve({ slug: 'ia-souveraine-ci-2026' });
    render(await WhitepaperPage({ params }));
    const back = screen.getByRole('link', { name: /Page audit IA/i });
    expect(back.getAttribute('href')).toBe('/audit-ia');
  });

  it('expose un CTA « être prévenu » vers le contact (livre blanc à paraître)', async () => {
    const params = Promise.resolve({ slug: 'ia-souveraine-ci-2026' });
    render(await WhitepaperPage({ params }));
    const cta = screen.getByRole('link', { name: /Être prévenu.*sortie/i });
    expect(cta.getAttribute('href')).toBe(
      '/contact?sujet=livre-blanc-ia-souveraine-ci-2026',
    );
  });

  it('throw notFound() pour un slug inconnu', async () => {
    const params = Promise.resolve({ slug: 'slug-inexistant-xyz' });
    // notFound() throw une erreur Next interne ; on s'assure que le render échoue.
    await expect(WhitepaperPage({ params })).rejects.toThrow();
  });

  it('generateStaticParams retourne au moins un slug', async () => {
    const mod = await import('@/app/(site)/livres-blancs/[slug]/page');
    const params = mod.generateStaticParams();
    expect(params.length).toBeGreaterThan(0);
    expect(params[0]?.slug).toBe('ia-souveraine-ci-2026');
  });
});
