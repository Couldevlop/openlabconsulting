import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LivreLandingPage from '@/app/livre/page';
import LivreChapitresPage from '@/app/livre/chapitres/page';
import LivreExtraitsPage from '@/app/livre/extraits/page';
import LivreAcheterPage from '@/app/livre/acheter/page';
import LivreCompanionPage from '@/app/livre/companion/page';
import { CHAPTERS } from '@/lib/data/book';

describe('Page /livre (landing)', () => {
  // P10 : la page est devenue async (récupère le nonce CSP via headers()).
  // On `await LivreLandingPage()` avant `render`.
  it('rend un h1 avec le titre du livre', async () => {
    render(await LivreLandingPage());
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Intelligence Artificielle');
  });

  it('liste les 4 audiences (cards dédiées)', async () => {
    render(await LivreLandingPage());
    const audiencesSection = screen.getByRole('region', {
      name: /Quatre publics, une lecture différente/i,
    });
    expect(
      within(audiencesSection).getByText('Étudiants ingénieurs'),
    ).toBeInTheDocument();
    expect(
      within(audiencesSection).getByText('Data scientists confirmés'),
    ).toBeInTheDocument();
    expect(
      within(audiencesSection).getByText('Dirigeants'),
    ).toBeInTheDocument();
    expect(
      within(audiencesSection).getByText('Enseignants'),
    ).toBeInTheDocument();
  });

  it('expose 4 portes d’entrée vers les sous-pages livre', async () => {
    render(await LivreLandingPage());
    const links = screen.getAllByRole('link');
    const livreLinks = links
      .map((l) => l.getAttribute('href'))
      .filter((h): h is string => h !== null && h.startsWith('/livre/'));
    expect(livreLinks).toEqual(
      expect.arrayContaining([
        '/livre/chapitres',
        '/livre/extraits',
        '/livre/acheter',
        '/livre/companion',
      ]),
    );
  });

  it('intègre AuditIaCta en bas', async () => {
    render(await LivreLandingPage());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});

describe('Page /livre/chapitres', () => {
  it('rend les 11 chapitres dans une <ol> (enfants directs)', () => {
    render(<LivreChapitresPage />);
    const lists = screen.getAllByRole('list');
    const ol = lists.find((l) => l.tagName === 'OL');
    expect(ol).toBeDefined();
    // Compter uniquement les enfants directs (les keywords sont
    // des <ul> imbriqués dans chaque chapitre).
    const directItems = Array.from(ol!.children).filter(
      (c) => c.tagName === 'LI',
    );
    expect(directItems).toHaveLength(CHAPTERS.length);
  });

  it('chaque chapitre affiche son titre et son numéro', () => {
    render(<LivreChapitresPage />);
    for (const c of CHAPTERS) {
      expect(screen.getByText(c.title)).toBeInTheDocument();
      expect(screen.getAllByText(c.index).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('lien retour vers /livre', () => {
    render(<LivreChapitresPage />);
    expect(
      screen.getByRole('link', { name: /Page du livre/i }),
    ).toHaveAttribute('href', '/livre');
  });
});

describe('Page /livre/extraits', () => {
  it('rend la préface intégrale', () => {
    render(<LivreExtraitsPage />);
    expect(screen.getByText(/Pendant trente ans/i)).toBeInTheDocument();
    expect(screen.getByText(/Debora Ahouma/i)).toBeInTheDocument();
  });

  it('expose un formulaire email pour le PDF gratuit', () => {
    render(<LivreExtraitsPage />);
    const form = screen.getByRole('form', {
      name: /Recevoir l’extrait gratuit/i,
    });
    expect(form.getAttribute('method')).toBe('get');
    // L'input email est scoped au form pour éviter la collision avec
    // celui de AuditIaCta présent en bas de page.
    const emailInput = within(form).getByLabelText(
      /Adresse e-mail professionnelle/i,
    );
    expect(emailInput.getAttribute('type')).toBe('email');
  });

  it('CTA vers /livre/acheter en bas', () => {
    render(<LivreExtraitsPage />);
    expect(
      screen.getByRole('link', { name: /Acheter le livre complet/i }),
    ).toHaveAttribute('href', '/livre/acheter');
  });
});

describe('Page /livre/acheter', () => {
  it('met en avant le bouquet OpenLab direct (primaire)', () => {
    render(<LivreAcheterPage />);
    expect(screen.getByText(/Recommandé/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bouquet OpenLab — PDF \+ ePub direct/i),
    ).toBeInTheDocument();
  });

  it('liste les 3 canaux secondaires', () => {
    render(<LivreAcheterPage />);
    expect(screen.getByText(/Amazon France & Afrique/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Lulu \(impression à la demande\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Librairies de Côte d’Ivoire/i),
    ).toBeInTheDocument();
  });

  it('liste les librairies physiques ivoiriennes', () => {
    render(<LivreAcheterPage />);
    // Les noms apparaissent à la fois dans la description du channel
    // "Librairies de Côte d'Ivoire" et dans la section ancrée
    // #libraires-ci — on accepte plusieurs occurrences mais on
    // vérifie qu'elles existent.
    expect(screen.getAllByText(/Carrefour Mercure/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Librairie de France/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/Librairie Aleph/i).length).toBeGreaterThan(0);
  });
});

describe('Page /livre/companion', () => {
  it('liste 4 ressources companion (code, data, errata, community)', () => {
    render(<LivreCompanionPage />);
    expect(
      screen.getByText(/Référentiel GitHub des exemples/i),
    ).toBeInTheDocument();
    // "Datasets ouverts" apparaît dans la card + dans la section ancrée
    // #datasets — on accepte plusieurs occurrences.
    expect(screen.getAllByText(/Datasets ouverts/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Errata et corrections continues/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Forum lecteurs/i)).toBeInTheDocument();
  });

  it('décrit les 3 sources climatiques (CHIRPS, ERA5, SODEXAM)', () => {
    render(<LivreCompanionPage />);
    expect(screen.getByText(/^CHIRPS$/)).toBeInTheDocument();
    expect(screen.getByText(/^ERA5$/)).toBeInTheDocument();
    expect(screen.getByText(/^SODEXAM$/)).toBeInTheDocument();
  });
});
