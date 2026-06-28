import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WhitepaperThanksPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/(site)/livres-blancs/[slug]/merci/page';

// `notFound()` est mocké globalement dans vitest.setup.ts en *levant*
// une erreur (digest NEXT_NOT_FOUND), fidèle à la sémantique Next : le
// rendu s'interrompt. Le test « slug inconnu » asserte donc le rejet.

describe('Page /livres-blancs/[slug]/merci', () => {
  it('rend la page de remerciement pour le slug connu', async () => {
    const ui = await WhitepaperThanksPage({
      params: Promise.resolve({ slug: 'ia-souveraine-ci-2026' }),
    });
    render(ui);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Merci. Votre PDF est prêt/i,
    );
    expect(
      screen.getByText(/L.IA souveraine en Côte d.Ivoire/i),
    ).toBeInTheDocument();
    const downloadLink = screen.getByRole('link', {
      name: /Télécharger le PDF/i,
    });
    expect(downloadLink).toHaveAttribute(
      'href',
      '/whitepapers/ia-souveraine-ci-2026.pdf',
    );
  });

  it('expose le retour vers la page du livre blanc', async () => {
    const ui = await WhitepaperThanksPage({
      params: Promise.resolve({ slug: 'ia-souveraine-ci-2026' }),
    });
    render(ui);
    const back = screen.getByRole('link', { name: /Page du livre blanc/i });
    expect(back).toHaveAttribute(
      'href',
      '/livres-blancs/ia-souveraine-ci-2026',
    );
  });

  it('expose les CTA croisés vers /audit-ia et /laboratoire/publications', async () => {
    const ui = await WhitepaperThanksPage({
      params: Promise.resolve({ slug: 'ia-souveraine-ci-2026' }),
    });
    render(ui);
    expect(
      screen.getByRole('link', { name: /Demander un audit IA gratuit/i }),
    ).toHaveAttribute('href', '/audit-ia');
    expect(
      screen.getByRole('link', { name: /Voir toutes les publications/i }),
    ).toHaveAttribute('href', '/laboratoire/publications');
  });

  it('throw notFound() pour un slug inconnu', async () => {
    await expect(
      WhitepaperThanksPage({
        params: Promise.resolve({ slug: 'inexistant' }),
      }),
    ).rejects.toThrow();
  });

  it('generateStaticParams retourne le slug whitelisté', () => {
    const params = generateStaticParams();
    expect(params).toContainEqual({ slug: 'ia-souveraine-ci-2026' });
  });

  it('generateMetadata renvoie title + canonical + robots noindex pour slug connu', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'ia-souveraine-ci-2026' }),
    });
    expect(meta.title).toMatch(/Merci/);
    expect(meta.alternates?.canonical).toBe(
      '/livres-blancs/ia-souveraine-ci-2026/merci',
    );
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it('generateMetadata renvoie title fallback pour slug inconnu', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'inconnu' }),
    });
    expect(meta.title).toBe('Livre blanc : Merci');
  });
});
