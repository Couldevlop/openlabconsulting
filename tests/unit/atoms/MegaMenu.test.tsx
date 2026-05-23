import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MegaMenu } from '@/components/atoms/MegaMenu';
import type { MegaMenuConfig } from '@/lib/navigation';

const TEST_CONFIG: MegaMenuConfig = {
  label: 'Test Menu',
  overview: {
    href: '/test',
    label: 'Vue d’ensemble',
    description: 'Description de test',
  },
  sections: [
    {
      eyebrow: 'Catégorie A',
      links: [
        { href: '/test/a1', label: 'Item A1', description: 'Desc A1' },
        { href: '/test/a2', label: 'Item A2' },
      ],
    },
    {
      eyebrow: 'Catégorie B',
      links: [{ href: '/test/b1', label: 'Item B1' }],
    },
  ],
  cta: { href: '/test-cta', label: 'CTA final →' },
};

describe('MegaMenu', () => {
  it('rend le bouton avec le label et chevron, fermé par défaut', () => {
    render(<MegaMenu config={TEST_CONFIG} />);
    const button = screen.getByRole('button', { name: /Test Menu/i });
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-haspopup')).toBe('true');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('ouvre le panneau au click', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    await user.click(screen.getByRole('button', { name: /Test Menu/i }));
    expect(
      screen
        .getByRole('button', { name: /Test Menu/i })
        .getAttribute('aria-expanded'),
    ).toBe('true');
    expect(
      screen.getByRole('region', { name: /Sous-menu Test Menu/i }),
    ).toBeInTheDocument();
  });

  it('referme au second click', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    const button = screen.getByRole('button', { name: /Test Menu/i });
    await user.click(button);
    expect(screen.getByRole('region')).toBeInTheDocument();
    await user.click(button);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('expose le lien Vue d’ensemble vers le hub', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    await user.click(screen.getByRole('button', { name: /Test Menu/i }));
    const overview = screen.getByRole('link', { name: /Vue d.ensemble/i });
    expect(overview.getAttribute('href')).toBe('/test');
  });

  it('liste tous les liens de toutes les sections', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    await user.click(screen.getByRole('button', { name: /Test Menu/i }));
    expect(screen.getByRole('link', { name: /Item A1/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Item A2/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Item B1/i })).toBeInTheDocument();
  });

  it('affiche les eyebrows des sections', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    await user.click(screen.getByRole('button', { name: /Test Menu/i }));
    expect(screen.getByText(/Catégorie A/i)).toBeInTheDocument();
    expect(screen.getByText(/Catégorie B/i)).toBeInTheDocument();
  });

  it('expose le CTA final si configuré', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    await user.click(screen.getByRole('button', { name: /Test Menu/i }));
    const cta = screen.getByRole('link', { name: /CTA final/i });
    expect(cta.getAttribute('href')).toBe('/test-cta');
  });

  it('ferme au clic en dehors du composant', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <MegaMenu config={TEST_CONFIG} />
        <div data-testid="outside">Outside</div>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: /Test Menu/i }));
    expect(screen.getByRole('region')).toBeInTheDocument();
    // mousedown pour matcher le listener du composant
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('ferme au clavier Escape', async () => {
    const user = userEvent.setup();
    render(<MegaMenu config={TEST_CONFIG} />);
    const button = screen.getByRole('button', { name: /Test Menu/i });
    await user.click(button);
    expect(screen.getByRole('region')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
