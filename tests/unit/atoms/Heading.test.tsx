import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from '@/components/atoms/Heading';

describe('Heading', () => {
  it.each([1, 2, 3, 4] as const)('rend le tag h%i correspondant', (level) => {
    render(<Heading level={level}>Titre {level}</Heading>);
    const el = screen.getByRole('heading', { level });
    expect(el.tagName).toBe(`H${level}`);
  });

  it('utilise la taille visuelle override si fournie', () => {
    render(
      <Heading level={2} visualLevel={1}>
        Visuel h1
      </Heading>,
    );
    const el = screen.getByRole('heading', { level: 2 });
    expect(el.className).toMatch(/text-4xl|text-5xl|text-6xl/);
  });

  it('applique la police display', () => {
    render(<Heading level={1}>X</Heading>);
    expect(screen.getByRole('heading', { level: 1 }).className).toMatch(
      /font-\[family-name:var\(--font-display\)\]/,
    );
  });
});
