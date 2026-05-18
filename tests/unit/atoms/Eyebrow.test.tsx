import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Eyebrow } from '@/components/atoms/Eyebrow';

describe('Eyebrow', () => {
  it('rend en uppercase avec tracking-widest', () => {
    render(<Eyebrow>Phase</Eyebrow>);
    const el = screen.getByText('Phase');
    expect(el.className).toMatch(/uppercase/);
    expect(el.className).toMatch(/tracking-widest/);
  });

  it.each(['orange', 'ivory', 'graphite'] as const)(
    'applique la tonalité %s',
    (tone) => {
      render(<Eyebrow tone={tone}>x</Eyebrow>);
      const el = screen.getByText('x');
      const expected = {
        orange: /color-ol-orange/,
        ivory: /color-ol-ivory/,
        graphite: /color-ol-graphite/,
      }[tone];
      expect(el.className).toMatch(expected);
    },
  );
});
