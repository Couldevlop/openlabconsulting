import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Reassurance } from '@/components/sections/Reassurance';

describe('Reassurance (homepage §6.2)', () => {
  it('rend une section nommée "Clients et partenaires"', () => {
    render(<Reassurance />);
    const section = screen.getByRole('region', {
      name: /Clients et partenaires/i,
    });
    expect(section.getAttribute('data-testid')).toBe('reassurance');
  });

  it('affiche l’eyebrow d’introduction', () => {
    render(<Reassurance />);
    expect(
      screen.getByText(/Ils nous accompagnent depuis le terrain/i),
    ).toBeInTheDocument();
  });

  it('expose les 4 logos clients avec alt textuel', () => {
    render(<Reassurance />);
    const section = screen.getByTestId('reassurance');
    const list = within(section).getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);

    expect(
      within(section).getByRole('img', { name: /SIDO/i }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('img', { name: /HCI/i }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('img', { name: /Sertemef/i }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('img', { name: /DOCI/i }),
    ).toBeInTheDocument();
  });

  it('pointe sur les SVG self-hosted dans /logos/', () => {
    render(<Reassurance />);
    const sido = screen.getByRole('img', { name: /SIDO/i });
    expect(sido.getAttribute('src')).toContain('/logos/sido.svg');
  });
});
