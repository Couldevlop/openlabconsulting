import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MentionsLegalesPage from '@/app/(site)/mentions-legales/page';

describe('Page /mentions-legales', () => {
  it('rend un h1 « Informations légales »', () => {
    render(<MentionsLegalesPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/Informations légales/i);
  });

  it('mentionne le RCCM, hébergeur et propriété intellectuelle', () => {
    render(<MentionsLegalesPage />);
    expect(screen.getByText(/RCCM/i)).toBeInTheDocument();
    expect(screen.getByText(/Hetzner/i)).toBeInTheDocument();
    expect(screen.getByText(/Propriété intellectuelle/i)).toBeInTheDocument();
  });

  it('expose un lien mailto vers le contact OpenLab', () => {
    render(<MentionsLegalesPage />);
    const mailtos = document.querySelectorAll('a[href^="mailto:"]');
    expect(mailtos.length).toBeGreaterThan(0);
  });
});
