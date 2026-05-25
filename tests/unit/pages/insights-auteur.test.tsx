import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuthorArchivePage, {
  generateMetadata,
} from '@/app/(site)/insights/auteur/[author]/page';

describe('auteur — generateMetadata', () => {
  it('décode le nom de l’auteur depuis le slug', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ author: 'debora-ahouma' }),
    });
    expect(String(meta.title)).toContain('debora ahouma');
    expect(meta.alternates?.canonical).toBe('/insights/auteur/debora-ahouma');
  });
});

describe('Page /insights/auteur/[author]', () => {
  it('rend un h1 mentionnant le nom de l’auteur (décodé du slug)', async () => {
    const params = Promise.resolve({ author: 'debora-ahouma' });
    render(await AuthorArchivePage({ params }));
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/debora ahouma/i);
  });

  it('expose un lien retour vers /insights', async () => {
    const params = Promise.resolve({ author: 'debora-ahouma' });
    render(await AuthorArchivePage({ params }));
    const back = screen.getByRole('link', { name: /Tous les insights/i });
    expect(back.getAttribute('href')).toBe('/insights');
  });

  it('affiche un état vide pour un auteur inexistant', async () => {
    const params = Promise.resolve({ author: 'auteur-inexistant-xyz' });
    render(await AuthorArchivePage({ params }));
    expect(screen.getByText(/Aucun article trouvé/i)).toBeInTheDocument();
  });

  it('inclut la section AuditIaCta', async () => {
    const params = Promise.resolve({ author: 'debora-ahouma' });
    render(await AuthorArchivePage({ params }));
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
