import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/atoms/Logo';

describe('Logo', () => {
  it('rend l’image avec alt "OpenLab Consulting"', () => {
    render(<Logo />);
    const img = screen.getByRole('img', { name: /OpenLab Consulting/i });
    expect(img).toBeInTheDocument();
  });

  it('pointe sur /OPENLAB.png', () => {
    render(<Logo />);
    const img = screen.getByRole('img', { name: /OpenLab Consulting/i });
    // next/image génère un src optimisé, on vérifie juste la présence
    // du nom de fichier source dans le src attribute.
    expect(img.getAttribute('src') ?? '').toMatch(/OPENLAB\.png/i);
  });

  it.each(['sm', 'md', 'lg'] as const)('applique la taille %s', (size) => {
    render(<Logo size={size} />);
    const img = screen.getByRole('img', { name: /OpenLab Consulting/i });
    const expected = { sm: /h-6/, md: /h-9/, lg: /h-12/ }[size];
    expect(img.className).toMatch(expected);
  });

  it('merge correctement la className personnalisée', () => {
    render(<Logo className="opacity-50" />);
    const img = screen.getByRole('img', { name: /OpenLab Consulting/i });
    expect(img.className).toMatch(/opacity-50/);
  });
});
