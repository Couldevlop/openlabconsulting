import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Container } from '@/components/atoms/Container';

describe('Container', () => {
  it('rend un div par défaut avec largeur default', () => {
    render(
      <Container data-testid="c">
        <span>inner</span>
      </Container>,
    );
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/max-w-6xl/);
    expect(el.className).toMatch(/mx-auto/);
  });

  it('accepte un tag custom via as', () => {
    render(
      <Container as="section" data-testid="c">
        x
      </Container>,
    );
    expect(screen.getByTestId('c').tagName).toBe('SECTION');
  });

  it.each(['narrow', 'wide', 'full'] as const)(
    'applique la largeur %s',
    (width) => {
      render(
        <Container width={width} data-testid="c">
          x
        </Container>,
      );
      const cls = screen.getByTestId('c').className;
      const expected = {
        narrow: /max-w-3xl/,
        wide: /max-w-7xl/,
        full: /max-w-none/,
      }[width];
      expect(cls).toMatch(expected);
    },
  );

  it('merge correctement className personnalisée', () => {
    render(
      <Container className="bg-red-500" data-testid="c">
        x
      </Container>,
    );
    expect(screen.getByTestId('c').className).toMatch(/bg-red-500/);
  });
});
