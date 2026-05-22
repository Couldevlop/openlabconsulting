import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContactPage from '@/app/contact/page';

describe('Page /contact', () => {
  it('rend un h1 unique mentionnant « projet IA »', () => {
    render(<ContactPage />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toMatch(/projet IA/i);
  });

  it('expose les contacts email + téléphone (liens mailto/tel)', () => {
    render(<ContactPage />);
    // Au moins un lien mailto.
    const mailtos = screen.getAllByRole('link', {
      name: /@openlabconsulting/i,
    });
    expect(mailtos.length).toBeGreaterThan(0);
    // Au moins un lien tel:
    const tels = document.querySelectorAll('a[href^="tel:"]');
    expect(tels.length).toBeGreaterThan(0);
  });

  it('inclut le formulaire de contact (label form)', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('form', { name: /Formulaire de contact/i }),
    ).toBeInTheDocument();
  });

  it('le main porte l’ancre #main', () => {
    render(<ContactPage />);
    expect(screen.getByRole('main').id).toBe('main');
  });
});
