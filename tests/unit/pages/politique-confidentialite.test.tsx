import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PolitiqueConfidentialitePage from '@/app/(site)/politique-confidentialite/page';

describe('Page /politique-confidentialite', () => {
  it('rend un h1 « Politique de confidentialité »', () => {
    render(<PolitiqueConfidentialitePage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/Politique de confidentialité/i);
  });

  it('mentionne le cadre RGPD et loi ivoirienne 2013-450', () => {
    render(<PolitiqueConfidentialitePage />);
    expect(screen.getAllByText(/RGPD/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2013-450/i).length).toBeGreaterThan(0);
  });

  it('liste les droits (Accès, Rectification, Effacement)', () => {
    render(<PolitiqueConfidentialitePage />);
    expect(screen.getAllByText(/Accès/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rectification/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Effacement/i).length).toBeGreaterThan(0);
  });
});
