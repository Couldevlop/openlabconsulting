import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/components/atoms/Badge';

describe('Badge', () => {
  it('rend un span avec le contenu', () => {
    render(<Badge>En production</Badge>);
    const el = screen.getByText('En production');
    expect(el.tagName).toBe('SPAN');
    expect(el.className).toMatch(/rounded-full/);
  });

  it.each(['production', 'pilot', 'mvp', 'dev', 'neutral', 'orange'] as const)(
    'applique la tonalité %s',
    (tone) => {
      render(<Badge tone={tone}>{tone}</Badge>);
      const expected = {
        production: /color-ol-success/,
        pilot: /color-ol-info/,
        mvp: /color-ol-orange/,
        dev: /color-ol-graphite/,
        neutral: /color-ol-mist/,
        orange: /color-ol-orange/,
      }[tone];
      expect(screen.getByText(tone).className).toMatch(expected);
    },
  );

  it('merge correctement className', () => {
    render(<Badge className="custom">x</Badge>);
    expect(screen.getByText('x').className).toMatch(/custom/);
  });
});
