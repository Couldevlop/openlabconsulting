import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Mockup } from '@/components/atoms/Mockup';

describe('Mockup atom', () => {
  it('affiche le label dans la barre du chrome (variant browser)', () => {
    render(<Mockup variant="browser" label="openlabconsulting.com" />);
    expect(screen.getByText(/openlabconsulting\.com/i)).toBeInTheDocument();
  });

  it('rend les children si src n’est pas fourni', () => {
    render(
      <Mockup variant="dashboard" label="NexusRH">
        <div data-testid="custom-svg">SVG mock</div>
      </Mockup>,
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('expose la variante dans le DOM', () => {
    render(<Mockup variant="app" label="NexusRH" />);
    expect(screen.getByText('app')).toBeInTheDocument();
  });
});
