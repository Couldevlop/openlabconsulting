import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuditIaPage from '@/app/audit-ia/page';

describe('Page /audit-ia', () => {
  it('rend un h1 mentionnant « gagner du temps »', () => {
    render(<AuditIaPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/gagner du temps/i);
  });

  it('expose les 3 étapes du process', () => {
    render(<AuditIaPage />);
    expect(screen.getByText(/Cadrage initial/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit terrain/i)).toBeInTheDocument();
    expect(screen.getByText(/Livrable PDF/i)).toBeInTheDocument();
  });

  it('inclut la section AuditIaCta (réutilisation §6.10)', () => {
    render(<AuditIaPage />);
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
