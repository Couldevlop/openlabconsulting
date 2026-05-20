import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Marquee } from '@/components/atoms/Marquee';

describe('Marquee atom', () => {
  it('rend les enfants dans le DOM', () => {
    render(
      <Marquee>
        <span data-testid="marquee-item">OpenLab</span>
      </Marquee>,
    );
    // Le marquee duplique le contenu DOM pour la boucle infinie ; on s’assure
    // qu’on a au moins une occurrence (la seconde est aria-hidden et reste).
    const items = screen.getAllByTestId('marquee-item');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('accepte une className custom sur le wrapper', () => {
    const { container } = render(
      <Marquee className="ring-test">
        <span>x</span>
      </Marquee>,
    );
    expect(container.firstChild).toHaveClass('ring-test');
  });
});
