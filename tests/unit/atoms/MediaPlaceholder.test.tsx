import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MediaPlaceholder } from '@/components/atoms/MediaPlaceholder';

describe('MediaPlaceholder', () => {
  it('rend le placeholder typé quand src est null', () => {
    render(<MediaPlaceholder src={null} alt="Capture SYGESCOM" />);
    const el = screen.getByRole('img', {
      name: /Capture SYGESCOM — capture à venir/i,
    });
    expect(el).toBeInTheDocument();
    // Pas de <img> tag : c'est un div role=img
    expect(el.tagName).toBe('DIV');
  });

  it('affiche le label optionnel sur le placeholder', () => {
    render(
      <MediaPlaceholder
        src={null}
        alt="Avant"
        placeholderLabel="Capture avant"
      />,
    );
    expect(screen.getByText(/Capture avant/i)).toBeInTheDocument();
  });

  it.each(['cold', 'warm', 'neutral'] as const)(
    'applique la tonalité %s sur le placeholder',
    (tone) => {
      render(<MediaPlaceholder src={null} alt="x" tone={tone} />);
      const el = screen.getByRole('img');
      const expected = {
        cold: /from-\[var\(--color-ol-mist\)\]/,
        warm: /from-\[var\(--color-ol-orange\)\]/,
        neutral: /from-\[var\(--color-ol-mist\)\]/,
      }[tone];
      expect(el.className).toMatch(expected);
    },
  );

  it.each(['16/9', '4/3', '1/1', '3/2'] as const)(
    'applique le ratio %s',
    (aspect) => {
      render(<MediaPlaceholder src={null} alt="x" aspect={aspect} />);
      const el = screen.getByRole('img');
      const expected = {
        '16/9': /aspect-video/,
        '4/3': /aspect-\[4\/3\]/,
        '1/1': /aspect-square/,
        '3/2': /aspect-\[3\/2\]/,
      }[aspect];
      expect(el.className).toMatch(expected);
    },
  );

  it('bascule sur next/image dès que src est fourni', () => {
    render(<MediaPlaceholder src="/test-image.png" alt="Capture réelle" />);
    // next/image rend un <img> avec l'alt fourni.
    const img = screen.getByRole('img', { name: /Capture réelle/i });
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src') ?? '').toMatch(/test-image\.png/);
  });
});
