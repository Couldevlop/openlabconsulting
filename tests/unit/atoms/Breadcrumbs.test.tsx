import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';

describe('Breadcrumbs atom', () => {
  it('ajoute toujours « Accueil » en premier item', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Solutions', href: '/solutions' },
          { label: 'NexusRH CI' },
        ]}
      />,
    );
    const nav = screen.getByTestId('breadcrumbs');
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(3); // Accueil + 2 fournis
    expect(items[0]?.textContent).toContain('Accueil');
  });

  it('le dernier item porte aria-current="page" et n’est pas un lien', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Solutions', href: '/solutions' },
          { label: 'NexusRH CI' },
        ]}
      />,
    );
    const current = screen.getByText('NexusRH CI');
    expect(current.closest('[aria-current="page"]')).not.toBeNull();
    // Pas dans un <a>
    expect(current.closest('a')).toBeNull();
  });

  it('les items intermédiaires sont des liens', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Solutions', href: '/solutions' },
          { label: 'NexusRH CI' },
        ]}
      />,
    );
    const solutionsLink = screen.getByRole('link', { name: /Solutions/i });
    expect(solutionsLink.getAttribute('href')).toBe('/solutions');
  });

  it('respecte la nav landmark avec aria-label fil d’ariane', () => {
    render(<Breadcrumbs items={[{ label: 'Test' }]} />);
    // Accepte apostrophe ASCII ou typographique selon l'encodage.
    const nav = screen.getByRole('navigation', {
      name: /Fil d['’]Ariane/i,
    });
    expect(nav).toBeInTheDocument();
  });

  it('rend sans conteneur visuel quand contained=false', () => {
    const { container } = render(
      <Breadcrumbs items={[{ label: 'Test' }]} contained={false} />,
    );
    expect(
      container.querySelector('[data-testid="breadcrumbs-container"]'),
    ).toBeNull();
  });
});
