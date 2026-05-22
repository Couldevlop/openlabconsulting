import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FraudShieldMockup } from '@/components/mockups/FraudShieldMockup';

describe('FraudShieldMockup', () => {
  it('rend un SVG avec aria-label « Fraud Shield »', () => {
    render(<FraudShieldMockup />);
    expect(
      screen.getByRole('img', { name: /Fraud Shield/i }),
    ).toBeInTheDocument();
  });
});
