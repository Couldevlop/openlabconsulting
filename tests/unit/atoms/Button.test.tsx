import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/atoms/Button';

describe('Button', () => {
  it('rend un <button> par défaut', () => {
    render(<Button>OK</Button>);
    const el = screen.getByRole('button', { name: 'OK' });
    expect(el.tagName).toBe('BUTTON');
    expect(el.getAttribute('type')).toBe('button');
  });

  it('rend un <a> quand as="a" + href', () => {
    render(
      <Button as="a" href="/audit-ia">
        CTA
      </Button>,
    );
    const el = screen.getByRole('link', { name: 'CTA' });
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('href')).toBe('/audit-ia');
  });

  it.each(['primary', 'secondary', 'ghost'] as const)(
    'applique la variante %s',
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      const el = screen.getByRole('button');
      const expected = {
        primary: /color-ol-orange/,
        secondary: /color-ol-night/,
        ghost: /bg-transparent/,
      }[variant];
      expect(el.className).toMatch(expected);
    },
  );

  it.each(['sm', 'md', 'lg'] as const)('applique la taille %s', (size) => {
    render(<Button size={size}>x</Button>);
    const expected = { sm: /min-h-9/, md: /min-h-11/, lg: /min-h-12/ }[size];
    expect(screen.getByRole('button').className).toMatch(expected);
  });

  it('respecte la cible tactile ≥ 44 px en md (min-h-11)', () => {
    render(<Button size="md">tap</Button>);
    expect(screen.getByRole('button').className).toMatch(/min-h-11/);
  });

  it('déclenche onClick au clic', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>clic</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled empêche le clic et applique opacity-50', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        clic
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button').className).toMatch(/opacity-50/);
  });
});
