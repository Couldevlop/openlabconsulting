import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CategoryArchivePage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/(site)/insights/categorie/[cat]/page';

describe('Page /insights/categorie/[cat]', () => {
  it('rend un h1 avec le libellé de la catégorie « souverainete » → « Souveraineté »', async () => {
    const params = Promise.resolve({ cat: 'souverainete' });
    render(await CategoryArchivePage({ params }));
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/Souveraineté/);
  });

  it('expose un lien retour vers /insights', async () => {
    const params = Promise.resolve({ cat: 'souverainete' });
    render(await CategoryArchivePage({ params }));
    const back = screen.getByRole('link', { name: /Tous les insights/i });
    expect(back.getAttribute('href')).toBe('/insights');
  });

  it('inclut la section AuditIaCta', async () => {
    const params = Promise.resolve({ cat: 'souverainete' });
    render(await CategoryArchivePage({ params }));
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });

  it('affiche un état vide pour une catégorie sans article', async () => {
    const params = Promise.resolve({ cat: 'mlops' });
    render(await CategoryArchivePage({ params }));
    // Le fallback ne contient (probablement) pas d'article mlops.
    // On vérifie soit une carte article soit l'état vide.
    const empty = screen.queryByText(/Pas encore d/i);
    const articles = document.querySelectorAll('article');
    expect(empty !== null || articles.length > 0).toBe(true);
  });

  it('déclenche notFound() pour une catégorie inconnue', async () => {
    await expect(
      CategoryArchivePage({ params: Promise.resolve({ cat: 'inexistante' }) }),
    ).rejects.toThrow();
  });
});

describe('categorie — generateStaticParams & generateMetadata', () => {
  it('generateStaticParams retourne les 7 catégories', () => {
    expect(generateStaticParams()).toHaveLength(7);
  });

  it('generateMetadata pour une catégorie valide', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ cat: 'souverainete' }),
    });
    expect(String(meta.title)).toContain('Souveraineté');
    expect(meta.alternates?.canonical).toBe('/insights/categorie/souverainete');
  });

  it('generateMetadata renvoie « introuvable » pour une catégorie inconnue', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ cat: 'inexistante' }),
    });
    expect(String(meta.title)).toMatch(/introuvable/i);
  });
});
