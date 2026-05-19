import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExpertisesHubPage from '@/app/expertises/page';

describe('Page /expertises (hub)', () => {
  it('rend un h1 unique avec le titre du hub', () => {
    render(<ExpertisesHubPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toMatch(/Quatre expertises/);
  });

  it('liste les 4 expertises avec lien vers la page détail', () => {
    render(<ExpertisesHubPage />);
    const links = screen.getAllByRole('link');
    const expertiseLinks = links.filter((l) =>
      l.getAttribute('href')?.startsWith('/expertises/'),
    );
    expect(expertiseLinks).toHaveLength(4);

    const hrefs = expertiseLinks.map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/expertises/conseil-strategie',
        '/expertises/agents-automatisation',
        '/expertises/data-gouvernance',
        '/expertises/cybersecurite-ia',
      ]),
    );
  });

  it('intègre la section AuditIaCta en bas', () => {
    render(<ExpertisesHubPage />);
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });

  it('chaque card hub affiche 3 compétences prioritaires', () => {
    render(<ExpertisesHubPage />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(4);
    for (const article of articles) {
      const list = within(article).getByRole('list');
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    }
  });
});
