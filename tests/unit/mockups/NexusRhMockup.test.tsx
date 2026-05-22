import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NexusRhMockup } from '@/components/mockups/NexusRhMockup';

describe('NexusRhMockup', () => {
  it('rend le SVG avec aria-label', () => {
    const { container } = render(<NexusRhMockup />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
  });

  it('a un aria-label descriptif (dashboard paie NexusRH)', () => {
    render(<NexusRhMockup />);
    expect(
      screen.getByRole('img', { name: /dashboard paie NexusRH/i }),
    ).toBeInTheDocument();
  });
});
