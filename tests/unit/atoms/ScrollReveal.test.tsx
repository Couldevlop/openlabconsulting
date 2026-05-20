import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollReveal } from '@/components/atoms/ScrollReveal';

describe('ScrollReveal atom', () => {
  it('rend les enfants', () => {
    render(
      <ScrollReveal>
        <p>Le cacao se voit.</p>
      </ScrollReveal>,
    );
    expect(screen.getByText(/Le cacao se voit\./i)).toBeInTheDocument();
  });

  it('accepte une className custom', () => {
    const { container } = render(
      <ScrollReveal className="reveal-test">
        <span>x</span>
      </ScrollReveal>,
    );
    expect(container.firstChild).toHaveClass('reveal-test');
  });
});
