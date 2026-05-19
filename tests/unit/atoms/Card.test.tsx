import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/atoms/Card';

describe('Card', () => {
  it('rend un div par défaut avec bordure et padding', () => {
    render(
      <Card data-testid="c">
        <span>inner</span>
      </Card>,
    );
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/rounded-lg/);
    expect(el.className).toMatch(/border/);
    expect(el.className).toMatch(/bg-white/);
  });

  it.each(['article', 'li', 'section'] as const)(
    'rend un tag %s via as',
    (tag) => {
      render(
        <Card as={tag} data-testid="c">
          x
        </Card>,
      );
      expect(screen.getByTestId('c').tagName).toBe(tag.toUpperCase());
    },
  );

  it('n’applique PAS les styles d’interaction par défaut', () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId('c').className).not.toMatch(/hover:-translate-y/);
  });

  it('applique les styles d’interaction quand interactive=true', () => {
    render(
      <Card interactive data-testid="c">
        x
      </Card>,
    );
    const cls = screen.getByTestId('c').className;
    expect(cls).toMatch(/hover:-translate-y/);
    expect(cls).toMatch(/transition-all/);
  });

  it('merge correctement la className', () => {
    render(
      <Card className="custom-class" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId('c').className).toMatch(/custom-class/);
  });
});
