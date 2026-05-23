import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuditIaPage from '@/app/(site)/audit-ia/page';

describe('Page /audit-ia (refonte avec questionnaire interactif, audit P2 §7 #14)', () => {
  it('rend un h1 mentionnant « gagner du temps »', () => {
    render(<AuditIaPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/gagner du temps/i);
  });

  it('expose les 3 étapes du process (refonte questionnaire)', () => {
    render(<AuditIaPage />);
    expect(screen.getByText(/Questionnaire · 3 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommandation instantanée/i)).toBeInTheDocument();
    expect(screen.getByText(/Consultant senior · 48 h/i)).toBeInTheDocument();
  });

  it('embarque le questionnaire interactif AuditIaQuizWizard', () => {
    render(<AuditIaPage />);
    expect(screen.getByTestId('audit-ia-quiz')).toBeInTheDocument();
    // Première question affichée par défaut
    expect(screen.getByText(/Question 1 sur 5/i)).toBeInTheDocument();
  });
});
