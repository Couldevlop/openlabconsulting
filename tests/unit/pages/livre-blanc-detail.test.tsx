import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WhitepaperPage from '@/app/livres-blancs/[slug]/page';

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

  it('expose le formulaire de demande de téléchargement', async () => {
    const params = Promise.resolve({ slug: 'ia-souveraine-ci-2026' });
    render(await WhitepaperPage({ params }));
    expect(
      screen.getByRole('form', { name: /Recevoir le livre blanc par e-mail/i }),
    ).toBeInTheDocument();
  });

  it('throw notFound() pour un slug inconnu', async () => {
    const params = Promise.resolve({ slug: 'slug-inexistant-xyz' });
    // notFound() throw une erreur Next interne ; on s'assure que le render échoue.
    await expect(WhitepaperPage({ params })).rejects.toThrow();
  });

  it('generateStaticParams retourne au moins un slug', async () => {
    const mod = await import('@/app/livres-blancs/[slug]/page');
    const params = mod.generateStaticParams();
    expect(params.length).toBeGreaterThan(0);
    expect(params[0]?.slug).toBe('ia-souveraine-ci-2026');
  });
});
