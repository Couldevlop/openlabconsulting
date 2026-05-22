import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgrosenseMockup } from '@/components/mockups/AgrosenseMockup';

describe('AgrosenseMockup', () => {
  it('rend un SVG avec aria-label « AgroSense »', () => {
    render(<AgrosenseMockup />);
    expect(screen.getByRole('img', { name: /AgroSense/i })).toBeInTheDocument();
  });
});
