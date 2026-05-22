import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SygescomMockup } from '@/components/mockups/SygescomMockup';

describe('SygescomMockup', () => {
  it('rend un SVG avec aria-label « SYGESCOM »', () => {
    render(<SygescomMockup />);
    expect(screen.getByRole('img', { name: /SYGESCOM/i })).toBeInTheDocument();
  });
});
